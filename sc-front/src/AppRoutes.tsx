import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/Register";
import Dashboard from "./pages/dashboard/dashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

function AppRoutes(){
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <Dashboard />
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