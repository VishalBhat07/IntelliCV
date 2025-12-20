# IntelliCV - Data Flow & Backend API Requirements

## Complete Data Flow

### Step 1: Education Details

**Frontend:** User fills education form
**Action:** Data stored in React state (`educationData`)
**Data Structure:**

```javascript
[
  {
    institution_name: "Harvard University",
    degree: "Bachelor of Science",
    field_of_study: "Computer Science",
    grade: "3.8/4.0",
    completion_year: "2024",
    highlights: ["Dean's List", "CS Society President"],
  },
];
```

**Sent to Backend:** ✅ Yes, in Step 4 (Generate)

---

### Step 2: Upload Documents

**Frontend:** User uploads documents (certificates, projects, etc.)
**Action:** Files immediately sent to backend
**API Endpoint:** `POST /api/upload`
**Request:**

```javascript
FormData {
  user_id: "1",
  file_type: "Certificates", // or "Project", "Education", "Miscellaneous"
  files: [File, File, ...]
}
```

**Response:**

```javascript
{
  msg: "Files uploaded successfully",
  files: [
    { file_name: "certificate.pdf", file_type: "Certificates", ... }
  ]
}
```

**Sent to Backend:** ✅ Yes, immediately during upload

---

### Step 3: Job Description

**Frontend:** User pastes text OR uploads file
**Action (Text):** Data stored in React state (`jobDescription`)
**Action (File):** File immediately sent to backend
**API Endpoint (File):** `POST /api/upload`
**Request (File):**

```javascript
FormData {
  user_id: "1",
  file_type: "JobDescription",
  files: [File]
}
```

**Sent to Backend:**

- Text: ✅ Yes, in Step 4 (Generate)
- File: ✅ Yes, immediately during upload

---

### Step 4: Generate Resume (UPDATED ✨)

When user clicks "Continue" on Step 3, the GenerateResume component:

#### 4.1 Save Education Data

**API Endpoint:** `POST /api/education` ⚠️ NEEDS TO BE CREATED
**Request:**

```javascript
{
  user_id: 1,
  education: [
    {
      institution_name: "Harvard University",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science",
      grade: "3.8/4.0",
      completion_year: "2024",
      highlights: ["Dean's List", "CS Society President"]
    }
  ]
}
```

**Backend Action:**

- Validate data
- Insert into `Education` table (one row per education entry)
- Link to user via `user_id`

---

#### 4.2 Save Job Description

**API Endpoint:** `POST /api/job-description` ⚠️ NEEDS TO BE CREATED
**Request:**

```javascript
{
  user_id: 1,
  description: "We are looking for a Software Engineer with 3+ years experience..."
}
```

**Backend Action:**

- Validate data
- Insert into `JobDescription` table
- Link to user via `user_id`

---

#### 4.3 Export & Process Documents

**API Endpoint:** `POST /api/upload/export` ✅ ALREADY EXISTS
**Request:**

```javascript
{
  user_id: 1;
}
```

**Backend Action:**

1. Fetch all documents for user from MongoDB/storage
2. Extract text from PDFs/DOCX using PyPDF2/python-docx
3. Save extracted text to JSON file
4. Pass text to LLM (Gemini) to generate Sequelize queries
5. Execute generated queries to populate SQL database
   - Creates/updates entries in Certificate, Project tables
6. Return success response

---

#### 4.4 Generate Resume with AI

**API Endpoint:** `POST /api/resume/generate` ⚠️ NEEDS TO BE CREATED
**Request:**

```javascript
{
  user_id: 1;
}
```

**Backend Action:**

1. Fetch ALL user data from database:

   ```sql
   SELECT * FROM User WHERE user_id = 1;
   SELECT * FROM Education WHERE user_id = 1;
   SELECT * FROM Certificate WHERE user_id = 1;
   SELECT * FROM Project WHERE user_id = 1;
   SELECT * FROM JobDescription WHERE user_id = 1;
   ```

2. Format data into context for LLM:

   ```javascript
   const context = {
     user: { name, email, contact, profile_summary },
     education: [...],
     certificates: [...],
     projects: [...],
     jobDescription: "..."
   };
   ```

3. Send to Gemini with prompt:

   ```
   You are a professional resume writer.
   Based on the following information, create a professional resume
   optimized for this job description:

   User Info: {user}
   Education: {education}
   Projects: {projects}
   Certificates: {certificates}
   Job Description: {jobDescription}

   Generate a well-formatted resume in HTML format.
   ```

4. Save generated resume to `GeneratedResume` table

5. Return response:
   ```javascript
   {
     success: true,
     resume: {
       text: "Plain text version...",
       htmlContent: "<html>Formatted resume...</html>"
     }
   }
   ```

---

### Step 5: Preview & Download

**Frontend:** Displays resume and allows PDF download
**No Backend Call:** Everything done client-side using jsPDF

---

## Backend Endpoints Summary

### ✅ Already Implemented

1. `POST /api/auth/login` - User login
2. `POST /api/auth/register` - User registration
3. `POST /api/upload` - Upload documents
4. `POST /api/upload/export` - Extract text and populate DB

### ⚠️ Need to Implement

#### 1. Save Education Data

```javascript
POST /api/education
Body: {
  user_id: number,
  education: Array<{
    institution_name: string,
    degree: string,
    field_of_study?: string,
    grade?: string,
    completion_year?: string,
    highlights?: string[]
  }>
}
Response: {
  msg: "Education data saved successfully",
  count: number
}
```

**Implementation:**

```javascript
// In backend/controllers/educationController.js
exports.saveEducation = async (req, res) => {
  try {
    const { user_id, education } = req.body;

    // Delete existing education for this user (if updating)
    await Education.destroy({ where: { user_id } });

    // Insert new education entries
    const educationEntries = education.map((edu) => ({
      ...edu,
      user_id,
      highlights: JSON.stringify(edu.highlights || []),
    }));

    await Education.bulkCreate(educationEntries);

    res.json({
      msg: "Education data saved successfully",
      count: educationEntries.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

#### 2. Save Job Description

```javascript
POST /api/job-description
Body: {
  user_id: number,
  description: string
}
Response: {
  msg: "Job description saved successfully",
  job_id: number
}
```

**Implementation:**

```javascript
// In backend/controllers/jobController.js
exports.saveJobDescription = async (req, res) => {
  try {
    const { user_id, description } = req.body;

    // Check if user already has a job description
    let jobDesc = await JobDescription.findOne({ where: { user_id } });

    if (jobDesc) {
      // Update existing
      await jobDesc.update({ description });
    } else {
      // Create new
      jobDesc = await JobDescription.create({ user_id, description });
    }

    res.json({
      msg: "Job description saved successfully",
      job_id: jobDesc.job_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

#### 3. Generate Resume with AI

```javascript
POST /api/resume/generate
Body: {
  user_id: number
}
Response: {
  success: true,
  resume: {
    text: string,
    htmlContent: string
  }
}
```

**Implementation:**

```javascript
// In backend/controllers/resumeController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateResume = async (req, res) => {
  try {
    const { user_id } = req.body;

    // 1. Fetch all user data
    const user = await User.findByPk(user_id);
    const education = await Education.findAll({ where: { user_id } });
    const certificates = await Certificate.findAll({ where: { user_id } });
    const projects = await Project.findAll({ where: { user_id } });
    const jobDesc = await JobDescription.findOne({ where: { user_id } });

    // 2. Format context for LLM
    const context = {
      user: {
        name: `${user.first_name} ${user.middle_name || ""} ${user.last_name}`,
        email: user.email,
        contact: user.contact,
        profile_summary: user.profile_summary,
      },
      education: education.map((e) => ({
        institution: e.institution_name,
        degree: e.degree,
        field: e.field_of_study,
        grade: e.grade,
        year: e.completion_year,
        highlights: JSON.parse(e.highlights || "[]"),
      })),
      projects: projects.map((p) => ({
        title: p.title,
        description: p.description,
        tech_stack: p.tech_stack,
        duration: p.duration,
      })),
      certificates: certificates.map((c) => ({
        title: c.title,
        organization: c.issuing_org,
        date: c.issue_date,
      })),
      jobDescription: jobDesc?.description || "",
    };

    // 3. Generate prompt
    const prompt = `
    You are a professional resume writer. Create a well-formatted resume in HTML format.
    
    User Information:
    ${JSON.stringify(context, null, 2)}
    
    Requirements:
    1. Make the resume ATS-friendly
    2. Optimize for the job description provided
    3. Use professional formatting
    4. Include all education, projects, and certificates
    5. Highlight relevant skills and achievements
    6. Return ONLY valid HTML (no markdown, no code blocks)
    `;

    // 4. Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const htmlContent = result.response.text();

    // 5. Extract plain text from HTML
    const text = htmlContent.replace(/<[^>]*>/g, "").trim();

    // 6. Save to database
    await GeneratedResume.create({
      user_id,
      content: htmlContent,
      created_at: new Date(),
    });

    // 7. Return response
    res.json({
      success: true,
      resume: {
        text,
        htmlContent,
      },
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

---

## Backend Routes to Add

```javascript
// backend/routes/educationRoutes.js
const express = require("express");
const router = express.Router();
const educationController = require("../controllers/educationController");

router.post("/", educationController.saveEducation);

module.exports = router;

// backend/routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.post("/", jobController.saveJobDescription);

module.exports = router;

// backend/routes/resumeRoutes.js
const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

router.post("/generate", resumeController.generateResume);

module.exports = router;

// In backend/index.js, add:
app.use("/api/education", require("./routes/educationRoutes"));
app.use("/api/job-description", require("./routes/jobRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
```

---

## Testing the Complete Flow

### 1. Start Backend

```bash
cd backend
npm install @google/generative-ai  # If not already installed
node index.js
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Flow

1. Register/Login
2. Add education → Stored in state
3. Upload documents → Sent to `/api/upload` immediately
4. Add job description → Stored in state
5. Click Continue → **ALL DATA SENT TO BACKEND**:
   - Education → `/api/education`
   - Job Description → `/api/job-description`
   - Documents processed → `/api/upload/export`
   - Resume generated → `/api/resume/generate`
6. Preview and download PDF

---

## Environment Variables Needed

```env
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
DATABASE_URL=your_postgres_connection_string
PORT=8080
```

---

## Summary

**Before this update:**

- ❌ Education data was NOT sent to backend
- ❌ Job description text was NOT sent to backend
- ✅ Documents were uploaded to backend

**After this update:**

- ✅ Education data IS sent to backend (Step 4)
- ✅ Job description IS sent to backend (Step 4)
- ✅ Documents are uploaded to backend (Step 2)
- ✅ ALL data is available for resume generation

The GenerateResume component now properly sends ALL collected data to the backend before attempting to generate the resume! 🎉
