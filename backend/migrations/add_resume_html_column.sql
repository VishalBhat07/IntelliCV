-- Migration: Add resume_html column to Generated_Resume table
-- Date: 2025-12-20
-- Description: Adds the resume_html field to store HTML-formatted resumes
--              and makes job_id nullable

USE intellicv;

-- Step 1: Add resume_html column
ALTER TABLE Generated_Resume 
ADD COLUMN resume_html TEXT NULL 
AFTER job_id;

-- Step 2: Make job_id nullable (not all resumes are tied to specific job)
ALTER TABLE Generated_Resume 
MODIFY COLUMN job_id INT NULL;

-- Verify the changes
DESCRIBE Generated_Resume;

-- Expected result:
-- Field           Type        Null    Key     Default Extra
-- resume_id       int         NO      PRI     NULL    auto_increment
-- user_id         int         NO              NULL
-- job_id          int         YES             NULL    (NOW NULLABLE)
-- resume_html     text        YES             NULL    (NEWLY ADDED)
-- generated_text  text        NO              NULL
-- match_score     float       YES             NULL
-- timestamp       datetime    YES             NULL
