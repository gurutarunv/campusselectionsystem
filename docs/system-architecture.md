# System Architecture: Campus Placement Assistance

## 1. Architectural Overview

**Campus Placement Assistance** is built as a clean, high-performance, layered **Modular Monolith** designed for enterprise recruitment workflows. The system separates concerns between a modern reactive client frontend and a robust, secure Spring Boot backend.

```mermaid
graph TB
    subgraph Client Tier [Frontend - React 19 + Vite]
        UI[Responsive Modern UI / React Components]
        State[Auth & App State / Context API]
        ApiClient[Axios/Fetch Centralized API Client]
        UI --> State
        State --> ApiClient
    end

    subgraph Security & Filter Tier
        SecFilter[Spring Security Filter Chain]
        JwtFilter[JwtAuthenticationFilter]
        CORS[CORS & CSRF Configurations]
        ApiClient -->|HTTPS + JWT Bearer| SecFilter
        SecFilter --> JwtFilter
        JwtFilter --> CORS
    end

    subgraph Presentation Tier [Spring Web REST Controllers]
        AuthCtrl[AuthController]
        StudCtrl[StudentController]
        CompCtrl[CompanyController]
        JobCtrl[JobController]
        AppCtrl[ApplicationController]
        IntCtrl[InterviewController]
        AdminCtrl[AdminController]
        NotifCtrl[NotificationController]
        CORS --> AuthCtrl & StudCtrl & CompCtrl & JobCtrl & AppCtrl & IntCtrl & AdminCtrl & NotifCtrl
    end

    subgraph Service Tier [Business Logic & Validation]
        AuthService[AuthService]
        StudentService[StudentService]
        JobService[JobService & Eligibility Engine]
        AppService[ApplicationService & State Machine]
        CompService[CompanyService]
        IntService[InterviewService]
        AdminService[AdminService]
        NotifService[NotificationService]
        
        AuthCtrl --> AuthService
        StudCtrl --> StudentService
        JobCtrl --> JobService
        AppCtrl --> AppService
        CompCtrl --> CompService
        IntCtrl --> IntService
        AdminCtrl --> AdminService
        NotifCtrl --> NotifService
    end

    subgraph Persistence Tier [Spring Data JPA & Hibernate]
        UserRepo[UserRepository]
        StudRepo[StudentProfileRepository]
        CompRepo[CompanyRepository]
        JobRepo[JobRepository]
        AppRepo[ApplicationRepository]
        IntRepo[InterviewRepository]
        NotifRepo[NotificationRepository]
        AuditRepo[AuditLogRepository]
        
        AuthService --> UserRepo
        StudentService --> StudRepo & AppRepo
        JobService --> JobRepo & StudRepo
        AppService --> AppRepo & JobRepo & StudRepo & NotifRepo
        CompService --> CompRepo & JobRepo
        IntService --> IntRepo & AppRepo & NotifRepo
        AdminService --> UserRepo & CompRepo & StudRepo & AuditRepo
    end

    subgraph Database Tier [Relational Storage]
        DB[(MySQL 8.x / Embedded H2 Database)]
        UserRepo & StudRepo & CompRepo & JobRepo & AppRepo & IntRepo & NotifRepo & AuditRepo --> DB
    end
```

---

## 2. Layer Responsibilities

### 1. Presentation Tier (REST Controllers)
- **Role:** Exposes versioned REST API endpoints (`/api/v1/...`).
- **Rules:**
  - Controllers contain zero business logic.
  - Accept and validate Request DTOs using `@Valid`.
  - Delegate execution immediately to appropriate Service interfaces.
  - Return strongly-typed `ResponseEntity<ApiResponse<T>>`.

### 2. Service Tier (Business Logic & Transactions)
- **Role:** Enforces all core business rules, transactional boundaries, eligibility logic, and state transitions.
- **Key Capabilities:**
  - **Eligibility Verification:** Evaluates candidate CGPA, graduating year, branch, and active application limits before permitting job application.
  - **Duplicate Prevention:** Verifies whether a student has an existing active application for a target position.
  - **Recruitment State Machine:** Validates allowed status transitions (`APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `SELECTED`/`REJECTED`).
  - **Auditing & Notifications:** Emits asynchronous notifications and audit log records upon state modifications.

### 3. Persistence Tier (Entities & Repositories)
- **Role:** Handles object-relational mapping (ORM) with Hibernate and JPA.
- **Features:**
  - Primary/foreign key constraints with referential integrity.
  - Custom JPQL queries with index utilization.
  - Pagination, sorting, and dynamic specification queries.

### 4. Security Tier
- **Role:** Stateless authentication via signed JSON Web Tokens (JWT).
- **Features:**
  - BCrypt password hashing (strength 12).
  - Role-Based Access Control (`ROLE_STUDENT`, `ROLE_RECRUITER`, `ROLE_ADMIN`).
  - Method-level security with `@PreAuthorize`.

---

## 3. Request-Response Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Browser)
    participant API as ApiClient (Frontend)
    participant Sec as Spring Security Filter
    participant Ctrl as ApplicationController
    participant Svc as ApplicationService
    participant Elig as EligibilityEngine
    participant Repo as ApplicationRepository
    participant DB as MySQL Database

    Student->>API: Click "Apply Now" (Job ID: 42)
    API->>Sec: POST /api/v1/jobs/42/applications (Bearer JWT)
    Sec->>Sec: Validate Token Signature & Expiry
    Sec->>Ctrl: Pass Authenticated Principal
    Ctrl->>Svc: applyForJob(studentId, jobId, applicationDTO)
    Svc->>Elig: verifyEligibility(studentProfile, jobCriteria)
    alt Ineligible (CGPA < Min CGPA or Branch Mismatch)
        Elig-->>Svc: Throw IneligibleApplicationException
        Svc-->>Ctrl: GlobalExceptionHandler catches error
        Ctrl-->>API: 400 Bad Request (RFC-7807 Error Response)
    else Eligible
        Svc->>Repo: existsByStudentIdAndJobId(studentId, jobId)
        alt Already Applied
            Repo-->>Svc: true
            Svc-->>Ctrl: Throw DuplicateResourceException
            Ctrl-->>API: 409 Conflict ("Already applied for this position")
        else Not Yet Applied
            Svc->>Repo: save(new Application(APPLIED))
            Repo->>DB: INSERT INTO applications ...
            DB-->>Repo: Saved entity with generated ID
            Svc-->>Ctrl: ApplicationResponse DTO
            Ctrl-->>API: 201 Created (ApiResponse<ApplicationResponse>)
            API-->>Student: Update UI State & Show Success Toast
        end
    end
```
