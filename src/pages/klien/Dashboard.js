import React from 'react';
import { useNavigate } from "react-router-dom";
import "../../style/klien/Dashboard.css";

const DashboardKlien = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Bersihkan data login dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Arahkan kembali ke halaman login
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard Klien</h1>
      <button onClick={handleLogout} className="logout-button">
        🚪 Logout
      </button>
    </div>
  );
};

export default DashboardKlien;
