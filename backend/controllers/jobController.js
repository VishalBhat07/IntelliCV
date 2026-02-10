const JobDescription = require("../models/JobDescription");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const mammoth = require("mammoth");

// ── helpers ──────────────────────────────────────────────────────────────

/**
 * Extract text from a PDF buffer using pdfjs-dist.
 */
async function extractPdfText(buffer) {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return fullText.trim();
}

/**
 * Extract text from a DOCX buffer using mammoth.
 */
async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || "").trim();
}

/**
 * Detect file type from originalname and call the right extractor.
 */
async function extractTextFromBuffer(buffer, originalname) {
  const ext = (originalname || "").toLowerCase().split(".").pop();
  if (ext === "pdf") {
    return extractPdfText(buffer);
  }
  if (ext === "docx" || ext === "doc") {
    return extractDocxText(buffer);
  }
  throw new Error(`Unsupported file type: .${ext}`);
}

// ── controllers ──────────────────────────────────────────────────────────

// POST /api/job-description - Save job description (text) for a user
exports.saveJobDescription = async (req, res) => {
  try {
    const { user_id, description, title, company } = req.body;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ msg: "description is required" });
    }

    // Check if user already has a job description
    let jobDesc = await JobDescription.findOne({ where: { user_id } });

    if (jobDesc) {
      // Update existing job description
      await jobDesc.update({
        jd_text: description,
        title: title || "Job Position",
        company: company || null,
      });
    } else {
      // Create new job description
      jobDesc = await JobDescription.create({
        user_id,
        jd_text: description,
        title: title || "Job Position",
        company: company || null,
      });
    }

    res.json({
      msg: "Job description saved successfully",
      job_id: jobDesc.job_id,
      jobDescription: jobDesc,
    });
  } catch (error) {
    console.error("Error saving job description:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/job-description/extract - Upload a JD file, extract text, and save to MySQL
exports.extractAndSaveFromFile = async (req, res) => {
  try {
    const file = req.file; // single file from multer
    const user_id = req.body.user_id;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }
    if (!file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    console.log(
      `📄 Extracting text from JD file: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`
    );

    // Extract text from the uploaded file buffer
    const extractedText = await extractTextFromBuffer(
      file.buffer,
      file.originalname
    );

    if (!extractedText || !extractedText.trim()) {
      return res
        .status(400)
        .json({ msg: "Could not extract any text from the uploaded file" });
    }

    console.log(
      `✅ Extracted ${extractedText.length} characters from ${file.originalname}`
    );

    // Save/update in MySQL Job_Description table
    let jobDesc = await JobDescription.findOne({ where: { user_id } });

    if (jobDesc) {
      await jobDesc.update({
        jd_text: extractedText,
        file_name: file.originalname,
        file_size: file.size,
      });
    } else {
      jobDesc = await JobDescription.create({
        user_id,
        jd_text: extractedText,
        title: "Job Position",
        file_name: file.originalname,
        file_size: file.size,
      });
    }

    res.json({
      msg: "Job description extracted and saved successfully",
      job_id: jobDesc.job_id,
      extractedText,
      jobDescription: jobDesc,
    });
  } catch (error) {
    console.error("Error extracting JD from file:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/job-description/:user_id - Get job description for a user
exports.getJobDescription = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    const jobDesc = await JobDescription.findOne({ where: { user_id } });

    if (!jobDesc) {
      return res.status(404).json({ msg: "No job description found" });
    }

    res.json({ jobDescription: jobDesc });
  } catch (error) {
    console.error("Error fetching job description:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
