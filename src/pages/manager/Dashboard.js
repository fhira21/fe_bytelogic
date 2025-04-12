import React from "react";
import { useNavigate } from "react-router-dom";
import "../../style/manager/Dashboard.css";
import ProfilePic from "../../assets/images/pp.png";

const DashboardManager = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Tambahkan logika logout jika diperlukan
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">Bytelogic</div>
        <div className="sidebar-menu">
          <button className="active">📊 Dashboard</button>
          <button>📁 Data Karyawan</button>
          <button>📁 Data Klien</button>
          <button>📁 Data Admin</button>
          <button>📂 Data Project</button>
          <button>📈 Evaluasi Karyawan</button>
          <button>⭐ Review</button>
        </div>

        {/* Sidebar Footer dengan Tombol Keluar */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="breadcrumbs">
            <small>Pages / Dashboard</small>
            <h2>Main Dashboard</h2>
          </div>
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Cari" />
          </div>
          <div className="topbar-right">
            <i className="fas fa-bell notification-icon"></i>
            <div className="profile">
              <img src={ProfilePic} alt="Aloy" />
              <div className="profile-info">
                <span className="name">Aloy</span>
                <span className="role">Manajer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Cards */}
        <div className="info-cards">
          <div className="card active">Manajemen Karyawan<br /><strong>20 Karyawan</strong></div>
          <div className="card">Data Klien<br /><strong>100 Klien</strong></div>
          <div className="card">Data Project<br /><strong>20 Project</strong></div>
          <div className="card">Evaluasi Karyawan<br /><strong>20 Karyawan</strong></div>
        </div>

        {/* Status Project Table */}
        <div className="card-box">
          <h3>Status Project</h3>
          <table>
            <thead>
              <tr>
                <th>Nama Project</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Progres</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Website Manajemen Karyawan</td>
                <td>Berjalan</td>
                <td>28 Agustus 2025</td>
                <td><progress value="25" max="100"></progress></td>
                <td>Tahap Analisis</td>
              </tr>
              <tr>
                <td>Website Penjualan Gitar</td>
                <td>Berjalan</td>
                <td>12 Maret 2025</td>
                <td><progress value="40" max="100"></progress></td>
                <td>Tahap Desain</td>
              </tr>
              <tr>
                <td>Website Penilaian Karyawan</td>
                <td>Selesai</td>
                <td>20 April 2025</td>
                <td><progress value="100" max="100"></progress></td>
                <td>Tahap Front end</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status Karyawan Table */}
        <div className="card-box">
          <h3>Status Karyawan</h3>
          <table>
            <thead>
              <tr>
                <th>Status Karyawan</th>
                <th>Department</th>
                <th>Age</th>
                <th>Disipline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <img src={ProfilePic} alt="Asep" className="avatar" />
                  Asep
                </td>
                <td>Design</td>
                <td>22</td>
                <td>+100%</td>
                <td>Permanent</td>
              </tr>
              <tr>
                <td>
                  <img src={ProfilePic} alt="Simus" className="avatar" />
                  Simus
                </td>
                <td>Front end</td>
                <td>24</td>
                <td>+95%</td>
                <td>Magang</td>
              </tr>
              <tr>
                <td>
                  <img src={ProfilePic} alt="Loren" className="avatar" />
                  Loren
                </td>
                <td>Back end</td>
                <td>28</td>
                <td>+89%</td>
                <td>Permanent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
