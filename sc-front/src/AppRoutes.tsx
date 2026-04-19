import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

// Page wrapper with animation
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Animated routes component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/new-password" element={<PageWrapper><NewPassword /></PageWrapper>} />
        <Route path="/dashboard" element={
          <PageWrapper>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/grades" element={
          <PageWrapper>
            <PrivateRoute>
              <StudentGrades />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/subjects" element={
          <PageWrapper>
            <PrivateRoute>
              <StudentSubjects />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/teacher-students" element={
          <PageWrapper>
            <PrivateRoute teacherOnly>
              <TeacherStudents />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/teacher-messages" element={
          <PageWrapper>
            <PrivateRoute teacherOnly>
              <TeacherMessages />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/teacher-announcements" element={
          <PageWrapper>
            <PrivateRoute teacherOnly>
              <TeacherAnnouncements />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/parent-messages" element={
          <PageWrapper>
            <PrivateRoute>
              <ParentMessages />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/teacher-dashboard" element={
          <PageWrapper>
            <PrivateRoute teacherOnly>
              <TeacherDashboard />
            </PrivateRoute>
          </PageWrapper>
        } />
        <Route path="/admin-dashboard" element={
          <PageWrapper>
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default AppRoutes;