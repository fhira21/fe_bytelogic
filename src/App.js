import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Unauthorized from "./pages/Unauthorized";
import EditProfile from "./pages/manager/EditProfile";

// Manager/Admin Pages
import DashboardManager from "./pages/manager/Dashboard";
import EmployeeList from "./pages/manager/EmployeeList";
import ClientList from "./pages/manager/ClientList";
import AdminList from "./pages/manager/AdminList";
import CustomerReviews from "./pages/manager/CustomerReviews";
import EmployeeEvaluation from "./pages/manager/EmployeeEvaluation";
import ProjectDataPage from "./pages/manager/DataProject";
import UserProfile from "./pages/manager/UserProfile";
import ViewProfile from "./pages/manager/ViewProfile";

import DataProject from "./pages/manager/DataProject";

// Klien & Karyawan Pages
import DashboardKlien from "./pages/klien/Dashboard";
import DashboardKaryawan from "./pages/karyawan/Dashboard";
import EvaluationPage from "./pages/klien/EvaluationPage";
import EvaluateDetailed from "./pages/karyawan/EvaluateDetailed";

// Global Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectDetail from "./pages/ProjectDetail";

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
          path="/evaluate/:projectId"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <EvaluationPage />
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
        <Route
          path="/detail-evaluasi"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <EvaluateDetailed />
            </ProtectedRoute>
          }
        />

        {/* ✅ Route tambahan untuk ProjectDetail */}
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute allowedRoles={["manager/admin", "client", "karyawan"]}>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />

        {/* ✅ Route tambahan untuk EmployeeList */}
        <Route
          path="/employee-list"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-manager"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <DashboardManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client-data"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <ClientList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-list"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <AdminList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-reviews"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <CustomerReviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-evaluation"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <EmployeeEvaluation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-project"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <DataProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-profile"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-profile"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <ViewProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["manager/admin"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />


      </Routes>
    </>
  );
}

export default App;
