const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { ObjectId } = require("mongodb");
const { Readable } = require("stream");
const Document = require("../models/Document");
const { getBucket, connect } = require("../config/mongo");

// allowed extensions and mime types
const ALLOWED_EXT = [".pdf", ".docx", ".doc"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ALLOWED_TYPES = Document.DOCUMENT_TYPES;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// middleware to handle multipart/form-data with field name files
exports.uploadMiddleware = upload.array("files");

// controller to handle upload
exports.handleUpload = async (req, res) => {
  try {
    const files = req.files;
    const user_id = req.body.user_id;
    const typePayload = req.body.file_type;
    const file_type = Array.isArray(typePayload)
      ? typePayload[0]
      : typeof typePayload === "string"
      ? typePayload.trim()
      : "";

    if (!user_id) return res.status(400).json({ msg: "user_id required" });
    if (!files || files.length === 0)
      return res.status(400).json({ msg: "No files uploaded" });
    if (!file_type)
      return res.status(400).json({ msg: "file_type is required" });
    if (!ALLOWED_TYPES.includes(file_type))
      return res.status(400).json({ msg: "Invalid file_type" });

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
        metadata: { user_id: user_id.toString(), file_type },
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
                file_type,
                file_size: f.size,
                mongo_file_id: uploadStream.id.toString(),
              });

              results.push({
                id: doc.id,
                file_name: doc.file_name,
                file_type: doc.file_type,
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

// POST /api/upload/export -> export all user documents into Processing/uploads/{type}
exports.exportUserDocuments = async (req, res) => {
  try {
    const user_id = req.body.user_id || req.params.user_id;
    if (!user_id) return res.status(400).json({ msg: "user_id required" });

    let bucket;
    try {
      bucket = getBucket();
    } catch (err) {
      await connect();
      bucket = getBucket();
    }

    const docs = await Document.findAll({ where: { user_id } });
    if (!docs || docs.length === 0) {
      console.log(`⚠️  No documents found in database for user ${user_id}`);
      return res.json({ msg: "No documents found for user", count: 0 });
    }

    console.log(
      `📦 Found ${docs.length} documents for user ${user_id} in database`
    );

    const baseDir = path.resolve(__dirname, "../../Processing/uploads");
    await fs.promises.mkdir(baseDir, { recursive: true });

    let savedCount = 0;

    for (const doc of docs) {
      const bucketType = doc.file_type || "Miscellaneous";
      const safeType = bucketType.replace(/[^a-z0-9_-]/gi, "_");
      const typeDir = path.join(baseDir, safeType);
      await fs.promises.mkdir(typeDir, { recursive: true });

      let objectId;
      try {
        objectId = new ObjectId(doc.mongo_file_id);
      } catch (err) {
        continue;
      }

      const originalName = path.basename(doc.file_name || "document");
      const filename = `${user_id}_${originalName}`;
      const filePath = path.join(typeDir, filename);

      console.log(`📁 Exporting: ${filename} to ${typeDir}`);

      await new Promise((resolve, reject) => {
        const downloadStream = bucket.openDownloadStream(objectId);
        const writeStream = fs.createWriteStream(filePath);

        downloadStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);

        downloadStream.pipe(writeStream);
      });

      savedCount += 1;
      console.log(`✅ Saved: ${filename}`);
    }

    res.json({
      msg: "Documents exported successfully",
      count: savedCount,
      baseDir,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/upload/list/:userId -> list all documents for a user
exports.listUserDocuments = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ msg: "userId required" });

    const docs = await Document.findAll({ where: { user_id: userId } });

    res.json({
      count: docs.length,
      documents: docs.map((d) => ({
        id: d.id,
        fileName: d.file_name,
        fileType: d.file_type,
        fileSize: d.file_size,
        uploadDate: d.upload_date,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
