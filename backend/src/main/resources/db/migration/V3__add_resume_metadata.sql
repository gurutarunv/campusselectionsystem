-- ==========================================================
-- Migration V3: Add Resume File Metadata Columns
-- Project: Campus Placement Assistance
-- Target DB: H2 / MySQL 8.x / ANSI SQL
-- ==========================================================

ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS resume_file_name VARCHAR(255);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS resume_storage_name VARCHAR(255);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS resume_file_size BIGINT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS resume_content_type VARCHAR(100);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_student_phone ON student_profiles (phone);
