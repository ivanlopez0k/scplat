import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";

function AppRoutes(){
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
    </BrowserRouter>
)}

export default AppRoutes;