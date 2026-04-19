# 📚 School Management Platform (ScPlat)

## 🧠 Overview

A full-stack school management platform designed for primary and secondary education. It allows teachers to manage student grades, exams, and announcements while students and parents can track academic performance and communicate efficiently.

The system is built with a relational database approach and role-based access control.

---

## 🚀 Features

### Authentication & Security
- 🔐 Role-based access control (`student`, `teacher`, `parent`, `admin`)
- 🔑 JWT authentication with httpOnly cookies
- 🔄 Password reset via email (nodemailer)
- 📧 Welcome emails on registration

### Teacher Features
- 👨‍🏫 Upload and manage student grades
- 📝 Create and manage exams
- 📢 Post announcements to courses
- 💬 messaging system with parents
- 📊 View enrolled courses and subjects

### Parent Features
- 👨‍👩‍👧 Monitor children's academic performance
- 💬 messaging system with teachers
- 📚 View enrolled subjects and exams

### Student Features
- 👦 View grades and academic record
- 📅 View exam schedule
- 📢 View announcements
- 💬 messaging system with teachers

### Messaging System
- 💬 Real-time messaging between users (WebSockets ready)
- 👥 Contact lists based on relationships

### Notifications
- 🔔 In-app notification system
- 📬 Unread message counts

---

## 🏗️ Architecture

### Frontend
- React 19 + Vite + TypeScript
- Framer Motion (page transitions)
- react-hot-toast (notifications)
- CSS Modules with dark mode support

### Backend
- Express.js
- Sequelize ORM
- MySQL
- Socket.io (for real-time features)

### Database Design

**Main entities:**
- `users` → all users (students, teachers, parents, admin)
- `courses` → school courses/classes
- `subjects` → subjects (Math, Language, etc.)
- `course_subject` → relation between courses and subjects
- `enrollment` → students assigned to courses
- `teacher_courses` → teachers assigned to course subjects
- `parent_student` → relationship between parents and students
- `grades` → student grades per subject
- `exams` → exams/tests
- `messages` → communication between users
- `notifications` → user notifications
- `announcements` → course announcements

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript |
| Styling | CSS Modules, Poppins font |
| Animations | Framer Motion |
| Backend | Express.js, Node.js |
| Database | MySQL, Sequelize ORM |
| Real-time | Socket.io |
| Email | Nodemailer (Gmail) |

---

## 🎨 Design System

- **Primary Color:** EduCAR Blue (#1e3a6e)
- **Font:** Poppins
- **Dark Mode:** Full support across all pages
- **Grid Backgrounds:** Reusable components

---

## 🔐 Roles & Permissions

| Role | Permissions |
|------|-------------|
| Student | View grades, exams, announcements, send messages |
| Teacher | Manage grades, create exams, post announcements, communicate |
| Parent | View children's grades, communicate with teachers |
| Admin | User management, teacher assignments |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Installation

```bash
# Install backend dependencies
cd sc-back
npm install

# Install frontend dependencies
cd ../sc-front
npm install
```

### Environment Variables

Create `.env` files:

**Backend (.env):**
```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=scplat
JWTSECRET=your_secret
GOOGLE_EMAIL=your_email@gmail.com
GOOGLE_APP_PASSWORD=your_app_password
```

### Running

```bash
# Start backend
cd sc-back
npm start

# Start frontend (development)
cd sc-front
npm run dev
```

---

## 📁 Project Structure

```
scplat/
├── sc-back/           # Backend
│   ├── controllers/  # Request handlers
│   ├── services/     # Business logic
│   ├── models/      # Sequelize models
│   ├── routes/      # API routes
│   └── middlewares/# Express middleware
│
└── sc-front/        # Frontend
    ├── src/
    │   ├── pages/      # Page components
    │   ├── components/ # Reusable components
    │   ├── services/   # API calls
    │   ├── contexts/   # React contexts
    │   └── styles/     # CSS files
    └── public/
```

---

## 📌 Author

**d.ail** - Full-stack developer

---

## ⭐ Notes

This is an ongoing project with continuous improvements. Features like real-time WebSocket messaging and more advanced reporting are planned for future releases.