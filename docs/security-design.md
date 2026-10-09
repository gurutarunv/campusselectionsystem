# Security Design & Threat Model: Campus Placement Assistance

## 1. Security Architecture Principles

1. **Principle of Least Privilege:** Users receive only the minimum permissions required for their role (`ROLE_STUDENT`, `ROLE_RECRUITER`, `ROLE_ADMIN`).
2. **Never Trust the Client:** All role verification, student identity resolution, application ownership checks, and eligibility checks are performed strictly on the Spring Boot backend using the authenticated `SecurityContextHolder`.
3. **Defense in Depth:** Applied at the network layer (CORS/CSRF), web filter layer (JWT Filter), service layer (`@PreAuthorize`), and database layer (unique constraints & foreign keys).

---

## 2. Authentication & JWT Token Management

- **Algorithm:** HMAC-SHA256 (256-bit cryptographically secure key).
- **Token Claims:** `sub` (User Email), `userId`, `roles` (`ROLE_STUDENT`), `iat` (Issued At), `exp` (Expires At).
- **Expiration:** Configurable (Default: 24 hours for access token).
- **Password Storage:** One-way salted hashing using `BCryptPasswordEncoder` with strength 12.

---

## 3. Resource Ownership & Access Control Matrix

| Endpoint / Operation | Student | Recruiter | Placement Admin | Security Check |
|---|---|---|---|---|
| View own applications | Yes | No | Yes | `WHERE student.user.id = :authUserId` |
| View company applicants | No | Yes (own jobs only) | Yes (all) | `WHERE job.company.user.id = :authUserId` |
| Update application status | No | Yes (own jobs only) | Yes | Validated against job recruiter ownership |
| Schedule interviews | No | Yes (own applicants) | Yes | Validated against applicant shortlisted state |
| Verify new company | No | No | Yes | `@PreAuthorize("hasRole('ADMIN')")` |
| Moderate job postings | No | No | Yes | `@PreAuthorize("hasRole('ADMIN')")` |

---

## 4. Input Validation & Injection Defenses

- **SQL Injection:** Mitigated via Spring Data JPA and Hibernate parameterized queries with prepared statements.
- **Cross-Site Scripting (XSS):** Request payloads validated with `@NotBlank`, `@Email`, `@Size`, and sanitized before JSON serialization.
- **Cross-Origin Resource Sharing (CORS):** Strict whitelist of trusted origins (`http://localhost:5173`, `http://localhost:3000`) with allowed methods (`GET, POST, PUT, PATCH, DELETE, OPTIONS`).
