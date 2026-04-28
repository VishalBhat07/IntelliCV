# IntelliCV

IntelliCV is a full-stack resume intelligence platform for collecting education and document data, processing uploaded files, generating structured resume content with AI, and exporting the final resume as PDF.

## What’s in the repo

- `backend/` - Express API server with MySQL, MongoDB GridFS, AI-assisted document processing, and PDF export.
- `frontend/` - Main React + Vite web app for authentication, data entry, document upload, and resume generation.
- `new-frontend/` - Alternate React + Vite frontend variant kept in the repo as a separate UI build.
- `Processing/` - Intermediate extracted text, generated query files, embeddings, and uploaded document artifacts.
- `docs/` - Project write-up, implementation notes, diagrams, and setup references.

## Features

- User registration and login with JWT authentication.
- Education and job description capture.
- Upload and store certificates and project documents.
- Extract text from PDF and DOCX files.
- Use LLMs to generate structured SQL for document data.
- Generate an ATS-friendly resume from stored profile data.
- Export the generated resume to PDF.

## Tech Stack

- Backend: Node.js, Express, Sequelize, MySQL, MongoDB, MongoDB GridFS, Puppeteer.
- AI / document processing: Gemini, Groq, `pdfjs-dist`, `mammoth`.
- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Framer Motion, React Hot Toast.

## Prerequisites

- Node.js 18+.
- MySQL running locally or remotely.
- MongoDB running locally or remotely.
- A Gemini API key.
- Optional: Groq API key, if you use the LLM helpers that depend on it.

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file with values similar to these:

```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=intellicv
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/intellicv
MONGO_DB=IntelliCV
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 2. Main frontend

```bash
cd frontend
npm install
```

The frontend defaults to `http://localhost:8080` and can be pointed at a different backend with `VITE_BACKEND_URL`.

### 3. Optional alternate frontend

```bash
cd new-frontend
npm install
```

Use this folder only if you want to run the alternate UI build.

## Run the app

Start the backend first:

```bash
cd backend
npm run dev
```

Then start the frontend you want to use:

```bash
cd frontend
npm run dev
```

The backend listens on port `8080` by default, and the Vite frontend usually runs on `http://localhost:5173`.

## Main API flow

1. Register or log in a user.
2. Save education details.
3. Upload certificates and project documents.
4. Save a job description.
5. Process uploaded documents into structured records.
6. Generate a tailored resume.
7. Export the resume as PDF.

## Useful backend routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/education`
- `POST /api/job-description`
- `POST /api/upload`
- `POST /api/upload/process`
- `POST /api/resume/generate`
- `POST /api/export-pdf`

## Notes

- The backend syncs MySQL models on startup and connects to MongoDB before accepting requests.
- Uploaded files are stored in MongoDB GridFS and can also be exported into the `Processing/uploads/` folders.
- Generated intermediate files such as extracted text and SQL queries are written into `Processing/`.

## Documentation

- `docs/SETUP_GUIDE.md` for a backend-focused quick start.
- `docs/BACKEND_IMPLEMENTATION.md` for deeper backend details.
- `docs/IMPLEMENTATION_SUMMARY.md` for a high-level project summary.
