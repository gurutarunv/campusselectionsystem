# Database Schema Design: Campus Placement Assistance

## 1. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has one"
    USERS ||--o| COMPANIES : "manages"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    
    COMPANIES ||--o{ JOBS : "publishes"
    
    STUDENT_PROFILES ||--o{ APPLICATIONS : "submits"
    JOBS ||--o{ APPLICATIONS : "receives"
    
    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "tracks transitions"
    APPLICATIONS ||--o| INTERVIEWS : "scheduled for"
    
    USERS {
        bigint id PK
        varchar email UK "Indexed"
        varchar password_hash
        varchar role "STUDENT, RECRUITER, ADMIN"
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    STUDENT_PROFILES {
        bigint id PK
        bigint user_id FK, UK "1-to-1 with Users"
        varchar full_name
        varchar phone
        varchar gender
        decimal cgpa "Scale: 2"
        varchar branch "CS, IT, ME, EE, BIO, etc."
        int graduation_year
        varchar resume_url
        text skills_json "JSON array of technical skills"
        timestamp created_at
        timestamp updated_at
    }

    COMPANIES {
        bigint id PK
        bigint user_id FK, UK "1-to-1 with Recruiter User"
        varchar company_name UK "Indexed"
        varchar industry
        varchar website
        varchar location
        varchar logo_url
        boolean is_verified "Placement officer approval"
        text description
        timestamp created_at
    }

    JOBS {
        bigint id PK
        bigint company_id FK
        varchar title "Indexed"
        varchar stream "IT, NON_IT"
        varchar job_type "FULL_TIME, INTERNSHIP, CONTRACT"
        decimal min_cgpa
        varchar eligible_branches "Comma-separated or ALL"
        varchar location
        varchar salary_package
        text description
        text required_skills
        date application_deadline
        varchar status "ACTIVE, CLOSED, DRAFT"
        timestamp created_at
        timestamp updated_at
    }

    APPLICATIONS {
        bigint id PK
        bigint student_profile_id FK "Composite UK (student_id, job_id)"
        bigint job_id FK "Composite UK (student_id, job_id)"
        varchar status "APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, SELECTED, REJECTED, WITHDRAWN"
        text cover_note
        timestamp applied_at
        timestamp updated_at
    }

    APPLICATION_STATUS_HISTORY {
        bigint id PK
        bigint application_id FK
        varchar previous_status
        varchar new_status
        varchar changed_by
        text comments
        timestamp changed_at
    }

    INTERVIEWS {
        bigint id PK
        bigint application_id FK, UK "1-to-1 per Application"
        timestamp interview_date
        varchar interview_type "ONLINE_MEET, TECHNICAL_ROUND, HR_ROUND, ON_CAMPUS"
        varchar location_or_link
        varchar status "SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED"
        text feedback_notes
        timestamp created_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        varchar title
        varchar message
        varchar type "APPLICATION_UPDATE, INTERVIEW_ALERT, SYSTEM"
        boolean is_read
        timestamp created_at
    }

    AUDIT_LOGS {
        bigint id PK
        varchar action
        varchar performed_by
        varchar entity_name
        bigint entity_id
        text details
        timestamp timestamp
    }
```

---

## 2. Table-by-Table Specifications & Indexing Strategy

### 1. `users`
- **Primary Key:** `id` (AUTO_INCREMENT, BIGINT)
- **Unique Constraints:** `email` (Case-insensitive unique index `idx_users_email`)
- **Indexes:** `idx_users_role` on `(role)` for rapid role-based filtering.

### 2. `student_profiles`
- **Foreign Key:** `user_id` → `users(id)` ON DELETE CASCADE
- **Indexes:** 
  - `idx_student_branch_cgpa` on `(branch, cgpa)` to power backend eligibility queries.
  - `idx_student_grad_year` on `(graduation_year)`.

### 3. `companies`
- **Foreign Key:** `user_id` → `users(id)` ON DELETE SET NULL
- **Indexes:** `idx_company_verified` on `(is_verified)` for placement officer moderation workflows.

### 4. `jobs`
- **Foreign Key:** `company_id` → `companies(id)` ON DELETE CASCADE
- **Indexes:**
  - `idx_jobs_stream_status` on `(stream, status)` for fast student catalog filtering (IT vs Non-IT).
  - `idx_jobs_deadline` on `(application_deadline)` for automated expiration jobs.

### 5. `applications`
- **Foreign Keys:**
  - `student_profile_id` → `student_profiles(id)` ON DELETE CASCADE
  - `job_id` → `jobs(id)` ON DELETE CASCADE
- **Unique Constraint:** `uk_student_job` on `(student_profile_id, job_id)` prevents duplicate submissions at the database engine level.
- **Indexes:** `idx_applications_status` on `(status)`.

### 6. `application_status_history`
- **Foreign Key:** `application_id` → `applications(id)` ON DELETE CASCADE
- **Purpose:** Full immutable audit trail of candidate recruitment stages.

### 7. `interviews`
- **Foreign Key:** `application_id` → `applications(id)` ON DELETE CASCADE
- **Indexes:** `idx_interview_date` on `(interview_date)` for chronological timeline sorting.
