# 📚 School Management Platform

## 🧠 Overview
A school management platform designed for primary education.  
It allows teachers to manage student grades while students and parents can track academic performance and communicate efficiently.

The system is built with a relational database approach and role-based access control.

---

## 🚀 Features

- 👨‍🏫 Teachers can upload and manage student grades  
- 👨‍👩‍👧 Parents can monitor their children's academic performance  
- 👦 Students can view their grades and interact with teachers  
- 💬 Messaging system between users  
- 🔐 Role-based access control (`student`, `teacher`, `parent`)  
- 🏫 Course and subject management  
- 🔗 Support for complex relationships (parent-student, teacher-course, etc.)

---

## 🏗️ Database Design

The system is based on a relational database structure using MySQL.

### Main entities:

- `users` → stores all users (students, teachers, parents)
- `courses` → school courses/classes
- `subjects` → subjects (Math, Language, etc.)
- `course_subject` → relation between courses and subjects
- `enrollment` → students assigned to courses
- `teacher_courses` → teachers assigned to course subjects
- `parent_student` → relationship between parents and students
- `grades` → student grades per subject
- `messages` → communication between users

---

## 🔗 Relationships

- A **student** belongs to a course  
- A **course** has multiple subjects  
- A **teacher** can teach multiple subjects across courses  
- A **parent** can have multiple children  
- A **student** can have multiple parents/tutors  
- Messages are exchanged between users regardless of role  

---

## 🛠️ Tech Stack

- **Database:** MySQL (InnoDB engine)  
- **Architecture:** Relational database design  

---

## 🔐 Roles & Permissions

| Role    | Permissions |
|--------|-----------|
| Student | View grades, send messages |
| Teacher | Manage grades, communicate with students/parents |
| Parent  | View children's grades, communicate with teachers |

---

## 📈 Future Improvements

- Real-time messaging (WebSockets)  
- Notifications system  
- Authentication with JWT  
- Frontend dashboard (Angular)  
- Admin panel  
- Report generation  

---

## 💡 Purpose

This project was built to practice:

- Database design and normalization  
- Relationship modeling (1:N, N:N)  
- Role-based systems  
- Backend-oriented thinking  

---

## 📌 Author

**d.ail**

---

## ⭐ Notes

This is a work-in-progress project and may evolve with new features and improvements.