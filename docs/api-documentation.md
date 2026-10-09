# REST API Documentation: Campus Placement Assistance
**Base Path:** `/api/v1`  
**Authentication Scheme:** `Bearer <JWT_TOKEN>` via `Authorization` Header

---

## 1. Authentication & Account Management (`/api/v1/auth`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register/student` | Public | Register new student candidate account & profile |
| `POST` | `/api/v1/auth/register/company` | Public | Register new recruiter/company account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user credentials and issue signed JWT |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user session and role profile |

### Example: Login Request & Response
```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "student@campus.edu",
  "password": "SecurePassword123!"
}
```
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "email": "student@campus.edu",
      "role": "ROLE_STUDENT",
      "fullName": "Guru Prasad"
    }
  },
  "timestamp": "2026-10-09T13:30:00Z"
}
```

---

## 2. Student Management (`/api/v1/students`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/students/me` | `ROLE_STUDENT` | Fetch full student profile and academic details |
| `PUT` | `/api/v1/students/me` | `ROLE_STUDENT` | Update student profile, CGPA, branch, skills |
| `GET` | `/api/v1/students/me/applications` | `ROLE_STUDENT` | List all jobs applied by the authenticated student |
| `GET` | `/api/v1/students/me/interviews` | `ROLE_STUDENT` | View scheduled interview rounds and meeting links |

---

## 3. Job Management & Search (`/api/v1/jobs`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/jobs` | Public/Auth | Search and filter jobs with pagination (`stream`, `search`, `status`) |
| `GET` | `/api/v1/jobs/{id}` | Public/Auth | Get detailed job posting with requirements |
| `POST` | `/api/v1/jobs` | `ROLE_RECRUITER`, `ROLE_ADMIN` | Publish new job listing with eligibility thresholds |
| `PUT` | `/api/v1/jobs/{id}` | `ROLE_RECRUITER`, `ROLE_ADMIN` | Update job posting |
| `PATCH` | `/api/v1/jobs/{id}/status` | `ROLE_RECRUITER`, `ROLE_ADMIN` | Close or toggle job active status |

---

## 4. Application & Workflow Management (`/api/v1/applications`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/jobs/{jobId}/applications` | `ROLE_STUDENT` | Submit job application with eligibility validation |
| `GET` | `/api/v1/jobs/{jobId}/applications` | `ROLE_RECRUITER`, `ROLE_ADMIN` | List all applicants for a company job posting |
| `PATCH` | `/api/v1/applications/{id}/status` | `ROLE_RECRUITER`, `ROLE_ADMIN` | Progress recruitment status (`SHORTLISTED`, `REJECTED`, etc.) |
| `POST` | `/api/v1/applications/{id}/withdraw` | `ROLE_STUDENT` | Withdraw application prior to final decision |

---

## 5. Interview Management (`/api/v1/interviews`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/interviews` | `ROLE_RECRUITER`, `ROLE_ADMIN` | Schedule interview round for shortlisted candidate |
| `PUT` | `/api/v1/interviews/{id}` | `ROLE_RECRUITER`, `ROLE_ADMIN` | Update interview details, time, or feedback |
| `GET` | `/api/v1/interviews/my-schedule` | Authenticated | Retrieve user-specific interview schedule |

---

## 6. Administration & Reporting (`/api/v1/admin`)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | `ROLE_ADMIN` | Retrieve real-time placement stats & KPI metrics |
| `GET` | `/api/v1/admin/companies` | `ROLE_ADMIN` | List registered companies pending verification |
| `PATCH` | `/api/v1/admin/companies/{id}/verify` | `ROLE_ADMIN` | Approve or reject company recruitment access |
| `GET` | `/api/v1/admin/audit-logs` | `ROLE_ADMIN` | Query administrative audit trails |
