# Java Interview Guide: Campus Placement Assistance
*Comprehensive Q&A reference for entry-level & full-stack Java Developer interviews based on real code in this project.*

---

## 1. Core Java & Object-Oriented Principles

### Q1: How does this project apply OOP and SOLID principles?
- **Single Responsibility Principle (SRP):** Controllers only handle HTTP translation and validation; Services handle business rules; Repositories only execute database interactions.
- **Open/Closed Principle (OCP):** Service interfaces allow extending functionality (e.g., adding Email notification provider or SMS provider) without altering calling classes.
- **Dependency Inversion (DIP):** Controllers and Services depend on abstractions (interfaces) rather than concrete implementations, wired seamlessly via Spring's `@Autowired` constructor injection.

---

## 2. Spring Boot & Architecture

### Q2: Why did you structure the backend as a Controller-Service-Repository architecture?
- **Separation of Concerns:** Isolating business logic from HTTP transport mechanics ensures that business workflows (like candidate eligibility checks and duplicate application detection) can be unit-tested in isolation using Mockito without launching an HTTP web server.
- **Maintainability:** Changes to database storage (e.g., switching from H2 to MySQL or adding a caching layer) require zero changes in the Controller layer.

### Q3: Why return DTOs instead of direct JPA Entities in REST APIs?
1. **Security & Data Hiding:** Prevents accidental leakage of sensitive fields (e.g., `password_hash`, internal audit flags) to client responses.
2. **Decoupling from Persistence Schema:** The API response contract remains stable even if internal database tables are refactored or normalized.
3. **Preventing LazyInitializationException & Circular References:** Jackson serialization of bi-directional JPA relationships (like User <-> StudentProfile) can trigger infinite recursion or runtime lazy-loading errors.

---

## 3. Spring Security & JWT

### Q4: How is authentication and role-based access control implemented?
- The application uses **Stateless Session Management** (`SessionCreationPolicy.STATELESS`) with signed **JSON Web Tokens (JWT)**.
- When a user logs in via `/api/v1/auth/login`, credentials are verified using `BCryptPasswordEncoder`. If valid, a cryptographically signed HMAC-SHA256 JWT containing the user ID, email, and granted authorities (`ROLE_STUDENT`, `ROLE_RECRUITER`, `ROLE_ADMIN`) is returned.
- On subsequent requests, `JwtAuthenticationFilter` intercepts the HTTP header `Authorization: Bearer <token>`, validates the signature, extracts the user details, and populates the `SecurityContextHolder`.
- Method-level access is enforced using `@PreAuthorize("hasRole('RECRUITER')")` or `@Secured`.

---

## 4. Spring Data JPA & Transaction Management

### Q5: How do you prevent duplicate job applications?
1. **Database Level:** A unique composite constraint `uk_student_job` on `(student_profile_id, job_id)` in the `applications` table.
2. **Service Level:** The `ApplicationService.applyForJob()` checks `applicationRepository.existsByStudentProfileIdAndJobId(studentId, jobId)` and throws a `DuplicateResourceException` before attempting insertion.
3. **Transaction Isolation:** Marked with `@Transactional(isolation = Isolation.READ_COMMITTED)` to guarantee atomic commits across multi-table operations (application creation + notification + audit log).

---

## 5. Exception Handling & REST API Design

### Q6: How does the application handle runtime errors centrally?
- A `@RestControllerAdvice` class (`GlobalExceptionHandler`) intercepts all unhandled exceptions and translates them into uniform, machine-readable JSON error responses containing:
  - `timestamp`: UTC ISO timestamp
  - `status`: HTTP status code (400, 401, 403, 404, 409, 500)
  - `error`: Error category name
  - `message`: User-friendly descriptive error message
  - `path`: Target request URI

---

## 6. Testing Strategy

### Q7: How did you test the backend application?
- **Unit Tests with JUnit 5 & Mockito:** Tested individual service methods (e.g., `JobServiceTest`, `ApplicationServiceTest`) by mocking repository dependencies.
- **Controller Integration Tests with `@WebMvcTest` / MockMvc:** Tested endpoint security, request validation, and HTTP status codes.
