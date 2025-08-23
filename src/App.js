// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

// Pages (global)
import Login from "./pages/Login";
import Home from "./pages/Home";
import Unauthorized from "./pages/Unauthorized";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

// Manager/Admin Pages
import DashboardManager from "./pages/manager/Dashboard";
import EmployeeList from "./pages/manager/EmployeeList";
import ClientList from "./pages/manager/ClientList";
import AdminList from "./pages/manager/AdminList";
import CustomerReviews from "./pages/manager/CustomerReviews";
import EmployeeEvaluation from "./pages/manager/EmployeeEvaluation";
import ProjectDataPage from "./pages/manager/DataProject";
import DataProject from "./pages/manager/DataProject"; // alias ke file yang sama
import UserProfile from "./pages/manager/UserProfile";
import ViewProfile from "./pages/manager/ViewProfile";
import EditProfile from "./pages/manager/EditProfile";

// Klien & Karyawan Pages
import DashboardKlien from "./pages/klien/Dashboard";
import EvaluationPage from "./pages/klien/EvaluationPage";
import ReviewFormPage from "./pages/klien/ReviewFormPage";

import DashboardKaryawan from "./pages/karyawan/Dashboard";
import EvaluateDetailed from "./pages/karyawan/EvaluateDetailed";
import ProjectWaitingList from "./pages/karyawan/ProjectWaitingList";
import ProjectOnProgress from "./pages/karyawan/ProjectOnProgress";
import ProjectCompleted from "./pages/karyawan/ProjectCompleted";
import KaryawanEditProfile from "./pages/karyawan/EditProfile";
import KlienEditProfile from "./pages/klien/EditProfile";

// Global Components
import Navbar from "./components/Navbar";
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

  // Navbar hanya muncul di "/" dan "/login"
  const showNavbar = ["/login", "/"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* ===== Publik ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Proyek publik/detail */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/project-details/:id" element={<ProjectDetail />} />

        {/* ===== Manager/Admin ===== */}
        <Route
          path="/dashboard-manager"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <DashboardManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-project"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <ProjectDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-data"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <DataProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-karyawan"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-list"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-list"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <AdminList />
            </ProtectedRoute>
          }
        />

        {/* Client List + alias */}
        <Route
          path="/client-data"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <ClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-klien"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <ClientList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-reviews"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <CustomerReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-evaluation"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <EmployeeEvaluation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-profile"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <ViewProfile />
            </ProtectedRoute>
          }
        />

        {/* Edit Profile (manager/admin) — dua path valid */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute allowedRoles={["manajer", "admin"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* ===== Klien ===== */}
        <Route
          path="/dashboard-klien"
          element={
            <ProtectedRoute allowedRoles={["klien"]}>
              <DashboardKlien />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluate/:projectId"
          element={
            <ProtectedRoute allowedRoles={["klien"]}>
              <EvaluationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/review" element={<ReviewFormPage />} />

        {/* ===== Karyawan ===== */}
        <Route
          path="/dashboard-karyawan"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <DashboardKaryawan />
            </ProtectedRoute>
          }
        />

        <Route path="/project-waiting-list" element={<ProjectWaitingList />} />

        {/* Lihat Semua: On Progress */}
        <Route
          path="/project-onprogress"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <ProjectOnProgress />
            </ProtectedRoute>
          }
        />

        {/* Lihat Semua: Completed */}
        <Route
          path="/project-completed"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <ProjectCompleted />
            </ProtectedRoute>
          }
        />

        {/* Alias untuk Waiting List (sementara arahkan ke On Progress agar tidak 404/Unauthorized) */}
        <Route
          path="/detail-project"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <ProjectOnProgress />
            </ProtectedRoute>
          }
        />

        {/* Detail/grafik evaluasi */}
        <Route
          path="/detail-evaluasi"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <EvaluateDetailed />
            </ProtectedRoute>
          }
        />

        {/* Edit Profile khusus Karyawan */}
        <Route
          path="/karyawan/profile"
          element={
            <ProtectedRoute allowedRoles={["karyawan"]}>
              <KaryawanEditProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/klien/profile"
          element={<KlienEditProfile />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-2">404 – Route not found</h1>
              <p className="text-gray-600">
                Halaman yang kamu tuju tidak ditemukan. Cek kembali URL-nya.
              </p>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;