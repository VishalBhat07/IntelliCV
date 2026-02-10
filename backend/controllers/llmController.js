const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const fs = require("fs").promises;
const path = require("path");
const { ObjectId } = require("mongodb");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const Certificate = require("../models/Certificate");
const Project = require("../models/Project");
const User = require("../models/User");
const Education = require("../models/Education");
const JobDescription = require("../models/JobDescription");
const GeneratedResume = require("../models/GeneratedResume");
const Document = require("../models/Document");
const { sequelize } = require("../config/db");
const { getBucket, connect } = require("../config/mongo");
const {
  generateResumeEmbeddings,
  performSimilaritySearch,
  generateEmbedding,
  cosineSimilarity,
  EMBEDDING_DIM,
} = require("../utils/vectorEmbeddings");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Global rate limiter - tracks last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests for safety

// Request lock to prevent duplicate concurrent requests
const processingLocks = new Map();

// Helper function to check if request is already processing
function isProcessing(userId) {
  return processingLocks.has(userId);
}

// Helper function to set processing lock
function setProcessingLock(userId) {
  processingLocks.set(userId, Date.now());
}

// Helper function to release processing lock
function releaseProcessingLock(userId) {
  processingLocks.delete(userId);
}

// Helper function to wait before making request
async function throttleRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(
      `⏱️  Throttling: Waiting ${(waitTime / 1000).toFixed(
        1,
      )}s before next request...`,
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

// Parse retry delay from error response
function parseRetryDelay(error) {
  try {
    // Check if error has retryDelay in errorDetails
    if (error.errorDetails) {
      const retryInfo = error.errorDetails.find(
        (detail) =>
          detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo",
      );

      if (retryInfo && retryInfo.retryDelay) {
        // Parse delay string like "4s" or "11.493620915s"
        const delayStr = retryInfo.retryDelay.replace("s", "");
        const delaySeconds = parseFloat(delayStr);
        return Math.ceil(delaySeconds * 1000); // Convert to ms and round up
      }
    }

    // Check error message for retry time
    const match = error.message?.match(/retry in ([0-9.]+)s/);
    if (match) {
      return Math.ceil(parseFloat(match[1]) * 1000);
    }
  } catch (e) {
    console.log("Could not parse retry delay:", e.message);
  }

  return null;
}

// Helper function to retry API calls with exponential backoff and adaptive delays
async function retryWithBackoff(fn, maxRetries = 5, initialDelay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Throttle request before attempting
      await throttleRequest();
      return await fn();
    } catch (error) {
      const isRateLimitError =
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("Too Many Requests");

      if (isRateLimitError && i < maxRetries - 1) {
        // Try to get suggested retry delay from API response
        const suggestedDelay = parseRetryDelay(error);

        // Use suggested delay if available, otherwise exponential backoff
        const delay = suggestedDelay || initialDelay * Math.pow(2, i);

        console.log(
          `🔄 Rate limit hit. Retrying in ${(delay / 1000).toFixed(
            1,
          )}s... (Attempt ${i + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Extract text from PDF using pdfjs-dist
async function extractPdfText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = new Uint8Array(dataBuffer);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error.message);
    return "";
  }
}

// Extract text from uploaded documents
async function extractTextFromDocuments(userId, allowedFilenames = null) {
  const uploadsDir = path.join(__dirname, "../../Processing/uploads");

  // If allowedFilenames is provided, only extract those files
  const shouldExtract = (filename) => {
    if (!allowedFilenames || allowedFilenames.length === 0) return true;
    return allowedFilenames.includes(filename);
  };

  const result = {
    certificates: [],
    projects: [],
    other: [],
  };

  try {
    // Check if uploads directory exists
    await fs.access(uploadsDir);

    // Process certificates
    const certDir = path.join(uploadsDir, "Certificates");
    try {
      await fs.access(certDir);
      const certFiles = await fs.readdir(certDir);

      for (const file of certFiles) {
        if (
          file.startsWith(`${userId}_`) &&
          file.toLowerCase().endsWith(".pdf") &&
          shouldExtract(file)
        ) {
          const filePath = path.join(certDir, file);
          console.log(`📄 Extracting certificate: ${file}`);
          const text = await extractPdfText(filePath);
          result.certificates.push({ fileName: file, text });
        }
      }
    } catch (err) {
      console.log(`No certificates directory or files for us1r ${userId}`);
    }

    // Process projects
    const projDir = path.join(uploadsDir, "Project");
    try {
      await fs.access(projDir);
      const projFiles = await fs.readdir(projDir);

      for (const file of projFiles) {
        if (
          file.startsWith(`${userId}_`) &&
          file.toLowerCase().endsWith(".pdf") &&
          shouldExtract(file)
        ) {
          const filePath = path.join(projDir, file);
          console.log(`📄 Extracting project: ${file}`);
          const text = await extractPdfText(filePath);
          result.projects.push({ fileName: file, text });
        }
      }
    } catch (err) {
      console.log(`No projects directory or files for user ${userId}`);
    }

    // Process other documents
    const otherDir = path.join(uploadsDir, "Other");
    try {
      await fs.access(otherDir);
      const otherFiles = await fs.readdir(otherDir);

      for (const file of otherFiles) {
        if (
          file.startsWith(`${userId}_`) &&
          file.toLowerCase().endsWith(".pdf") &&
          shouldExtract(file)
        ) {
          const filePath = path.join(otherDir, file);
          console.log(`📄 Extracting other document: ${file}`);
          const text = await extractPdfText(filePath);
          result.other.push({ fileName: file, text });
        }
      }
    } catch (err) {
      console.log(`No other documents directory or files for user ${userId}`);
    }

    console.log("\n=== DOCUMENT EXTRACTION SUMMARY ===");
    console.log(`Certificates found: ${result.certificates.length}`);
    console.log(`Projects found: ${result.projects.length}`);
    console.log(`Other documents found: ${result.other.length}`);
    console.log("===================================\n");

    return result;
  } catch (error) {
    console.error("Error in extractTextFromDocuments:", error);
    throw error;
  }
}

// Generate Sequelize queries using LLM
async function generateQueriesWithLLM(extractedData, userId) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Check if there's any actual document content
    const totalDocs =
      extractedData.certificates.length +
      extractedData.projects.length +
      extractedData.other.length;

    if (totalDocs === 0) {
      console.log(
        "⚠️  No documents found to process. Skipping LLM query generation.",
      );
      return [];
    }

    // Prepare document content with text truncation to avoid token limits
    const documentContent = [
      ...extractedData.certificates.map(
        (doc, idx) =>
          `Certificate ${idx + 1} (${doc.fileName}):\n${doc.text.substring(
            0,
            4000,
          )}`,
      ),
      ...extractedData.projects.map(
        (doc, idx) =>
          `Project ${idx + 1} (${doc.fileName}):\n${doc.text.substring(
            0,
            4000,
          )}`,
      ),
      ...extractedData.other.map(
        (doc, idx) =>
          `Other Document ${idx + 1} (${doc.fileName}):\n${doc.text.substring(
            0,
            4000,
          )}`,
      ),
    ].join("\n\n");

    if (!documentContent.trim()) {
      console.log(
        "⚠️  Extracted documents contain no text. Skipping LLM query generation.",
      );
      return [];
    }

    console.log(
      `\n📄 Sending ${documentContent.length} characters to LLM for analysis...\n`,
    );

    const prompt = `You are an expert backend engineer.

**CRITICAL: ONLY extract information that is explicitly written in the document text below. DO NOT invent or make up ANY data.**

Generate SQL INSERT queries ONLY for information that actually exists in these documents.

DATABASE SCHEMA:

1. Certificate table:
   - cert_id (INT, auto-increment, PRIMARY KEY)
   - user_id (INT, NOT NULL) - use ${userId}
   - title (VARCHAR, NOT NULL) - EXACT certificate name from document
   - issuing_org (VARCHAR) - EXACT organization name from document
   - issue_date (DATE) - format YYYY-MM-DD if date exists, otherwise NULL
   - file_path (VARCHAR) - use the fileName provided

2. Project table:
   - proj_id (INT, auto-increment, PRIMARY KEY)
   - user_id (INT, NOT NULL) - use ${userId}
   - title (VARCHAR, NOT NULL) - EXACT project name from document
   - description (TEXT) - EXACT description from document
   - tech_stack (VARCHAR) - comma-separated technologies ONLY if mentioned
   - duration (VARCHAR) - EXACT duration if mentioned, otherwise NULL

**STRICT RULES:**
1. ONLY use text that is explicitly present in the documents below
2. If a document contains NO certificate/project information, skip it
3. If ALL documents have no extractable data, return: []
4. DO NOT create fake projects like "E-commerce Platform" or "Analytics Dashboard"
5. DO NOT invent dates, organizations, or technologies
6. Use EXACT names and descriptions from the text

OUTPUT FORMAT (JSON ARRAY):
[
  {
    "type": "Certificate" or "Project",
    "query": "INSERT INTO Certificate (user_id, title, issuing_org, issue_date, file_path) VALUES (...);"
  }
]

Document Content:
${documentContent}`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const generatedText = response.text();

    // Extract JSON from response
    let queries = [];
    try {
      // Try to find JSON array in the response
      const startIdx = generatedText.indexOf("[");
      const endIdx = generatedText.lastIndexOf("]") + 1;

      if (startIdx !== -1 && endIdx > startIdx) {
        const jsonText = generatedText.substring(startIdx, endIdx);
        queries = JSON.parse(jsonText);
      } else {
        // Fallback: try parsing entire response
        queries = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.log("Raw response:", generatedText);

      // Fallback: extract SQL statements directly
      const sqlStatements = generatedText
        .split("\n")
        .filter((line) => line.trim().startsWith("INSERT INTO"))
        .map((line) =>
          line
            .trim()
            .replace(/```sql|```/g, "")
            .trim(),
        );

      queries = sqlStatements.map((sql) => ({
        type: sql.includes("Certificate") ? "Certificate" : "Project",
        query: sql,
      }));
    }

    // Extract just the SQL statements
    const sqlStatements = queries
      .map((q) => q.query)
      .filter((q) => q && q.trim());

    // Print generated queries
    console.log("\n=== GENERATED SQL QUERIES ===");
    console.log(`Total queries generated: ${sqlStatements.length}`);
    sqlStatements.forEach((query, index) => {
      console.log(`\n${index + 1}. ${query}`);
    });
    console.log("\n=============================\n");

    return sqlStatements;
  } catch (error) {
    console.error("Error generating queries with LLM:", error);
    throw error;
  }
}

// Execute generated SQL queries
async function executeGeneratedQueries(sqlStatements) {
  const results = {
    successful: [],
    failed: [],
  };

  for (const sql of sqlStatements) {
    try {
      // Execute the raw SQL query
      await sequelize.query(sql, { type: sequelize.QueryTypes.INSERT });
      results.successful.push(sql);
    } catch (error) {
      console.error(`Failed to execute query: ${sql}`, error.message);
      results.failed.push({ sql, error: error.message });
    }
  }

  return results;
}

// Helper: Export documents from GridFS to filesystem
// If selectedDocIds is provided, only export those documents
async function exportDocumentsForUser(userId, selectedDocIds = null) {
  let bucket;
  try {
    bucket = getBucket();
  } catch (err) {
    await connect();
    bucket = getBucket();
  }

  let whereClause = { user_id: userId };

  // If specific document IDs are provided, filter by them
  if (
    selectedDocIds &&
    Array.isArray(selectedDocIds) &&
    selectedDocIds.length > 0
  ) {
    whereClause.id = selectedDocIds;
    console.log(`🎯 Filtering to ${selectedDocIds.length} selected documents`);
  }

  const docs = await Document.findAll({ where: whereClause });
  if (!docs || docs.length === 0) {
    console.log(`⚠️  No documents found in database for user ${userId}`);
    return 0;
  }

  console.log(`📦 Found ${docs.length} documents for user ${userId}`);

  const baseDir = path.resolve(__dirname, "../../Processing/uploads");
  await fs.mkdir(baseDir, { recursive: true });

  let exportedCount = 0;
  const exportedFilenames = [];

  for (const doc of docs) {
    const bucketType = doc.file_type || "Miscellaneous";
    const safeType = bucketType.replace(/[^a-z0-9_-]/gi, "_");
    const typeDir = path.join(baseDir, safeType);
    await fs.mkdir(typeDir, { recursive: true });

    let objectId;
    try {
      objectId = new ObjectId(doc.mongo_file_id);
    } catch (err) {
      console.log(`⚠️  Invalid ObjectId for document ${doc.id}`);
      continue;
    }

    const originalName = path.basename(doc.file_name || "document");
    const filename = `${userId}_${originalName}`;
    const filePath = path.join(typeDir, filename);

    try {
      await new Promise((resolve, reject) => {
        const downloadStream = bucket.openDownloadStream(objectId);
        const writeStream = require("fs").createWriteStream(filePath);

        downloadStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);

        downloadStream.pipe(writeStream);
      });

      exportedCount++;
      exportedFilenames.push(filename);
      console.log(`✅ Exported: ${filename}`);
    } catch (err) {
      console.log(`❌ Failed to export ${filename}:`, err.message);
    }
  }

  console.log(`📤 Exported ${exportedCount}/${docs.length} documents`);
  return { count: exportedCount, filenames: exportedFilenames };
}

// Helper: Get user data from database
async function getUserData(userId) {
  const user = await User.findOne({ where: { user_id: userId } });
  if (!user) throw new Error(`User ${userId} not found`);

  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ");

  return {
    name: fullName || "Unknown",
    email: user.email || "",
    skills: user.profile_summary || "",
  };
}

// Helper: Fetch all user data for resume generation
async function fetchAllUserData(userId) {
  const user = await User.findOne({ where: { user_id: userId } });
  const education = await Education.findAll({ where: { user_id: userId } });
  const certificates = await Certificate.findAll({
    where: { user_id: userId },
  });
  const projects = await Project.findAll({ where: { user_id: userId } });
  const jobDescription = await JobDescription.findOne({
    where: { user_id: userId },
  });

  return {
    user: user ? user.toJSON() : null,
    education: education.map((e) => e.toJSON()),
    certificates: certificates.map((c) => c.toJSON()),
    projects: projects.map((p) => p.toJSON()),
    jobDescription: jobDescription ? jobDescription.toJSON() : null,
  };
}

// Helper: Generate final resume with LLM
async function generateFinalResume(data, userId) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Construct full name from User model fields
  const userName = data.user
    ? [data.user.first_name, data.user.middle_name, data.user.last_name]
        .filter(Boolean)
        .join(" ")
    : "Unknown";

  const prompt = `Generate an ATS-optimized resume in STRUCTURED JSON format based on the following information:

USER DATA:
Name: ${userName}
Email: ${data.user?.email || ""}
Profile Summary: ${data.user?.profile_summary || "Not specified"}

EDUCATION:
${data.education
  .map(
    (e) => `
- ${e.degree} in ${e.field_of_study} from ${e.institution_name}
  Start Year: ${e.start_year || "N/A"}
  Completion Year: ${e.completion_year || "N/A"}
  Grade: ${e.grade || "N/A"}
  ${e.highlights ? `Highlights: ${JSON.stringify(e.highlights)}` : ""}
`,
  )
  .join("\n")}

CERTIFICATES:
${data.certificates
  .map(
    (c) => `
- ${c.title}
  Issued by: ${c.issuing_org || "N/A"}
  Date: ${c.issue_date || "N/A"}
`,
  )
  .join("\n")}

PROJECTS:
${data.projects
  .map(
    (p) => `
- ${p.title}
  Description: ${p.description || "N/A"}
  Technologies: ${p.tech_stack || "N/A"}
  Duration: ${p.duration || "N/A"}
`,
  )
  .join("\n")}

${
  data.jobDescription
    ? `TARGET JOB:
Title: ${data.jobDescription.title || "N/A"}
Company: ${data.jobDescription.company || "N/A"}
Description: ${data.jobDescription.jd_text || "N/A"}`
    : ""
}

Generate a professional, ATS-friendly resume in the following EXACT JSON structure:

{
  "personal_info": {
    "name": "Full Name",
    "title": "Professional Title (e.g., Senior Software Engineer)",
    "email": "email@example.com",
    "phone": "Phone number if available",
    "location": "City, State if available",
    "linkedin": "LinkedIn URL if available",
    "github": "GitHub URL if available"
  },
  "summary": "A compelling 2-3 sentence professional summary highlighting key strengths and experience",
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "startDate": "YYYY or Month YYYY",
      "endDate": "YYYY or Month YYYY or Present",
      "location": "City, State",
      "description": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Graduation Year",
      "gpa": "GPA if notable",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2", "Skill 3"],
    "tools": ["Tool 1", "Tool 2"],
    "soft": ["Soft skill 1", "Soft skill 2"]
  },
  "projects": [
    {
      "title": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech 1", "Tech 2"],
      "link": "URL if available"
    }
  ],
  "certifications": [
    {
      "title": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY or Month YYYY"
    }
  ]
}

IMPORTANT:
1. Return ONLY valid JSON, no markdown code blocks
2. Use the actual data provided above
3. For experience section, infer from projects and education if no explicit work experience
4. Make the summary ATS-optimized with relevant keywords
5. Ensure all arrays have at least one item, even if inferred
6. If no phone/location/linkedin/github available, use empty string ""`;

  const result = await retryWithBackoff(async () => {
    return await model.generateContent(prompt);
  });

  const response = result.response;
  let jsonText = response.text();

  // Clean up markdown code blocks if present
  jsonText = jsonText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Parse the JSON response
  let resumeData;
  try {
    resumeData = JSON.parse(jsonText);
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    console.log("Raw response:", jsonText);

    // Try to extract JSON from the response
    const startIdx = jsonText.indexOf("{");
    const endIdx = jsonText.lastIndexOf("}") + 1;
    if (startIdx !== -1 && endIdx > startIdx) {
      const extractedJson = jsonText.substring(startIdx, endIdx);
      resumeData = JSON.parse(extractedJson);
    } else {
      throw new Error("Failed to parse resume JSON from LLM response");
    }
  }

  // Save to database with structured sections
  await GeneratedResume.upsert({
    user_id: userId,
    job_id: data.jobDescription?.job_id || null,
    personal_info: resumeData.personal_info || {},
    summary: resumeData.summary || "",
    experience: resumeData.experience || [],
    education: resumeData.education || [],
    skills: resumeData.skills || {},
    projects: resumeData.projects || [],
    certifications: resumeData.certifications || [],
    match_score: calculateMatchScore(data),
  });

  return {
    resume: resumeData,
    matchScore: calculateMatchScore(data),
  };
}

// Helper: Generate resume variant
async function generateGroqVariant(data, variantIndex) {
  const userName = data.user
    ? [data.user.first_name, data.user.middle_name, data.user.last_name]
        .filter(Boolean)
        .join(" ")
    : "Unknown";

  const styleHints = [
    "Focus on leadership qualities and impact-driven achievements. Use strong action verbs and quantify results wherever possible.",
    "Emphasize technical depth and engineering excellence. Highlight system design, scalability, and technical problem-solving.",
    "Optimize for keyword density and ATS parsing. Mirror the job description language closely and include industry-standard terminology.",
    "Focus on collaboration, cross-functional work, and soft skills alongside technical competence. Highlight teamwork and communication.",
  ];

  const prompt = `Generate an ATS-optimized resume in STRUCTURED JSON format. ${styleHints[variantIndex]}\n\nUSER DATA:\nName: ${userName}\nEmail: ${data.user?.email || ""}\nProfile Summary: ${data.user?.profile_summary || "Not specified"}\n\nEDUCATION:\n${data.education.map((e) => `- ${e.degree} in ${e.field_of_study} from ${e.institution_name}, Grade: ${e.grade || "N/A"}`).join("\n")}\n\nCERTIFICATES:\n${data.certificates.map((c) => `- ${c.title} by ${c.issuing_org || "N/A"}`).join("\n")}\n\nPROJECTS:\n${data.projects.map((p) => `- ${p.title}: ${p.description || ""} [${p.tech_stack || ""}]`).join("\n")}\n\n${data.jobDescription ? `TARGET JOB:\nTitle: ${data.jobDescription.title || ""}\nCompany: ${data.jobDescription.company || ""}\nDescription: ${data.jobDescription.jd_text || ""}` : ""}\n\nReturn ONLY valid JSON with this structure: {"personal_info":{"name":"","title":"","email":"","phone":"","location":""},"summary":"","experience":[{"position":"","company":"","startDate":"","endDate":"","location":"","description":""}],"education":[{"degree":"","institution":"","year":"","gpa":"","highlights":[]}],"skills":{"technical":[],"tools":[],"soft":[]},"projects":[{"title":"","description":"","technologies":[],"link":""}],"certifications":[{"title":"","issuer":"","date":""}]}`;

  try {
    const result = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7 + variantIndex * 0.05, // Slight temperature variation
      max_tokens: 8000,
    });

    let jsonText = result.choices[0]?.message?.content || "";
    jsonText = jsonText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const startIdx = jsonText.indexOf("{");
    const endIdx = jsonText.lastIndexOf("}") + 1;
    if (startIdx !== -1 && endIdx > startIdx) {
      return JSON.parse(jsonText.substring(startIdx, endIdx));
    }
    return JSON.parse(jsonText);
  } catch (err) {
    console.error(
      `  ⚠️  Groq variant ${variantIndex + 1} failed: ${err.message}`,
    );
    return null;
  }
}

// Helper: Perform vector similarity search across variants and log results
async function performVariantSelection(
  allVariants,
  jobDescriptionText,
  userId,
) {
  const outputDir = path.join(
    __dirname,
    "../../Processing",
    `resume_variants_${userId}`,
  );
  await fs.mkdir(outputDir, { recursive: true });

  console.log("\n" + "═".repeat(80));
  console.log("  🧠 VECTOR EMBEDDING GENERATION & SIMILARITY SEARCH");
  console.log("═".repeat(80));
  console.log(`  📐 Model: all-MiniLM-L6-v2 (Sentence Transformer)`);
  console.log(`  📐 Embedding dimension: ${EMBEDDING_DIM}`);
  console.log(`  📊 Total variants to compare: ${allVariants.length}`);
  console.log(`  🎯 Similarity metric: Cosine Similarity`);
  console.log(`  💾 Index store: FAISS (Facebook AI Similarity Search)\n`);

  // Step 1: Generate embeddings for all variants
  const variantEmbeddings = [];
  for (let i = 0; i < allVariants.length; i++) {
    const v = allVariants[i];
    if (!v.resume) continue;

    console.log(`  ▸ Generating embeddings for ${v.name}...`);
    const embeddings = generateResumeEmbeddings(v.resume);
    const sectionCount = Object.keys(embeddings).length;
    console.log(
      `    ✓ ${sectionCount} sections embedded (${sectionCount * EMBEDDING_DIM} total dimensions)`,
    );

    variantEmbeddings.push({
      name: v.name,
      source: v.source,
      resume: v.resume,
      embeddings,
    });
  }

  // Step 2: Generate job description embedding
  console.log(`\n  ▸ Generating job description embedding...`);
  const jdEmbedding = generateEmbedding(jobDescriptionText);
  console.log(`    ✓ JD embedded into ${EMBEDDING_DIM}-dim vector`);

  // Step 3: Perform similarity search per section
  console.log("\n" + "─".repeat(80));
  console.log("  📏 SECTION-WISE COSINE SIMILARITY SCORES");
  console.log("─".repeat(80));

  const searchResults = performSimilaritySearch(
    variantEmbeddings,
    jobDescriptionText,
  );
  const bestSections = {};

  for (const [section, scores] of Object.entries(searchResults)) {
    console.log(`\n  ┌─ Section: ${section.toUpperCase()}`);
    console.log("  │");
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];
      const bar = "█".repeat(Math.round(Math.abs(s.similarity) * 30));
      const marker = i === 0 ? " ← BEST" : "";
      console.log(
        `  │  ${s.variantName.padEnd(22)} │ sim=${s.similarity.toFixed(4).padStart(8)} │ ${bar}${marker}`,
      );
    }
    console.log("  └" + "─".repeat(70));

    // Pick the best variant for this section
    if (scores.length > 0) {
      bestSections[section] = {
        selectedFrom: scores[0].variantName,
        similarity: scores[0].similarity,
        allScores: scores,
      };
    }
  }

  // Step 4: Assemble the optimal resume
  console.log("\n" + "═".repeat(80));
  console.log("  🏆 OPTIMAL RESUME ASSEMBLY");
  console.log("═".repeat(80));

  // Start from the Gemini (primary) resume as base
  const primaryResume = variantEmbeddings[0]?.resume || allVariants[0]?.resume;
  const optimalResume = JSON.parse(JSON.stringify(primaryResume));

  for (const [section, result] of Object.entries(bestSections)) {
    const bestVariant = variantEmbeddings.find(
      (v) => v.name === result.selectedFrom,
    );
    if (bestVariant && bestVariant.resume[section]) {
      optimalResume[section] = bestVariant.resume[section];
      console.log(
        `  ✓ ${section.padEnd(18)} → ${result.selectedFrom} (cosine_sim=${result.similarity.toFixed(4)})`,
      );
    }
  }

  // Step 5: Save all variants to files
  console.log("\n" + "─".repeat(80));
  console.log("  💾 SAVING ARTIFACTS");
  console.log("─".repeat(80));

  // Save each variant resume
  for (let i = 0; i < allVariants.length; i++) {
    const fileName = `variant_${i + 1}.json`;
    await fs.writeFile(
      path.join(outputDir, fileName),
      JSON.stringify(allVariants[i].resume, null, 2),
    );
    console.log(`  📄 ${fileName}`);
  }

  // Save all embeddings
  const embeddingsData = variantEmbeddings.map((v) => {
    const sectionEmbeddings = {};
    for (const [sec, data] of Object.entries(v.embeddings)) {
      sectionEmbeddings[sec] = {
        text_preview: data.text.substring(0, 200),
        embedding_dim: data.embedding.length,
        embedding: data.embedding,
      };
    }
    return { name: v.name, source: v.source, sections: sectionEmbeddings };
  });
  await fs.writeFile(
    path.join(outputDir, "embeddings.json"),
    JSON.stringify(embeddingsData, null, 2),
  );
  console.log("  📄 embeddings.json");

  // Save JD embedding
  await fs.writeFile(
    path.join(outputDir, "jd_embedding.json"),
    JSON.stringify(
      {
        job_description: jobDescriptionText.substring(0, 500),
        embedding_dim: jdEmbedding.length,
        embedding: jdEmbedding,
      },
      null,
      2,
    ),
  );
  console.log("  📄 jd_embedding.json");

  // Save similarity search results
  await fs.writeFile(
    path.join(outputDir, "similarity_results.json"),
    JSON.stringify(
      {
        search_config: {
          metric: "cosine_similarity",
          embedding_dim: EMBEDDING_DIM,
          num_variants: allVariants.length,
          timestamp: new Date().toISOString(),
        },
        section_results: bestSections,
      },
      null,
      2,
    ),
  );
  console.log("  📄 similarity_results.json");

  // Save the final optimal resume
  await fs.writeFile(
    path.join(outputDir, "optimal_resume.json"),
    JSON.stringify(optimalResume, null, 2),
  );
  console.log("  📄 optimal_resume.json");

  console.log(
    `\n  📂 All artifacts saved to: Processing/resume_variants_${userId}/`,
  );

  console.log("═".repeat(80) + "\n");

  return optimalResume;
}

// Helper: Calculate match score
function calculateMatchScore(data) {
  if (!data.jobDescription) return 0;

  const requiredSkills = (data.jobDescription.required_skills || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim());
  const userProfile = (data.user?.profile_summary || "").toLowerCase();

  let matchCount = 0;
  for (const skill of requiredSkills) {
    if (skill && userProfile.includes(skill)) {
      matchCount++;
    }
  }

  return requiredSkills.length > 0
    ? Math.round((matchCount / requiredSkills.length) * 100)
    : 0;
}

// Main controller - Process documents and populate database
exports.processDocuments = async (req, res) => {
  const { user_id, selected_doc_ids } = req.body;

  if (!user_id) {
    return res.status(400).json({ msg: "user_id is required" });
  }

  // Check if this user's documents are already being processed
  if (isProcessing(user_id)) {
    console.log(
      `⚠️  Request for user ${user_id} already in progress. Ignoring duplicate request.`,
    );
    return res.status(409).json({
      msg: "Documents are already being processed for this user",
      status: "processing",
    });
  }

  try {
    // Set processing lock
    setProcessingLock(user_id);
    console.log(`🔒 Processing lock acquired for user ${user_id}`);
    console.log("\n=== STARTING COMPLETE DOCUMENT PROCESSING FLOW ===\n");

    // Log if processing specific documents
    if (selected_doc_ids && selected_doc_ids.length > 0) {
      console.log(
        `📌 Processing ${selected_doc_ids.length} selected documents only`,
      );
    }

    // Step 1: Export documents from GridFS to filesystem (filtered by selected_doc_ids if provided)
    console.log("📤 Step 1: Exporting documents from database...");
    const exportResult = await exportDocumentsForUser(
      user_id,
      selected_doc_ids,
    );
    if (exportResult.count === 0) {
      releaseProcessingLock(user_id);
      return res.status(404).json({ msg: "No documents found for user" });
    }

    // Step 2: Extract text only from exported documents (not all files on disk)
    console.log("\n📄 Step 2: Extracting text from documents...");
    const extractedData = await extractTextFromDocuments(
      user_id,
      exportResult.filenames,
    );

    // Save extracted text to JSON file for reference
    const jsonPath = path.join(
      __dirname,
      "../../Processing",
      `extracted_text_${user_id}.json`,
    );
    await fs.writeFile(jsonPath, JSON.stringify(extractedData, null, 2));
    console.log(`💾 Saved extracted text to: extracted_text_${user_id}.json`);

    // Step 3: Get user data
    console.log("\n👤 Step 3: Fetching user data...");
    const userData = await getUserData(user_id);

    // Step 4: Send extracted text + user data to LLM to generate SQL queries
    console.log("\n🤖 Step 4: Generating SQL queries with LLM...");
    const sqlStatements = await generateQueriesWithLLM(extractedData, user_id);
    console.log(`📝 Generated ${sqlStatements.length} SQL queries`);

    // Save generated queries to JSON file for reference
    const queriesPath = path.join(
      __dirname,
      "../../Processing",
      `generated_queries_${user_id}.json`,
    );
    await fs.writeFile(
      queriesPath,
      JSON.stringify({ queries: sqlStatements }, null, 2),
    );
    console.log(`💾 Saved queries to: generated_queries_${user_id}.json`);

    // Step 5: Execute the generated queries to populate database
    console.log("\n⚡ Step 5: Executing SQL queries...");
    const executionResults = await executeGeneratedQueries(sqlStatements);
    console.log(`✅ Successful: ${executionResults.successful.length}`);
    console.log(`❌ Failed: ${executionResults.failed.length}`);

    // Step 6: Fetch all user data for resume
    console.log("\n📊 Step 6: Fetching complete user data...");
    const completeData = await fetchAllUserData(user_id);

    // Step 7: Generate resume sections and compile
    console.log("\n📝 Step 7: Generating resume sections...");
    const primaryResume = await generateFinalResume(completeData, user_id);
    console.log(`✅ Resume sections generated successfully`);

    // Step 8: Compiling optimized resume variants
    console.log("\n🔀 Step 8: Compiling and optimizing resume variants...");
    const variantPromises = [];
    for (let i = 0; i < 4; i++) {
      variantPromises.push(generateGroqVariant(completeData, i));
    }
    const groqResults = await Promise.all(variantPromises);
    const groqVariants = groqResults.filter(Boolean);
    console.log(`✅ Resume variants compiled successfully`);

    // Collect all variants with simple numbered names
    const allVariants = [
      { name: "Variant 1", source: "variant", resume: primaryResume.resume },
      ...groqVariants.map((v, i) => ({
        name: `Variant ${i + 2}`,
        source: "variant",
        resume: v,
      })),
    ];

    // Step 9: Perform vector embedding similarity search
    console.log(
      "\n🧬 Step 9: Running vector similarity search across all variants...",
    );
    const jobDescText =
      completeData.jobDescription?.jd_text ||
      "General software engineering position";
    const optimalResume = await performVariantSelection(
      allVariants,
      jobDescText,
      user_id,
    );
    console.log("✅ Optimal resume assembled from best-scoring sections");

    // Update DB with optimal resume
    await GeneratedResume.upsert({
      user_id: user_id,
      job_id: completeData.jobDescription?.job_id || null,
      personal_info: optimalResume.personal_info || {},
      summary: optimalResume.summary || "",
      experience: optimalResume.experience || [],
      education: optimalResume.education || [],
      skills: optimalResume.skills || {},
      projects: optimalResume.projects || [],
      certifications: optimalResume.certifications || [],
      match_score: primaryResume.matchScore,
    });

    // Release processing lock
    releaseProcessingLock(user_id);
    console.log(`\n🔓 Processing lock released for user ${user_id}`);
    console.log("\n=== PROCESSING COMPLETED SUCCESSFULLY ===\n");

    res.json({
      msg: "Complete processing finished successfully",
      steps: {
        exported: exportResult.count,
        extracted: {
          certificates: extractedData.certificates.length,
          projects: extractedData.projects.length,
          other: extractedData.other.length,
        },
        queriesGenerated: sqlStatements.length,
        queriesExecuted: executionResults.successful.length,
        queriesFailed: executionResults.failed.length,
        variantsGenerated: allVariants.length,
        embeddingDimension: EMBEDDING_DIM,
        similaritySearchPerformed: true,
      },
      resume: optimalResume, // Return the optimally assembled resume
      matchScore: primaryResume.matchScore,
      executionResults,
    });
  } catch (error) {
    // Release processing lock on error
    releaseProcessingLock(user_id);
    console.log(
      `🔓 Processing lock released for user ${user_id} (error occurred)`,
    );

    console.error("❌ Error in complete processing flow:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
