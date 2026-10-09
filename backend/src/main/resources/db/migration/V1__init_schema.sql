-- ==========================================================
-- Migration V1: Initial Relational Database Schema
-- Project: Campus Placement Assistance
-- Target DB: MySQL 8.x / ANSI SQL
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    graduation_year INT NOT NULL,
    resume_url VARCHAR(500),
    skills_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_branch_cgpa (branch, cgpa),
    INDEX idx_student_grad_year (graduation_year)
);

-- 3. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    company_name VARCHAR(120) NOT NULL UNIQUE,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    location VARCHAR(120) NOT NULL,
    logo_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_company_verified (is_verified)
);

-- 4. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    stream VARCHAR(30) NOT NULL, -- 'IT', 'NON_IT'
    job_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME',
    min_cgpa DECIMAL(4,2) NOT NULL DEFAULT 6.0,
    eligible_branches VARCHAR(255) NOT NULL DEFAULT 'ALL',
    location VARCHAR(120) NOT NULL,
    salary_package VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    application_deadline DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'DRAFT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_jobs_stream_status (stream, status),
    INDEX idx_jobs_deadline (application_deadline)
);

-- 5. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'APPLIED',
    cover_note TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_job UNIQUE (student_profile_id, job_id),
    CONSTRAINT fk_app_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_applications_status (status)
);

-- 6. APPLICATION STATUS HISTORY (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS application_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    previous_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    changed_by VARCHAR(120) NOT NULL,
    comments TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 7. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    interview_date TIMESTAMP NOT NULL,
    interview_type VARCHAR(50) NOT NULL,
    location_or_link VARCHAR(300) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    feedback_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_interview_date (interview_date)
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(80) NOT NULL,
    performed_by VARCHAR(120) NOT NULL,
    entity_name VARCHAR(60) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
