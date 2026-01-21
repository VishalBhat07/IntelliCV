const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const Education = require("../models/Education");
const Certificate = require("../models/Certificate");
const Project = require("../models/Project");
const JobDescription = require("../models/JobDescription");
const GeneratedResume = require("../models/GeneratedResume");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Global rate limiter - tracks last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests

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

// Fetch all user data from the database
async function fetchAllUserData(userId) {
  try {
    // Fetch user profile
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch education
    const education = await Education.findAll({
      where: { user_id: userId },
      order: [["completion_year", "DESC"]],
    });

    // Fetch certificates
    const certificates = await Certificate.findAll({
      where: { user_id: userId },
      order: [["issue_date", "DESC"]],
    });

    // Fetch projects
    const projects = await Project.findAll({
      where: { user_id: userId },
    });

    // Fetch job description
    const jobDescription = await JobDescription.findOne({
      where: { user_id: userId },
    });

    return {
      user: {
        name: `${user.first_name} ${user.middle_name || ""} ${
          user.last_name
        }`.trim(),
        email: user.email,
        contact: user.contact,
        profile_summary: user.profile_summary,
      },
      education: education.map((edu) => ({
        institution: edu.institution_name,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        grade: edu.grade,
        completion_year: edu.completion_year,
        highlights: edu.highlights ? JSON.parse(edu.highlights) : [],
      })),
      certificates: certificates.map((cert) => ({
        title: cert.title,
        issuing_org: cert.issuing_org,
        issue_date: cert.issue_date,
      })),
      projects: projects.map((proj) => ({
        title: proj.title,
        description: proj.description,
        tech_stack: proj.tech_stack,
        duration: proj.duration,
      })),
      jobDescription: jobDescription
        ? {
            title: jobDescription.title,
            company: jobDescription.company,
            description: jobDescription.jd_text,
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Generate resume using Gemini LLM
async function generateResumeWithGemini(userData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert resume writer and ATS optimization specialist. Generate a professional, ATS-friendly resume based on the following candidate information:

USER PROFILE:
Name: ${userData.user.name}
Email: ${userData.user.email}
Contact: ${JSON.stringify(userData.user.contact)}
Profile Summary: ${userData.user.profile_summary || "Not provided"}

EDUCATION:
${JSON.stringify(userData.education, null, 2)}

CERTIFICATES:
${JSON.stringify(userData.certificates, null, 2)}

PROJECTS:
${JSON.stringify(userData.projects, null, 2)}

TARGET JOB:
${
  userData.jobDescription
    ? JSON.stringify(userData.jobDescription, null, 2)
    : "General position"
}

INSTRUCTIONS:
1. Create a professional resume tailored to the target job description
2. Optimize for ATS (Applicant Tracking Systems) with relevant keywords
3. Use strong action verbs and quantifiable achievements
4. Format the resume in clean HTML with proper sections:
   - Contact Information
   - Professional Summary (2-3 sentences tailored to the job)
   - Education
   - Projects (highlight technical skills and impact)
   - Certifications
   - Technical Skills (extract from projects and certificates)
5. Match the candidate's experience to the job requirements
6. Keep it professional, concise, and impactful
7. Use bullet points for readability
8. Include relevant keywords from the job description naturally
9. Return ONLY the HTML content without any markdown code blocks or explanations

Generate the resume HTML now:`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const resumeHtml = response
      .text()
      .replace(/```html|```/g, "")
      .trim();

    return resumeHtml;
  } catch (error) {
    console.error("Error generating resume with Gemini:", error);
    throw error;
  }
}

// Calculate match score between resume and job description
function calculateMatchScore(userData) {
  try {
    if (!userData.jobDescription) {
      return 0.0;
    }

    const jdText = userData.jobDescription.description.toLowerCase();
    let matchCount = 0;
    let totalKeywords = 0;

    // Extract skills from projects
    const skills = [];
    userData.projects.forEach((proj) => {
      if (proj.tech_stack) {
        const techs = proj.tech_stack
          .split(",")
          .map((t) => t.trim().toLowerCase());
        skills.push(...techs);
      }
    });

    // Count matching skills
    skills.forEach((skill) => {
      totalKeywords++;
      if (jdText.includes(skill)) {
        matchCount++;
      }
    });

    // Check education field match
    userData.education.forEach((edu) => {
      if (edu.field_of_study) {
        totalKeywords++;
        if (jdText.includes(edu.field_of_study.toLowerCase())) {
          matchCount++;
        }
      }
    });

    // Calculate percentage match
    const matchScore =
      totalKeywords > 0 ? (matchCount / totalKeywords) * 100 : 50.0;
    return Math.min(matchScore, 100).toFixed(2);
  } catch (error) {
    console.error("Error calculating match score:", error);
    return 50.0;
  }
}

// POST /api/resume/generate - Generate resume using Gemini
exports.generateResume = async (req, res) => {
  const { user_id } = req.body;
  const startTime = Date.now();

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           🚀 RESUME GENERATION REQUEST RECEIVED            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`👤 User ID: ${user_id}`);

  if (!user_id) {
    console.log("❌ ERROR: user_id is missing from request");
    return res.status(400).json({ msg: "user_id is required" });
  }

  // Check if resume is already being generated for this user
  if (isProcessing(user_id)) {
    console.log(
      `⚠️  Resume generation for user ${user_id} already in progress. Ignoring duplicate request.`,
    );
    return res.status(409).json({
      msg: "Resume is already being generated for this user",
      status: "processing",
    });
  }

  try {
    // Set processing lock
    setProcessingLock(user_id);
    console.log(`🔒 Resume generation lock acquired for user ${user_id}`);

    // Step 1: Fetch all user data from database
    console.log("\n📊 Step 1: Fetching user data from database...");
    const userData = await fetchAllUserData(user_id);
    console.log(`   ✓ User profile: ${userData.user.name}`);
    console.log(`   ✓ Education records: ${userData.education.length}`);
    console.log(`   ✓ Certificates: ${userData.certificates.length}`);
    console.log(`   ✓ Projects: ${userData.projects.length}`);
    console.log(`   ✓ Job description: ${userData.jobDescription ? "Yes" : "No"}`);

    // Validate that user has necessary data
    if (!userData.education || userData.education.length === 0) {
      console.log("❌ ERROR: No education data found for user");
      return res.status(400).json({
        msg: "User must have education data before generating resume",
      });
    }

    // Step 2: Generate resume using Gemini LLM
    console.log("\n🤖 Step 2: Generating resume with Gemini LLM...");
    const resumeHtml = await generateResumeWithGemini(userData);
    console.log(`   ✓ Resume HTML generated (${resumeHtml.length} characters)`);

    // Step 3: Calculate match score
    console.log("\n📈 Step 3: Calculating match score...");
    const matchScore = calculateMatchScore(userData);
    console.log(`   ✓ Match score: ${matchScore}%`);

    // Step 4: Get job_id if available
    const jobId = userData.jobDescription
      ? (await JobDescription.findOne({ where: { user_id: user_id } }))?.job_id
      : null;

    // Step 5: Save generated resume to database
    console.log("\n💾 Step 4: Saving resume to database...");
    const savedResume = await GeneratedResume.create({
      user_id: user_id,
      job_id: jobId,
      generated_text: resumeHtml,
      match_score: matchScore,
    });
    console.log(`   ✓ Resume saved with ID: ${savedResume.resume_id}`);

    // Release processing lock
    releaseProcessingLock(user_id);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║         ✅ RESUME GENERATION COMPLETED SUCCESSFULLY        ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log(`🆔 Resume ID: ${savedResume.resume_id}`);
    console.log("\n");

    res.json({
      msg: "Resume generated successfully",
      resume_id: savedResume.resume_id,
      match_score: matchScore,
      resume: {
        htmlContent: resumeHtml,
        timestamp: savedResume.timestamp,
      },
    });
  } catch (error) {
    // Release processing lock on error
    releaseProcessingLock(user_id);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║            ❌ RESUME GENERATION FAILED                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`⏱️  Failed after: ${duration} seconds`);
    console.log(`❌ Error: ${error.message}`);
    console.log("\n");

    res.status(500).json({ error: error.message });
  }
};

// GET /api/resume/:user_id - Get generated resumes for a user
exports.getResumes = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    const resumes = await GeneratedResume.findAll({
      where: { user_id },
      order: [["timestamp", "DESC"]],
    });

    res.json({
      count: resumes.length,
      resumes: resumes.map((resume) => ({
        resume_id: resume.resume_id,
        job_id: resume.job_id,
        title: resume.title || "Untitled Resume",
        target: resume.target || "General",
        personal_info: resume.personal_info,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        certifications: resume.certifications,
        htmlContent: resume.generated_text,
        match_score: resume.match_score,
        timestamp: resume.timestamp,
      })),
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/resume/latest/:user_id - Get latest generated resume
exports.getLatestResume = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    const resume = await GeneratedResume.findOne({
      where: { user_id },
      order: [["timestamp", "DESC"]],
    });

    if (!resume) {
      return res.status(404).json({ msg: "No resume found for this user" });
    }

    res.json({
      resume_id: resume.resume_id,
      job_id: resume.job_id,
      title: resume.title,
      target: resume.target,
      personal_info: resume.personal_info,
      summary: resume.summary,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects,
      certifications: resume.certifications,
      htmlContent: resume.generated_text,
      match_score: resume.match_score,
      timestamp: resume.timestamp,
    });
  } catch (error) {
    console.error("Error fetching latest resume:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/resume/single/:resume_id - Get a specific resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const { resume_id } = req.params;

    if (!resume_id) {
      return res.status(400).json({ msg: "resume_id is required" });
    }

    const resume = await GeneratedResume.findByPk(resume_id);

    if (!resume) {
      return res.status(404).json({ msg: "Resume not found" });
    }

    res.json({
      resume: {
        resume_id: resume.resume_id,
        user_id: resume.user_id,
        job_id: resume.job_id,
        title: resume.title,
        target: resume.target,
        personal_info: resume.personal_info,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        certifications: resume.certifications,
        htmlContent: resume.generated_text,
        match_score: resume.match_score,
        timestamp: resume.timestamp,
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/resume/save - Save or update a resume
exports.saveResume = async (req, res) => {
  try {
    const {
      resume_id,
      user_id,
      title,
      target,
      personal_info,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications,
      htmlContent,
      match_score,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    let resume;

    if (resume_id) {
      // Update existing resume
      resume = await GeneratedResume.findByPk(resume_id);
      if (!resume) {
        return res.status(404).json({ msg: "Resume not found" });
      }

      // Update fields
      resume.title = title || resume.title;
      resume.target = target || resume.target;
      resume.personal_info = personal_info || resume.personal_info;
      resume.summary = summary || resume.summary;
      resume.experience = experience || resume.experience;
      resume.education = education || resume.education;
      resume.skills = skills || resume.skills;
      resume.projects = projects || resume.projects;
      resume.certifications = certifications || resume.certifications;
      resume.generated_text = htmlContent || resume.generated_text;
      resume.match_score =
        match_score !== undefined ? match_score : resume.match_score;
      resume.timestamp = new Date();

      await resume.save();
    } else {
      // Create new resume
      resume = await GeneratedResume.create({
        user_id,
        title: title || "Untitled Resume",
        target: target || "General",
        personal_info,
        summary,
        experience,
        education,
        skills,
        projects,
        certifications,
        generated_text: htmlContent,
        match_score: match_score || 0,
      });
    }

    res.json({
      msg: resume_id
        ? "Resume updated successfully"
        : "Resume saved successfully",
      resume: {
        resume_id: resume.resume_id,
        user_id: resume.user_id,
        title: resume.title,
        target: resume.target,
        personal_info: resume.personal_info,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        certifications: resume.certifications,
        htmlContent: resume.generated_text,
        match_score: resume.match_score,
        timestamp: resume.timestamp,
      },
    });
  } catch (error) {
    console.error("Error saving resume:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a resume by ID
exports.deleteResume = async (req, res) => {
  try {
    const { resume_id } = req.params;

    const resume = await GeneratedResume.findByPk(resume_id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    await resume.destroy();

    res.json({ msg: "Resume deleted successfully", resume_id });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: error.message });
  }
};

// Regenerate resume with user prompt/feedback
async function regenerateResumeWithGemini(currentResumeData, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert resume writer and ATS optimization specialist. You need to IMPROVE an existing resume based on specific user feedback.

CURRENT RESUME DATA:
${JSON.stringify(currentResumeData, null, 2)}

USER FEEDBACK/REQUEST:
"${userPrompt}"

INSTRUCTIONS:
1. Carefully analyze the user's feedback and understand what they want to change
2. Apply the requested changes while maintaining professionalism and ATS-friendliness
3. Only modify the sections mentioned in the feedback; keep other sections unchanged unless improvement is necessary
4. Use strong action verbs and quantifiable achievements
5. Keep the formatting consistent with the original resume structure
6. Return the improved resume in the EXACT SAME JSON structure as the input

OUTPUT FORMAT:
Return ONLY valid JSON matching this structure (no markdown code blocks, no explanations):
{
  "personal_info": {
    "name": "Full Name",
    "title": "Professional Title",
    "email": "email@example.com",
    "phone": "Phone number",
    "location": "Location"
  },
  "summary": "Professional summary text",
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "startDate": "Start Date",
      "endDate": "End Date",
      "location": "Location",
      "description": "Bullet points with achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Year",
      "gpa": "GPA if available",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "soft": ["Soft skill 1", "Soft skill 2"]
  },
  "projects": [
    {
      "title": "Project Name",
      "description": "Description",
      "technologies": ["Tech 1", "Tech 2"],
      "link": "URL if available"
    }
  ],
  "certifications": [
    {
      "title": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date"
    }
  ]
}

Generate the improved resume JSON now:`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    let jsonText = response.text();

    // Clean up markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

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

    return resumeData;
  } catch (error) {
    console.error("Error regenerating resume with Gemini:", error);
    throw error;
  }
}

// POST /api/resume/regenerate - Regenerate resume with user feedback
exports.regenerateResume = async (req, res) => {
  const { user_id, resume_id, current_resume, user_prompt } = req.body;
  const startTime = Date.now();

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         🔄 RESUME REGENERATION REQUEST RECEIVED            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`👤 User ID: ${user_id}`);
  console.log(`🆔 Resume ID: ${resume_id || "New resume"}`);
  console.log(`💬 User Prompt: "${user_prompt}"`);

  if (!user_id) {
    console.log("❌ ERROR: user_id is missing from request");
    return res.status(400).json({ msg: "user_id is required" });
  }

  if (!user_prompt || !user_prompt.trim()) {
    console.log("❌ ERROR: user_prompt is missing from request");
    return res
      .status(400)
      .json({ msg: "user_prompt is required for regeneration" });
  }

  if (!current_resume) {
    console.log("❌ ERROR: current_resume data is missing from request");
    return res.status(400).json({ msg: "current_resume data is required" });
  }

  // Check if resume is already being regenerated for this user
  if (isProcessing(user_id)) {
    console.log(
      `⚠️  Resume regeneration for user ${user_id} already in progress. Ignoring duplicate request.`,
    );
    return res.status(409).json({
      msg: "Resume is already being regenerated for this user",
      status: "processing",
    });
  }

  try {
    // Set processing lock
    setProcessingLock(user_id);
    console.log(`\n🔒 Resume regeneration lock acquired for user ${user_id}`);

    // Log current resume sections for debugging
    console.log("\n📋 Current Resume Sections:");
    console.log(`   • Name: ${current_resume.personal_info?.name || "N/A"}`);
    console.log(`   • Summary: ${current_resume.summary ? current_resume.summary.substring(0, 50) + "..." : "N/A"}`);
    console.log(`   • Experience entries: ${current_resume.experience?.length || 0}`);
    console.log(`   • Education entries: ${current_resume.education?.length || 0}`);
    console.log(`   • Projects: ${current_resume.projects?.length || 0}`);
    console.log(`   • Certifications: ${current_resume.certifications?.length || 0}`);

    // Regenerate resume using Gemini LLM with user feedback
    console.log("\n🤖 Sending to Gemini LLM for regeneration...");
    console.log(`   Prompt: "${user_prompt}"`);
    const regeneratedResumeData = await regenerateResumeWithGemini(
      current_resume,
      user_prompt,
    );
    console.log("   ✓ Gemini LLM response received and parsed");

    // Log regenerated resume sections
    console.log("\n📝 Regenerated Resume Sections:");
    console.log(`   • Name: ${regeneratedResumeData.personal_info?.name || "N/A"}`);
    console.log(`   • Summary: ${regeneratedResumeData.summary ? regeneratedResumeData.summary.substring(0, 50) + "..." : "N/A"}`);
    console.log(`   • Experience entries: ${regeneratedResumeData.experience?.length || 0}`);
    console.log(`   • Education entries: ${regeneratedResumeData.education?.length || 0}`);
    console.log(`   • Projects: ${regeneratedResumeData.projects?.length || 0}`);
    console.log(`   • Certifications: ${regeneratedResumeData.certifications?.length || 0}`);

    // NOTE: We do NOT save to database here!
    // The regenerated data is returned as a PREVIEW only.
    // User must click "Save" button to persist changes to the database.
    console.log("\n📌 Regenerated data returned as PREVIEW (not saved to DB)");
    console.log("   User must click 'Save' to persist changes.");

    // Release processing lock
    releaseProcessingLock(user_id);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║       ✅ RESUME REGENERATION COMPLETED SUCCESSFULLY        ║");
    console.log("║          (Preview only - not saved to database)            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log(`🆔 Resume ID (for reference): ${resume_id || "N/A"}`);
    console.log("\n");

    // Return the regenerated data as preview
    // The resume_id stays the same (user's existing resume ID)
    res.json({
      msg: "Resume regenerated successfully (preview)",
      resume_id: resume_id, // Keep the original resume_id so Save can update it
      isPreview: true, // Flag to indicate this is just a preview
      resume: {
        resume_id: resume_id,
        personal_info: regeneratedResumeData.personal_info,
        summary: regeneratedResumeData.summary,
        experience: regeneratedResumeData.experience,
        education: regeneratedResumeData.education,
        skills: regeneratedResumeData.skills,
        projects: regeneratedResumeData.projects,
        certifications: regeneratedResumeData.certifications,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // Release processing lock on error
    releaseProcessingLock(user_id);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║          ❌ RESUME REGENERATION FAILED                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`⏱️  Failed after: ${duration} seconds`);
    console.log(`❌ Error: ${error.message}`);
    console.log("\n");

    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
