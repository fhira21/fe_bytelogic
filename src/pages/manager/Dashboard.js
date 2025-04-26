import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../style/manager/Dashboard.css';
import ProfilePic from '../../assets/images/pp.png';


const DashboardManager = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoCounts, setInfoCounts] = useState({
    totalEmployees: 0,
    totalClients: 0,
    waitingListProjects: 0,
    onProgressProjects: 0,
  });

  useEffect(() => {
    const fetchInfoCountsAndProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const [employeesResponse, clientsResponse, projectsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/karyawan', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/clients', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/projects', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        const totalEmployees = Array.isArray(employeesResponse.data) ? employeesResponse.data.length : 0;
        const totalClients = Array.isArray(clientsResponse.data) ? clientsResponse.data.length : 0;

        const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];

        const waitingListProjects = projects.filter(p => (p.status || '').toLowerCase() === 'waiting list').length;
        const onProgressProjects = projects.filter(p => (p.status || '').toLowerCase() === 'on progress').length;

        setInfoCounts({
          totalEmployees,
          totalClients,
          waitingListProjects,
          onProgressProjects,
        });

        setProjectData(projects);

      } catch (error) {
        console.error('Error fetching info counts and projects:', error);
        setError(error.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchInfoCountsAndProjects();
  }, []);
  

  const calculateSDLCProgress = (progress = {}) => {
    const total = Object.values(progress).reduce((acc, val) => acc + val, 0);
    const count = Object.keys(progress).length || 1;
    return Math.round((total / (count * 100)) * 100); // hasil persen
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">B</div>
          <span className="logo-text">Bytelogic</span>
        </div>
        <h1 className="sidebar-menu-title">MENU</h1>
        <div className="sidebar-menu">
          <button onClick={() => navigate('/dashboard-manager')} className="sidebar-btn active">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          <button onClick={() => navigate('/data-karyawan')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Karyawan
          </button>
          <button onClick={() => navigate('/data-admin')} className="sidebar-btn">
            <i className="fas fa-users"></i> Data Admin
          </button>
          <button onClick={() => navigate('/data-klien')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Klien
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Project
          </button>
          <button onClick={() => navigate('/evaluation')} className="sidebar-btn">
            <i className="fas fa-chart-line"></i> Evaluasi Karyawan
          </button>
          <button onClick={() => navigate('/reviews')} className="sidebar-btn">
            <i className="fas fa-star"></i> Review Pelanggan
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="breadcrumbs">
            <h2>Dashboard</h2>
          </div>

          {/* Topbar */}
          <div className="topbar-right">
            <div className="search-container">
              <input type="text" placeholder="Search..." />
            </div>
            <button className="notification-icon">🔔</button>
            <div className="profile">
              <img src={ProfilePic} alt="Profil" className="profile-pic" />
              <div className="profile-info">
                <span className="name">Aloy</span>
                <span className="role">Manajer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          {error ? (
            <p style={{ color: 'red' }}>Error: {error}</p>
          ) : (
            <>
              <div className="info-card">
                <p>Data Karyawan</p>
                <h3>{infoCounts.totalEmployees} Karyawan</h3>
              </div>
              <div className="info-card">
                <p>Data Pelanggan</p>
                <h3>{infoCounts.totalClients} Pelanggan</h3>
              </div>
              <div className="info-card">
                <p>Waiting List</p>
                <h3>{infoCounts.waitingListProjects} Project</h3>
              </div>
              <div className="info-card">
                <p>On Progress</p>
                <h3>{infoCounts.onProgressProjects} Project</h3>
              </div>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-box">
            <h3>Status Karyawan</h3>
            <div className="chart-placeholder">[Pie Chart Placeholder]</div>
          </div>
          <div className="chart-box">
            <h3>Rating Company</h3>
            <div className="rating-value">4.83</div>
            <p className="rating-desc">156 Review</p>
          </div>
        </div>

        {/* Progress Table & Top 5 Karyawan */}
        <div className="table-section">
          <div>
            <h3>Progres Project</h3>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : projectData.length === 0 ? (
              <p>Tidak ada project ditemukan.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Project</th>
                    <th>Klien</th>
                    <th>Deadline</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projectData.map((project) => (
                    <tr key={project._id}>
                      <td>{project.title || '-'}</td>
                      <td>{project.client?.nama_lengkap || '-'}</td>
                      <td>{project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID') : '-'}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{
                              width: `${calculateSDLCProgress(project.sdlc_progress)}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h3>Top 5 Karyawan</h3>
            <table className="data-table">
              {/* Dummy data sementara */}
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Nama</th>
                  <th>Point</th>
                </tr>
              </thead>
              <tbody>
                {/* Isi Top 5 manual/dari API nanti */}
                <tr><td>1</td><td>Zoe el kazam</td><td>5000</td></tr>
                <tr><td>2</td><td>Jane Doe</td><td>4500</td></tr>
                <tr><td>3</td><td>John Smith</td><td>4300</td></tr>
                <tr><td>4</td><td>Mike Ross</td><td>4100</td></tr>
                <tr><td>5</td><td>Harvey Specter</td><td>4000</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardManager;
