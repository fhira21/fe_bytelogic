import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

import Login from "./pages/Login";
import DashboardManager from "./pages/manager/Dashboard";
import DashboardKlien from "./pages/klien/Dashboard";
import DashboardKaryawan from "./pages/karyawan/Dashboard";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();

  const showNavbar = ["/login", "/"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard-manager"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <DashboardManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-klien"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <DashboardKlien />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-karyawan"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <DashboardKaryawan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
