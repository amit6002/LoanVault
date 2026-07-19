# 🏦 LoanVault — Enterprise Loan Management System (LMS)

[![React](https://img.shields.io/badge/Frontend-React%2018-blue)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.3.5-green)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-blue)](https://neon.tech/)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20Google%20OAuth2-red)](https://jwt.io/)

A full-stack, enterprise-grade **Loan Management System** designed for modern financial institutions and borrowers. Built with **React 18** and **Spring Boot 3**, featuring role-based workflows across 4 distinct user modules, digital document verification, credit bureau scoring, and automated email OTP workflows.

---

## 🌟 Key Features

- 👤 **Borrower Portal**: 7-step loan application wizard, document uploads, EMI calculator, real-time application tracking, and helpdesk support.
- 📋 **Loan Officer Workspace**: Underwriting queue, interactive PDF document inspection, manual KYC checkboxes, and CIBIL credit score pull engine.
- 👔 **Loan Manager Desk**: Officer proposal audit, 1-click sanction approvals, portfolio risk reports, and fund disbursement release.
- ⚙️ **System Administrator**: User directory management, staff invitations, RBI interest rate bounds, and immutable security audit logs.
- 🔐 **Enterprise Security**: JWT stateless authentication, Google OAuth2 integration, BCrypt password hashing, and role-based route guards (`@PreAuthorize`).
- 📩 **Email OTP Gateway**: Gmail SMTP integration delivering styled HTML 6-digit OTP codes for password recovery.

---

## 🚀 Live Demo & Recruiter 1-Click Credentials

Visit the login page (`/login`) and click any **1-Click Demo Login** button to instantly explore the dashboard:

| Role | Email | Password | Quick Action |
|---|---|---|---|
| 👤 **Borrower** | `borrower@loanvault.com` | `Borrower@1234` | Click `[ 👤 Borrower ]` |
| 📋 **Loan Officer** | `officer@loanvault.com` | `Officer@1234` | Click `[ 📋 Loan Officer ]` |
| 👔 **Loan Manager** | `manager@loanvault.com` | `Manager@1234` | Click `[ 👔 Loan Manager ]` |
| ⚙️ **System Admin** | `admin@loanvault.com` | `Admin@1234` | Click `[ ⚙️ System Admin ]` |

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS v4, Inter Typography
- **Icons**: Lucide React
- **Routing**: React Router v6

### Backend
- **Framework**: Java 17, Spring Boot 3.3.5
- **Security**: Spring Security, JJWT (v0.12.6), OAuth2 Client
- **ORM**: Spring Data JPA, Hibernate
- **Database**: PostgreSQL (Cloud hosted on Neon)
- **Email**: Spring Starter Mail (Gmail SMTP)
- **Build Tool**: Apache Maven

---

## 📁 Repository Structure

```
LMS/
├── src/                           # React 18 Frontend
│   ├── api/apiClient.js           # Centralized JWT fetch wrapper
│   ├── components/common/         # Reusable UI Design System (Input, Button, Select, Checkbox)
│   ├── features/
│   │   ├── admin/                 # Admin User Management & Audit Logs
│   │   ├── auth/                  # Login, Register, Google OAuth2 Callback, OTP Reset
│   │   ├── borrower/              # 7-Step Loan Wizard & My Applications
│   │   ├── emi-calculator/        # Interactive EMI Calculator
│   │   ├── manager/               # Approval Queue & Disbursements
│   │   └── officer/               # Underwriting Queue & Document Inspection
│   ├── layouts/                   # Dashboard & Public Layouts
│   └── routes/                    # Protected Route Tree
└── backend/                       # Spring Boot 3 REST API
    ├── pom.xml
    └── src/main/java/com/loanvault/
        ├── config/                # SecurityConfig, GlobalExceptionHandler, DataSeeder
        ├── controller/            # AuthController, LoanApplicationController, AdminController
        ├── entity/                # User, LoanApplication, Loan, OtpToken, AuditLog
        ├── repository/            # JPA Data Repositories
        ├── security/              # JwtAuthFilter, JwtService, OAuth2SuccessHandler
        └── service/               # AuthService, EmailService, AuditService
```

---

## 💻 Local Setup Instructions

### 1. Prerequisites
- **Java**: 17+
- **Node.js**: 18+
- **Maven**: 3.9+

### 2. Run Backend (Spring Boot)
```bash
cd backend
# Create application-local.properties with your Neon DB & Google OAuth credentials
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
*Backend starts on `http://localhost:8080`*

### 3. Run Frontend (React)
```bash
# In project root
npm install
npm run dev
```
*Frontend starts on `http://localhost:5173`*

---

## 🌐 Deployment

- **Frontend**: Deploy to **Vercel** (`npm run build`, set `VITE_API_URL`)
- **Backend**: Deploy to **Railway** (Set `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `MAIL_USERNAME`, `MAIL_PASSWORD`)
- **Database**: **Neon PostgreSQL Cloud**
