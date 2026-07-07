Athenaeum — Library Management System

Athenaeum is a full-stack Library Management System that helps manage books, borrowers, and book circulation with secure JWT-based authentication and role-based access control.


Tech Stack

Backend: ASP.NET Core 8 Web API, Entity Framework Core
Database: MySQL
Frontend: React (Vite), CSS
Authentication: JWT, BCrypt Password Hashing

Features

Book inventory management (CRUD, search, filter, pagination)
Borrower management
Book checkout and return with automatic availability updates
Overdue tracking and late fine calculation
JWT authentication with **Admin** and **Librarian** roles
Interactive API documentation using Swagger

Project Structure

```text
LibraryManagementSystem/
├── backend/
├── database/
└── frontend/
```

Setup

Backend

```bash
cd backend/LibraryManagementSystem.API
dotnet restore
dotnet run
```

Configure your MySQL connection string and JWT key in `appsettings.json` or using User Secrets.

Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

Frontend: http://localhost:5173
Backend API: http://localhost:5148
Swagger: http://localhost:5148/swagger

Default Login

```
Username: admin
Password: Admin@123
```

Future Enhancements

Refresh token authentication
Email/SMS due-date reminders
Reports and analytics dashboard
Background service for overdue updates
Unit testing
EF Core migrations

---

Developed as a full-stack CRUD application demonstrating authentication, authorization, RESTful API development, database management, and responsive frontend integration.
