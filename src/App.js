import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardManager from "./pages/manager/Dashboard";
import ProjectDataPage from "./pages/manager/DataProject";
import DashboardKlien from "./pages/klien/Dashboard";
import DashboardKaryawan from "./pages/karyawan/Dashboard";
import EmployeeList from "./pages/manager/DataKaryawan";
import AdminList from "./pages/manager/DataAdmin";
import ClientList from "./pages/manager/DataKlien";




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
          path="/data-project"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <ProjectDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-karyawan"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-admin"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <AdminList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-klien"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <ClientList />
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
