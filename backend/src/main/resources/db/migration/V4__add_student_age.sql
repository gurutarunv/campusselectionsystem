-- ==========================================================
-- Migration V4: Add Age Column to Student Profiles
-- Project: Campus Placement Assistance
-- Target DB: MySQL 8.x / H2 / ANSI SQL
-- ==========================================================

ALTER TABLE student_profiles ADD COLUMN age INT;
