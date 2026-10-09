# Setup & Installation Guide: Campus Placement Assistance

## 1. Prerequisites
- **Java Development Kit (JDK):** Version 17+ or 21 LTS (Tested on Java 24 / 21)
- **Node.js & npm:** Node.js v18+ and npm v9+
- **Database (Optional for Dev):** MySQL 8.x (An embedded H2 in-memory database is enabled by default for zero-config local startup)
- **Maven:** Bundled via Maven Wrapper (`mvnw` / `mvnw.cmd`) or standalone Maven 3.8+

---

## 2. Quick Start: Local Development

### Step 1: Clone and Inspect
```bash
git clone https://github.com/your-username/campus-placement-assistance.git
cd campus-placement-assistance
```

### Step 2: Start the Java Backend (Spring Boot)
```bash
cd backend
# Run with bundled Maven Wrapper (defaults to dev profile with H2 database & pre-loaded seed data)
./mvnw spring-boot:run
# On Windows PowerShell:
.\mvnw.cmd spring-boot:run
```
- **Backend API Base URL:** `http://localhost:8080/api/v1`
- **Swagger / OpenAPI Documentation:** `http://localhost:8080/swagger-ui.html`
- **H2 Database Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:campusdb`, User: `sa`, Password: `password`)

### Step 3: Start the React Frontend
Open a separate terminal in the root directory:
```bash
npm install
npm run dev
```
- **Frontend App URL:** `http://localhost:5173`

---

## 3. Pre-configured Demo Accounts

The application automatically seeds realistic demo data on startup so all role workflows can be tested immediately:

| Role | Email | Password | Description |
|---|---|---|---|
| **Student** | `student@campus.edu` | `password123` | Pre-loaded student profile with CGPA 8.8, IT stream applications |
| **Recruiter** | `recruiter@google.com` | `password123` | Google Tech Recruiter with active job postings & applicants |
| **Placement Admin** | `admin@campus.edu` | `password123` | University Placement Officer with full administrative oversight |

---

## 4. Running with Production MySQL Database

1. Create a MySQL database:
```sql
CREATE DATABASE campus_placement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Configure environment variables in `backend/.env` or export them:
```env
SPRING_PROFILES_ACTIVE=prod
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campus_placement_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

3. Start backend:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```
