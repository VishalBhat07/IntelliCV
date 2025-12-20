# Quick Setup Guide - Backend Implementation

## Prerequisites

- Node.js installed
- MySQL running
- MongoDB running
- Gemini API key

---

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install @google/generative-ai pdf-parse mammoth
```

### 2. Configure Environment Variables

Create/update `.env` file in backend directory:

```env
# Existing variables
PORT=8080
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=intellicv
MONGO_URI=mongodb://localhost:27017/intellicv
JWT_SECRET=your_jwt_secret

# NEW - Add Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get Gemini API Key:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in `.env`

### 3. Start the Server

```bash
npm run dev
```

You should see:

```
Server running on port 8080
MongoDB connected successfully
MySQL Database Connected
```

---

## Testing the Flow

### Test 1: Save Education

```bash
curl -X POST http://localhost:8080/api/education \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "education": [{
      "institution_name": "Stanford University",
      "degree": "B.S. Computer Science",
      "field_of_study": "Computer Science",
      "grade": "3.8 GPA",
      "completion_year": 2022,
      "highlights": ["Dean'\''s List", "ACM Member"]
    }]
  }'
```

Expected Response:

```json
{
  "msg": "Education data saved successfully",
  "count": 1,
  "education": [...]
}
```

---

### Test 2: Save Job Description

```bash
curl -X POST http://localhost:8080/api/job-description \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "description": "Looking for a Full Stack Developer with React and Node.js experience",
    "title": "Full Stack Developer",
    "company": "Tech Startup"
  }'
```

---

### Test 3: Upload Documents

First, upload some documents via the frontend or using:

```bash
curl -X POST http://localhost:8080/api/upload \
  -F "user_id=1" \
  -F "file_type=Certificate" \
  -F "files=@/path/to/certificate.pdf"
```

---

### Test 4: Export Documents

```bash
curl -X POST http://localhost:8080/api/upload/export \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 1 }'
```

Check that files appear in:

- `Processing/uploads/Certificate/`
- `Processing/uploads/Project/`
- `Processing/uploads/Other/`

---

### Test 5: Process Documents with LLM

```bash
curl -X POST http://localhost:8080/api/upload/process \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 1 }'
```

This will:

1. Extract text from PDFs/DOCX
2. Send to Gemini to generate SQL queries
3. Execute queries to populate Certificate/Project tables

Check files created:

- `Processing/extracted_text_1.json`
- `Processing/generated_queries_1.json`

---

### Test 6: Generate Resume

```bash
curl -X POST http://localhost:8080/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 1 }'
```

Expected Response:

```json
{
  "msg": "Resume generated successfully",
  "resume_id": 1,
  "match_score": "75.50",
  "resume": {
    "htmlContent": "<div>...</div>",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Verify Database Tables

### Check Education Table

```sql
SELECT * FROM Education WHERE user_id = 1;
```

### Check Certificate Table

```sql
SELECT * FROM Certificate WHERE user_id = 1;
```

### Check Project Table

```sql
SELECT * FROM Project WHERE user_id = 1;
```

### Check JobDescription Table

```sql
SELECT * FROM JobDescription WHERE user_id = 1;
```

### Check GeneratedResume Table

```sql
SELECT * FROM GeneratedResume WHERE user_id = 1;
```

---

## Frontend Integration

The frontend already has all API calls integrated in `GenerateResume.jsx`.

Just ensure:

1. Backend is running on port 8080 (or update `VITE_BACKEND_URL` in frontend `.env`)
2. User is logged in and has a valid `user_id`
3. Documents are uploaded before clicking "Generate Resume"

---

## Common Issues

### Issue: "Module not found: @google/generative-ai"

**Solution:**

```bash
cd backend
npm install @google/generative-ai
```

### Issue: "Invalid API key"

**Solution:**

- Check `.env` has `GEMINI_API_KEY=...`
- Verify API key is valid at [Google AI Studio](https://makersuite.google.com)
- Restart the server after adding the key

### Issue: "No text extracted from PDF"

**Solution:**

- Ensure PDF is not scanned image (needs OCR)
- Check PDF is not password protected
- Try a different PDF file

### Issue: "SQL query execution failed"

**Solution:**

- Check console logs for exact error
- Gemini might generate invalid SQL - check `Processing/generated_queries_{userId}.json`
- You can manually fix queries and re-run

### Issue: "User must have education data"

**Solution:**

- Call POST `/api/education` first before generating resume
- Ensure education array is not empty

---

## File Locations

After running the flow, you'll have:

```
Processing/
├── uploads/
│   ├── Certificate/
│   │   └── 1_certificate.pdf
│   ├── Project/
│   │   └── 1_project_description.pdf
│   └── Other/
│       └── 1_resume.pdf
├── extracted_text_1.json          ← Text extracted from documents
└── generated_queries_1.json       ← SQL queries generated by LLM
```

---

## Monitoring LLM Calls

The console will show:

```
Extracting text from documents for user 1...
Generating SQL queries with Gemini LLM...
Executing generated SQL queries...
Fetching all data for user 1...
Generating resume with Gemini LLM...
```

Watch for any errors in these steps.

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Add Gemini API key
3. ✅ Test each endpoint
4. ✅ Upload test documents
5. ✅ Run full flow
6. ✅ Check database
7. ✅ Test from frontend

---

## API Endpoints Summary

| Method | Endpoint                      | Purpose                         |
| ------ | ----------------------------- | ------------------------------- |
| POST   | /api/education                | Save education data             |
| GET    | /api/education/:user_id       | Get education                   |
| POST   | /api/job-description          | Save job description            |
| GET    | /api/job-description/:user_id | Get job description             |
| POST   | /api/upload                   | Upload files to GridFS          |
| POST   | /api/upload/export            | Export files to filesystem      |
| POST   | /api/upload/process           | Extract text + generate queries |
| POST   | /api/resume/generate          | Generate resume with AI         |
| GET    | /api/resume/:user_id          | Get all resumes                 |
| GET    | /api/resume/latest/:user_id   | Get latest resume               |

---

## Support

For issues or questions:

1. Check console logs for detailed error messages
2. Verify all environment variables are set
3. Ensure databases (MySQL + MongoDB) are running
4. Check API key is valid and has credits
5. Review `BACKEND_IMPLEMENTATION.md` for detailed documentation
