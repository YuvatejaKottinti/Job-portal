# 🚀 Job Portal

A full-stack Job Portal web application built using **Java, Spring Boot, MySQL, React, and REST APIs**.

The application allows users to create accounts, browse available jobs, apply for jobs, and track their applications. Administrators can manage jobs, view applications, update application statuses, and monitor the platform through an admin dashboard.

---

## ✨ Features

### 👤 User Features

- User Registration
- User Login
- User Profile
- Browse Available Jobs
- Search Jobs
- View Job Details
- Apply for Jobs
- View My Applications
- Track Application Status

### 🛠️ Admin Features

- Admin Login
- Admin Dashboard
- Add Jobs
- Edit Jobs
- Delete Jobs
- View All Applications
- Update Application Status
- Monitor Job and Application Statistics

---

## 💻 Technologies Used

### Backend

- Java
- Spring Boot
- Spring Data JPA
- REST API
- Maven

### Database

- MySQL

### Frontend

- React
- JavaScript
- HTML
- CSS
- Vite

### Development Tools

- Visual Studio Code
- MySQL Workbench
- Git
- GitHub

---

## 🏗️ Project Structure

```text
Job-portal/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/jobportal/
│       │       ├── controller/
│       │       ├── model/
│       │       ├── repository/
│       │       ├── service/
│       │       └── JobportalApplication.java
│       │
│       └── resources/
│           └── application.properties
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md