import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import NewPassword from "./pages/new-password/NewPassword";
import Dashboard from "./pages/dashboard/dashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TeacherDashboard from "./pages/dashboard/teacher/TeacherDashboard";
import TeacherAnnouncements from "./pages/teacher-announcements/TeacherAnnouncements";
import StudentGrades from "./pages/grades/StudentGrades";
import StudentSubjects from "./pages/subjects/StudentSubjects";
import TeacherStudents from "./pages/teacher-students/TeacherStudents";
import TeacherMessages from "./pages/teacher-messages/TeacherMessages";
import ParentMessages from "./pages/parent-messages/ParentMessages";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

function AppRoutes(){
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/new-password" element={<NewPassword/>}/>
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            }/>
            <Route path="/grades" element={
                <PrivateRoute>
                    <StudentGrades />
                </PrivateRoute>
            }/>
            <Route path="/subjects" element={
                <PrivateRoute>
                    <StudentSubjects />
                </PrivateRoute>
            }/>
            <Route path="/teacher-students" element={
                <PrivateRoute teacherOnly>
                    <TeacherStudents />
                </PrivateRoute>
            }/>
            <Route path="/teacher-messages" element={
                <PrivateRoute teacherOnly>
                    <TeacherMessages />
                </PrivateRoute>
            }/>
            <Route path="/teacher-announcements" element={
                <PrivateRoute teacherOnly>
                    <TeacherAnnouncements />
                </PrivateRoute>
            }/>
            <Route path="/parent-messages" element={
                <PrivateRoute>
                    <ParentMessages />
                </PrivateRoute>
            }/>
            <Route path="/teacher-dashboard" element={
                <PrivateRoute teacherOnly>
                    <TeacherDashboard />
                </PrivateRoute>
            }/>
            <Route path="/admin-dashboard" element={
                <PrivateRoute adminOnly>
                    <AdminDashboard />
                </PrivateRoute>
            }/>
        </Routes>
    </BrowserRouter>
)}

export default AppRoutes;