import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";

import Login from "./pages/Login";
<<<<<<< HEAD
import DashboardManager from "./pages/manager/Dashboard";
import EmployeeList from "./pages/manager/EmployeeList";
import ClientData from "./pages/manager/ClientList";
import AdminList from "./pages/manager/AdminList";
import CustomerReviews from "./pages/manager/CustomerReviews";
import EmployeeEvaluation from "./pages/manager/EmployeeEvaluation";
import DataProject from "./pages/manager/DataProject";
import DashboardKlien from "./pages/klien/Dashboard";
import DashboardKaryawan from "./pages/karyawan/Dashboard";
=======
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
<<<<<<< HEAD
import ProjectDetail from "./pages/ProjectDetail";
import UserProfile from "./pages/manager/UserProfile";
import ViewProfile from "./pages/manager/ViewProfile";
=======
import DashboardManager from "./pages/manager/Dashboard";
import ProjectDataPage from "./pages/manager/DataProject";
import DashboardKlien from "./pages/klien/Dashboard";
import DashboardKaryawan from "./pages/karyawan/Dashboard";
import EmployeeList from "./pages/manager/DataKaryawan";
import AdminList from "./pages/manager/DataAdmin";
import ClientList from "./pages/manager/DataKlien";



>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396

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
              <ClientData />
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

      </Routes>
    </>
  );
}

export default App;
