-- ==========================================================
-- Migration V2: Baseline Development & Demo Seed Data
-- Passwords below are BCrypt hashes of 'password123' ($2a$12$e8oYqgKx97h2O9x28bYjCehW2g1rR3H5r3K7x2A1t2E4u3)
-- ==========================================================

-- Seed Users
INSERT INTO users (id, email, password_hash, role, enabled) VALUES
(1, 'admin@campus.edu', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_ADMIN', TRUE),
(2, 'recruiter@google.com', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_RECRUITER', TRUE),
(3, 'recruiter@amazon.com', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_RECRUITER', TRUE),
(4, 'student@campus.edu', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_STUDENT', TRUE),
(5, 'ananya.s@campus.edu', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_STUDENT', TRUE);

-- Seed Student Profiles
INSERT INTO student_profiles (id, user_id, full_name, phone, gender, cgpa, branch, graduation_year, resume_url, skills_json) VALUES
(1, 4, 'Guru Prasad', '+91 9876543210', 'male', 8.85, 'Computer Science & Engineering', 2026, 'https://drive.google.com/file/demo-guru-resume', '["Java", "Spring Boot", "React", "MySQL", "Data Structures", "Docker"]'),
(2, 5, 'Ananya Sharma', '+91 9812345678', 'female', 9.15, 'Information Technology', 2026, 'https://drive.google.com/file/demo-ananya-resume', '["Java", "Python", "Cloud Computing", "React", "Microservices"]');

-- Seed Verified Companies
INSERT INTO companies (id, user_id, company_name, industry, website, location, logo_url, is_verified, description) VALUES
(1, 2, 'Google LLC', 'Cloud & Internet Technologies', 'https://careers.google.com', 'Bengaluru / Hyderabad', 'https://logo.clearbit.com/google.com', TRUE, 'Global technology leader in search, cloud infrastructure, AI, and developer tools.'),
(2, 3, 'Amazon AWS', 'Cloud Infrastructure & E-Commerce', 'https://amazon.jobs', 'Hyderabad / Chennai', 'https://logo.clearbit.com/amazon.com', TRUE, 'World leader in cloud computing platforms, high-scale logistics, and enterprise services.'),
(3, NULL, 'Mayo Clinic Health', 'Healthcare & Clinical Research', 'https://mayoclinic.org', 'Mumbai / Delhi', 'https://logo.clearbit.com/mayoclinic.org', TRUE, 'Premier non-profit academic medical center focused on clinical trials and patient care.');

-- Seed Job Postings
INSERT INTO jobs (id, company_id, title, stream, job_type, min_cgpa, eligible_branches, location, salary_package, description, required_skills, application_deadline, status) VALUES
(1, 1, 'Software Development Engineer - Cloud & Infrastructure', 'IT', 'FULL_TIME', 8.0, 'CS, IT, ECE', 'Hyderabad / Bengaluru', '₹24 - 32 LPA', 'Design and deploy scalable distributed systems, cloud infrastructure components, and high-performance backend APIs.', 'Java, C++, Distributed Systems, Data Structures, Spring Boot', '2026-11-30', 'ACTIVE'),
(2, 2, 'Cloud Support & Backend Systems Engineer', 'IT', 'FULL_TIME', 7.5, 'CS, IT, ECE, EE', 'Hyderabad / Chennai', '₹18 - 26 LPA', 'Build enterprise-grade cloud telemetry tools, AWS Lambda serverless functions, and Java API services.', 'Java, Python, AWS, Linux, Networking, SQL', '2026-12-15', 'ACTIVE'),
(3, 3, 'Clinical Research & Healthcare Coordinator', 'NON_IT', 'FULL_TIME', 6.5, 'Bio-Technology, Life Sciences, Pharmacy', 'Mumbai / Delhi', '₹8 - 14 LPA', 'Coordinate clinical trials, manage regulatory compliance, and liaise with healthcare investigators.', 'Clinical Data Management, GCP Compliance, Life Sciences Degree', '2026-12-20', 'ACTIVE');

-- Seed Sample Application & Interview
INSERT INTO applications (id, student_profile_id, job_id, status, cover_note, applied_at) VALUES
(1, 1, 1, 'SHORTLISTED', 'Strong background in Java 21, Spring Boot microservices, and distributed algorithms.', '2026-10-02 10:00:00'),
(2, 1, 2, 'UNDER_REVIEW', 'Interested in cloud telemetry and AWS distributed systems development.', '2026-10-05 14:30:00');

INSERT INTO application_status_history (id, application_id, previous_status, new_status, changed_by, comments, changed_at) VALUES
(1, 1, 'APPLIED', 'UNDER_REVIEW', 'recruiter@google.com', 'Resume matches Cloud team requirements', '2026-10-03 11:00:00'),
(2, 1, 'UNDER_REVIEW', 'SHORTLISTED', 'recruiter@google.com', 'Cleared screening round with 8.85 CGPA', '2026-10-04 16:00:00');

INSERT INTO interviews (id, application_id, interview_date, interview_type, location_or_link, status, feedback_notes) VALUES
(1, 1, '2026-10-15 10:30:00', 'TECHNICAL_ROUND', 'https://meet.google.com/cpa-demo-inte', 'SCHEDULED', 'Focus on Java Concurrency, Collections, Spring Boot, and System Design');

-- Seed Notification
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 4, 'Interview Scheduled by Google', 'You have been shortlisted for Round 1 Technical Interview for Software Development Engineer position.', 'INTERVIEW_ALERT', FALSE);
