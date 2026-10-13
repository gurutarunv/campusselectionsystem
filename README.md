# Campus Placement Assistance

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)](LICENSE)

An enterprise-grade **Campus Recruitment and Placement Management Platform** designed to streamline interactions between **Students, Corporate Recruiters, and University Placement Officers**.

Built with a modern **Java 21 + Spring Boot 3** modular backend and a responsive **React 19** frontend, featuring stateless JWT authentication, role-based access control, an automated eligibility engine, and real-time recruitment lifecycle tracking.

---

## 🏛️ System Architecture

```
campus-placement-assistance/
├── backend/                       # Spring Boot 3.3.4 (Java 21 LTS)
│   ├── src/main/java/com/campusplacement/
│   │   ├── config/                # OpenAPI Swagger & MVC Configurations
│   │   ├── controller/            # REST API Controllers (/api/v1/...)
│   │   ├── dto/                   # Request & Response Data Transfer Objects
│   │   ├── entity/                # JPA Relational Entities
│   │   ├── enums/                 # Domain Enums (Role, JobStream, Stage)
│   │   ├── exception/             # Centralized RFC-7807 Error Handling
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   ├── security/              # JWT Token Provider, Filters & BCrypt
│   │   └── service/               # Core Business Logic & Eligibility Engine
│   ├── src/main/resources/
│   │   ├── application.yml        # Dev (H2) & Prod (MySQL) Profiles
│   │   └── db/migration/          # Relational Schema & Seed SQL Scripts
│   ├── src/test/java/             # Automated Unit & MockMvc Test Suite
│   └── pom.xml                    # Maven Dependency Build File
│
├── src/                           # React 19 + Vite Frontend
│   ├── components/                # Reusable UI (Navbar, Logo, Toasts)
│   ├── pages/                     # Student, Recruiter, Admin & Job Portals
│   ├── index.css                  # Enterprise Design System
│   ├── App.jsx                    # Navigation & Role Session Manager
│   └── main.jsx
│
├── docs/                          # Comprehensive Architectural Documentation
│   ├── system-architecture.md     # High-Level Architecture & Request Flows
│   ├── database-schema.md         # ER Diagrams & Indexing Strategy
│   ├── api-documentation.md       # Full REST API Endpoint Contracts
│   ├── java-interview-guide.md    # Java & Spring Boot Interview Q&A
│   ├── security-design.md         # Threat Model & RBAC Matrix
│   ├── setup-guide.md             # Local Installation Guide
│   └── deployment-guide.md        # Docker & Cloud Deployment Instructions
│
├── docker-compose.yml             # Orchestration for MySQL 8 & Backend
├── Dockerfile                     # Multi-Stage Backend Docker Build
└── README.md
```

---

## 🚀 Key Features

### 🎓 1. Student Portal & Streamlined Account Onboarding
- **Streamlined Account Creation:** Student registration focuses purely on essential credentials: **Full Name**, **Age**, **Email Address**, and **Password** (with show/hide toggle).
- **Comprehensive Profile Setup:** Immediately after account creation, students are routed to the Academic Profile & Placement Setup section to complete their **Department / Branch**, **Graduation Year**, **CGPA**, **Technical Skills** (interactive tag input), and **Direct PDF Resume Upload**.
- **Offline & Network Resilience:** Eliminates raw connection errors ("Failed to fetch") with automatic local session fallback if the Spring Boot backend is offline, while syncing seamlessly whenever the backend is running.
- **Direct PDF Resume Upload:** Modern drag-and-drop & file picker uploader (5 MB limit). Replaces raw URLs with authentic binary files.
- **Magic-Byte Signature Verification:** Server inspects file headers for `%PDF` magic bytes (`0x25 0x50 0x44 0x46`) to block spoofed or renamed executables.
- **Secure File Storage & RBAC:** Unique server-side UUID storage names outside the public web root (`uploads/resumes`), with path-traversal safeguards and streaming preview (`inline`) and download (`attachment`) endpoints restricted to the student owner, recruiters, and placement administrators.
- **Dedicated Profile Editor:** Allows students to update personal/academic info, edit technical skill chips, and replace or delete their resume PDF anytime without creating a new account.
- **Placement Stream Browsing:** Explore verified **IT and Non-IT / Healthcare** placement drives with automated eligibility verification.
- **Application Lifecycle Tracking:** Monitor progress across stages (`Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Selected` / `Rejected`).
- **Interview Portal:** Access scheduled interview rounds, interviewers, and Google Meet virtual room links.

### 💼 2. Recruiter & Corporate Portal
- **Drive Publishing:** Post job openings with custom CGPA thresholds, target branches, salary packages (CTC), and required skills.
- **Candidate Pipeline Review:** Filter applicants by CGPA, branch, and contact details.
- **Candidate Resume Preview:** One-click direct preview and download of applicant PDF resumes directly from the recruiter pipeline.
- **Multi-Round Interview Scheduler:** Schedule Technical, System Design, HR, and On-Campus interview rounds.
- **Recruitment Stage Decisions:** Update candidate outcomes in real time.

### 🏛️ 3. University Placement Officer / Admin Console
- **Institutional Analytics:** Real-time KPI dashboard tracking total registrations, placement percentage, active corporate partners, and total job offers.
- **Corporate Partner Verification:** Approve or moderate company recruitment accounts before they publish drives.
- **Placement Registry & Audit Logging:** Centralized oversight of all participating students and immutable audit trail.

### 🌐 4. Animated Neural-Network Background
- **Subtle AI/Tech Aesthetic:** Replaces static background dots with an interactive, responsive HTML5 Canvas simulation of interconnected nodes and proximity lines.
- **Polished Palette:** Delicate blue (`#3B82F6`), cyan (`#06B6D4`), and violet (`#8B5CF6`) pulses that stay non-intrusive behind form cards and dashboard tables.
- **Accessibility & Performance:** Features `pointer-events: none` to never block clicks, throttled resize handlers, and automatically respects the user's `prefers-reduced-motion` accessibility preferences.

---

## ⚡ 1-Click Demo Accounts (Evaluator Shortcuts)

Normal registration and login flows collect and authenticate real user input. For evaluator convenience, clearly identified 1-click demo buttons are provided on the login page:

| Portal | Email | Password | Role Description |
|---|---|---|---|
| **Student** | `student@campus.edu` | `Student@123` | Pre-loaded candidate (CGPA: 8.85, CS Branch) |
| **Recruiter** | `recruiter@google.com` | `Recruiter@123` | Google Tech Recruiter with active drives |
| **Placement Admin** | `admin@campus.edu` | `Admin@123` | University Placement Officer |

---

## 🛠️ Quick Start

### 1. Start the React Frontend
```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Start the Spring Boot Backend (Java 21)
```bash
cd backend
# Starts in dev profile with embedded H2 database and pre-loaded seed data
./mvnw spring-boot:run
# On Windows:
.\mvnw.cmd spring-boot:run
```
- **API Base:** `http://localhost:8080/api/v1`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **H2 Database Console:** `http://localhost:8080/h2-console`

### 3. Run with Docker Compose (MySQL 8 + Backend)
```bash
docker compose up --build -d
```

---

## 📚 Architectural Documentation

- 📐 **[System Architecture](docs/system-architecture.md)**
- 🗄️ **[Database Schema & ER Diagrams](docs/database-schema.md)**
- 🔌 **[REST API Documentation](docs/api-documentation.md)**
- 🛡️ **[Security Design & RBAC](docs/security-design.md)**
- 💡 **[Java Developer Interview Guide](docs/java-interview-guide.md)**
- ⚙️ **[Local Setup Guide](docs/setup-guide.md)**
- 🚢 **[Deployment Guide](docs/deployment-guide.md)**

---

## 🧪 Automated Testing
```bash
cd backend
./mvnw test
```
Includes:
- Service-layer business logic tests with **JUnit 5 & Mockito**.
- Eligibility engine constraint verification.
- Duplicate application prevention tests.
- Web API endpoint tests with **MockMvc**.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
