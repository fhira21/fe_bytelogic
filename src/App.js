import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./pages/Login";
import DashboardManager from "./pages/manager/Dashboard";
import DashboardKlien from "./pages/klien/Dashboard";
import DashboardKaryawan from "./pages/karyawan/Dashboard";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();

  // Daftar path yang ingin menampilkan navbar umum
  const showNavbar = ["/login", "/"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-manager" element={<DashboardManager />} />
        <Route path="/dashboard-klien" element={<DashboardKlien />} />
        <Route path="/dashboard-karyawan" element={<DashboardKaryawan />} />
      </Routes>
    </>
  );
}

export default App;
