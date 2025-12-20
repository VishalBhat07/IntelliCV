# Backend Implementation Documentation

## Overview

The IntelliCV backend now includes complete functionality for:

1. Saving education and job description data
2. Extracting text from uploaded documents (PDF, DOCX)
3. Using Gemini LLM to generate Sequelize queries from extracted text
4. Executing queries to populate the database
5. Generating optimized resumes using Gemini AI

---

## Architecture Flow

```
User Uploads Documents → MongoDB GridFS (Storage)
                              ↓
                    Export to Filesystem
                              ↓
                    Extract Text (PDF/DOCX)
                              ↓
                      Send to Gemini LLM
                              ↓
              Generate SQL INSERT Queries
                              ↓
                    Execute Queries
                              ↓
              Populate MySQL Database
           (Certificate, Project tables)
                              ↓
         Fetch All User Data from Database
                              ↓
              Send to Gemini AI
                              ↓
            Generate Optimized Resume
                              ↓
            Save to GeneratedResume table
```

---

## New Controllers

### 1. educationController.js

**Endpoints:**

- `POST /api/education` - Save education data array for a user
- `GET /api/education/:user_id` - Fetch education data

**Features:**

- Bulk insert multiple education entries
- Replaces existing education data when updating
- Handles highlights as JSON array

---

### 2. jobController.js

**Endpoints:**

- `POST /api/job-description` - Save/update job description
- `GET /api/job-description/:user_id` - Fetch job description

**Features:**

- Upsert operation (creates or updates)
- Stores job title, company, and full description text

---

### 3. llmController.js

**Main Function:** `processDocuments`
**Endpoint:** `POST /api/upload/process`

**Process Flow:**

1. **Extract Text** from uploaded documents:

   - Reads files from `Processing/uploads/{Certificate|Project|Other}/` directories
   - Uses `pdf-parse` for PDF files
   - Uses `mammoth` for DOCX files
   - Saves extracted text to `Processing/extracted_text_{userId}.json`

2. **Generate Queries** with Gemini LLM:

   - Sends extracted text to Gemini with structured prompt
   - LLM analyzes text and generates SQL INSERT statements
   - Queries target Certificate and Project tables
   - Saves generated queries to `Processing/generated_queries_{userId}.json`

3. **Execute Queries**:
   - Runs each SQL statement using Sequelize raw query
   - Tracks successful and failed executions
   - Returns execution results

**Example Prompt to Gemini:**

```
You are a data extraction expert. Analyze the extracted text
and generate SQL INSERT statements for Certificate and Project tables.

For certificates: extract course names, issuing organizations, dates
For projects: extract project titles, descriptions, tech stacks, durations

Return ONLY valid SQL INSERT statements.
```

---

### 4. resumeController.js

**Main Function:** `generateResume`
**Endpoint:** `POST /api/resume/generate`

**Process Flow:**

1. **Fetch All User Data** from database:

   - User profile (name, email, contact)
   - Education entries
   - Certificates
   - Projects
   - Job description

2. **Generate Resume** with Gemini:

   - Sends all user data + job description to Gemini
   - LLM creates ATS-optimized resume in HTML format
   - Tailors content to match job requirements
   - Includes keywords from job description

3. **Calculate Match Score**:

   - Compares user skills/education with job description
   - Returns percentage match (0-100)

4. **Save Resume** to database:
   - Stores HTML content in GeneratedResume table
   - Links to user and job description
   - Records match score and timestamp

**Other Endpoints:**

- `GET /api/resume/:user_id` - Get all resumes for a user
- `GET /api/resume/latest/:user_id` - Get most recent resume

---

## New Routes

### educationRoutes.js

```javascript
POST /api/education          // Save education data
GET  /api/education/:user_id // Get education data
```

### jobRoutes.js

```javascript
POST /api/job-description          // Save job description
GET  /api/job-description/:user_id // Get job description
```

### resumeRoutes.js

```javascript
POST /api/resume/generate      // Generate resume with AI
GET  /api/resume/:user_id      // Get all resumes
GET  /api/resume/latest/:user_id // Get latest resume
```

### Updated uploadRoutes.js

```javascript
POST / api / upload / process; // Process documents with LLM
```

---

## Dependencies Added

Add these to `package.json`:

```json
{
  "@google/generative-ai": "^0.21.0", // Gemini AI SDK
  "pdf-parse": "^1.1.1", // PDF text extraction
  "mammoth": "^1.8.0" // DOCX text extraction
}
```

**Install command:**

```bash
cd backend
npm install @google/generative-ai pdf-parse mammoth
```

---

## Environment Variables

Add to `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Key:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` file

---

## Database Tables Used

### Education Table

```sql
CREATE TABLE Education (
  edu_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  institution_name VARCHAR(255),
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  grade VARCHAR(50),
  completion_year INT,
  highlights JSON
);
```

### Certificate Table

```sql
CREATE TABLE Certificate (
  cert_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  issuing_org VARCHAR(255),
  issue_date DATE,
  file_path VARCHAR(255)
);
```

### Project Table

```sql
CREATE TABLE Project (
  proj_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack VARCHAR(255),
  duration VARCHAR(100)
);
```

### JobDescription Table

```sql
CREATE TABLE JobDescription (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  jd_text TEXT,
  embedding_vector TEXT
);
```

### GeneratedResume Table

```sql
CREATE TABLE GeneratedResume (
  resume_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  job_id INT,
  generated_text TEXT,
  match_score FLOAT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Integration

The frontend `GenerateResume.jsx` component now calls:

```javascript
// Step 1: Save education
POST /api/education
Body: { user_id, education: [...] }

// Step 2: Save job description
POST /api/job-description
Body: { user_id, description }

// Step 3: Export documents to filesystem
POST /api/upload/export
Body: { user_id }

// Step 4: Process documents with LLM
POST /api/upload/process
Body: { user_id }

// Step 5: Generate resume
POST /api/resume/generate
Body: { user_id }
Response: {
  resume_id,
  match_score,
  resume: { htmlContent, timestamp }
}
```

---

## Testing the Implementation

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Test Endpoints with Postman/cURL

**Save Education:**

```bash
curl -X POST http://localhost:8080/api/education \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "education": [{
      "institution_name": "MIT",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "grade": "3.9 GPA",
      "completion_year": 2023,
      "highlights": ["Dean's List", "Research Assistant"]
    }]
  }'
```

**Save Job Description:**

```bash
curl -X POST http://localhost:8080/api/job-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "description": "We are looking for a Full Stack Developer...",
    "title": "Full Stack Developer",
    "company": "Tech Corp"
  }'
```

**Process Documents:**

```bash
curl -X POST http://localhost:8080/api/upload/process \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 1 }'
```

**Generate Resume:**

```bash
curl -X POST http://localhost:8080/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 1 }'
```

---

## Error Handling

All controllers include:

- Input validation (user_id required)
- Try-catch blocks for error handling
- Detailed error messages in console
- HTTP status codes (400, 404, 500)
- JSON error responses

---

## File Structure

```
backend/
├── controllers/
│   ├── educationController.js    ✅ NEW
│   ├── jobController.js           ✅ NEW
│   ├── llmController.js           ✅ NEW
│   ├── resumeController.js        ✅ NEW
│   ├── uploadController.js        (existing)
│   └── authController.js          (existing)
├── routes/
│   ├── educationRoutes.js         ✅ NEW
│   ├── jobRoutes.js               ✅ NEW
│   ├── resumeRoutes.js            ✅ NEW
│   ├── uploadRoutes.js            (updated)
│   └── authRoutes.js              (existing)
├── models/
│   ├── Education.js               (existing)
│   ├── Certificate.js             (existing)
│   ├── Project.js                 (existing)
│   ├── JobDescription.js          (existing)
│   ├── GeneratedResume.js         (existing)
│   └── ...
├── config/
│   ├── db.js                      (existing)
│   └── mongo.js                   (existing)
├── index.js                       ✅ UPDATED
└── package.json                   ✅ UPDATED
```

---

## Key Features

✅ **Text Extraction**: PDF and DOCX parsing with proper error handling
✅ **LLM Integration**: Gemini AI for query generation and resume creation
✅ **Database Population**: Automated SQL query generation and execution
✅ **Resume Generation**: ATS-optimized resumes tailored to job descriptions
✅ **Match Scoring**: Intelligent matching between candidate and job requirements
✅ **Complete REST API**: All CRUD operations for education, jobs, and resumes
✅ **Error Handling**: Comprehensive error tracking and logging
✅ **File Management**: Organized storage in Processing/uploads/ directories

---

## Next Steps

1. **Install dependencies**: `npm install @google/generative-ai pdf-parse mammoth`
2. **Add Gemini API key** to `.env` file
3. **Test each endpoint** individually
4. **Test full flow** from frontend
5. **Monitor console logs** for LLM responses
6. **Check database** for populated data
7. **Review generated resumes** for quality

---

## Troubleshooting

**Issue**: "Cannot find module '@google/generative-ai'"

- **Solution**: Run `npm install @google/generative-ai`

**Issue**: "Invalid API key"

- **Solution**: Check `.env` file has `GEMINI_API_KEY=your_key`

**Issue**: "No documents found"

- **Solution**: Upload documents first via `/api/upload` endpoint

**Issue**: "Failed to extract text"

- **Solution**: Verify PDF/DOCX files are not corrupted or password-protected

**Issue**: "Query execution failed"

- **Solution**: Check console logs for SQL syntax errors from LLM

---

## Performance Considerations

- **Text Extraction**: Can be slow for large PDFs (5-10 seconds)
- **LLM Processing**: Gemini API calls take 2-5 seconds each
- **Query Execution**: Bulk inserts are efficient (< 1 second)
- **Total Time**: Expect 15-30 seconds for complete resume generation

---

## Security Notes

- Always validate user_id to prevent unauthorized access
- Sanitize SQL queries before execution (Sequelize handles this)
- Store API keys in environment variables, never in code
- Implement rate limiting for LLM API calls
- Add authentication middleware to all endpoints

---

## Credits

Built with:

- Node.js + Express
- Sequelize ORM
- Google Gemini AI
- MongoDB GridFS
- PDF-Parse & Mammoth
