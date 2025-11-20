const multer = require("multer");
const { Readable } = require("stream");
const Document = require("../models/Document");
const { getBucket } = require("../config/mongo");

// allowed extensions and mime types
const ALLOWED_EXT = [".pdf", ".docx", ".doc"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const storage = multer.memoryStorage();
const upload = multer({ storage });

// middleware to handle multipart/form-data with field name files
exports.uploadMiddleware = upload.array("files");

// controller to handle upload
exports.handleUpload = async (req, res) => {
  try {
    const files = req.files;
    const user_id = req.body.user_id;

    if (!user_id) return res.status(400).json({ msg: "user_id required" });
    if (!files || files.length === 0)
      return res.status(400).json({ msg: "No files uploaded" });

    // validate files
    for (const f of files) {
      const mimetype = f.mimetype;
      const name = f.originalname || "file";
      const ext = name
        .slice(((name.lastIndexOf(".") - 1) >>> 0) + 1)
        .toLowerCase();
      const dotExt = ext ? `.${ext}` : "";
      // accept if EITHER extension or mime matches; reject only if both don't match
      if (!ALLOWED_EXT.includes(dotExt) && !ALLOWED_MIME.includes(mimetype)) {
        return res.status(400).json({ msg: `Invalid file type: ${name}` });
      }
    }

    // use shared GridFSBucket from config
    let bucket;
    try {
      bucket = getBucket();
    } catch (err) {
      return res.status(500).json({ msg: "MongoDB not connected" });
    }

    const results = [];

    for (const f of files) {
      const stream = Readable.from(f.buffer);
      const uploadStream = bucket.openUploadStream(f.originalname, {
        contentType: f.mimetype,
        metadata: { user_id: user_id.toString() },
      });

      await new Promise((resolve, reject) => {
        stream
          .pipe(uploadStream)
          .on("error", (err) => reject(err))
          .on("finish", async () => {
            // save metadata to MySQL
            try {
              const doc = await Document.create({
                user_id: user_id,
                file_name: f.originalname,
                file_type: f.mimetype,
                file_size: f.size,
                mongo_file_id: uploadStream.id.toString(),
              });

              results.push({
                id: doc.id,
                file_name: doc.file_name,
                mongo_file_id: doc.mongo_file_id,
              });

              resolve();
            } catch (err) {
              reject(err);
            }
          });
      });
    }

    // keep the shared client open; closing handled by app lifecycle

    res.json({ msg: "Files uploaded", files: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/upload/:id -> stream file from GridFS by mongo_file_id
exports.streamFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: "mongo_file_id required" });

    let bucket;
    try {
      bucket = getBucket();
    } catch (err) {
      return res.status(500).json({ msg: "MongoDB not connected" });
    }

    const { ObjectId } = require("mongodb");
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return res.status(400).json({ msg: "Invalid mongo_file_id" });
    }

    // Try to lookup file metadata to set headers
    const cursor = bucket.find({ _id: objectId });
    const files = await cursor.toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ msg: "File not found" });
    }
    const file = files[0];

    if (file.contentType) {
      res.setHeader("Content-Type", file.contentType);
    }
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on("error", (err) => {
      return res.status(500).json({ msg: "Error streaming file" });
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
