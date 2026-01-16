const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("dotenv").config();

const { sequelize } = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");
const educationRoutes = require("./routes/educationRoutes.js");
const jobRoutes = require("./routes/jobRoutes.js");
const resumeRoutes = require("./routes/resumeRoutes.js");
const { connect } = require("./config/mongo.js");
// ensure models are registered so sequelize can sync tables
require("./models/Document.js");
require("./models/Education.js");
require("./models/Certificate.js");
require("./models/Project.js");
require("./models/JobDescription.js");
require("./models/GeneratedResume.js");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

let browserPromise;

const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
};

const sanitizeFileName = (name) => {
  if (!name) {
    return `IntelliCV_Resume_${Date.now()}.pdf`;
  }
  return name.replace(/[^a-z0-9_.-]+/gi, "_");
};

const buildPdfHtml = (bodyHtml) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
          color-scheme: light;
        }

        @page {
          size: A4;
          margin: 15mm 12mm 18mm 12mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #222;
          background: #fff;
          margin: 0;
          padding: 0;
        }

        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          margin: 0 0 8px;
          color: #111827;
        }

        h1 { font-size: 20pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 13pt; }

        p {
          margin: 0 0 10px;
        }

        ul, ol {
          margin: 0 0 10px 18px;
          padding: 0;
        }

        ul {
          list-style-type: disc;
        }

        ol {
          list-style-type: decimal;
        }

        li {
          margin-bottom: 4px;
        }

        a {
          color: #2563eb;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        strong {
          font-weight: 600;
        }

        .resume-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 0;
        }

        .resume-container > *:last-child {
          margin-bottom: 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }

        th, td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
        }

        .page-break {
          break-after: page;
        }
      </style>
    </head>
    <body>
      <main class="resume-container">
        ${bodyHtml}
      </main>
    </body>
  </html>`;

// base route
app.get("/", (req, res) => {
  res.send("IntelliCV Backend is running...");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/job-description", jobRoutes);
app.use("/api/resume", resumeRoutes);

app.post("/api/export-pdf", async (req, res) => {
  const { html, fileName } = req.body || {};

  if (!html || typeof html !== "string") {
    return res.status(400).json({ message: "Resume HTML is required" });
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    const htmlDocument = buildPdfHtml(html);

    await page.setContent(htmlDocument, {
      waitUntil: ["load", "networkidle0"],
    });
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "14mm",
        left: "12mm",
      },
    });

    const safeFileName = sanitizeFileName(fileName);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("PDF export failed:", err);
    return res.status(500).json({ message: "Failed to export PDF" });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeErr) {
        console.warn("Failed to close Puppeteer page:", closeErr);
      }
    }
  }
});

const PORT = process.env.PORT;

const closeBrowser = async () => {
  if (!browserPromise) {
    return;
  }

  try {
    const browser = await browserPromise;
    if (browser && browser.isConnected()) {
      await browser.close();
    }
  } catch (err) {
    console.warn("Failed to close Puppeteer browser:", err);
  } finally {
    browserPromise = null;
  }
};

process.on("exit", () => {
  closeBrowser().catch(() => {});
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await closeBrowser();
    process.exit(0);
  });
});

// Connect to MongoDB first, then sync MySQL and start server
connect()
  .then(() => {
    console.log("Starting server... connecting to MongoDB");
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("MySQL Database Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
