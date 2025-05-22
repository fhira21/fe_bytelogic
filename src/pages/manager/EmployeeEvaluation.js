import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/manager/EmployeeList.css';
import ProfilePic from '../../assets/images/pp.png';

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([
    { id: 1, name: 'Andi Rahman', position: 'Frontend Developer', rating: 4, projects: 5, startPeriod: '2023-01-01', endPeriod: '2023-12-31' },
    { id: 2, name: 'Sinta Putri', position: 'Backend Developer', rating: 5, projects: 7, startPeriod: '2022-05-01', endPeriod: '2023-05-01' },
  ]);

  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', rating: '', projects: '', startPeriod: '', endPeriod: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const openAddModal = () => {
    setNewEmployee({ name: '', position: '', rating: '', projects: '', startPeriod: '', endPeriod: '' });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const addEmployee = (e) => {
    e.preventDefault();
    const newId = employees.length ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
    setEmployees([...employees, { id: newId, ...newEmployee }]);
    closeAddModal();
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleViewEmployeeDetail = (employeeId) => {
    // Navigasi ke halaman detail karyawan
    navigate(`/employee-detail/${employeeId}`);
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
          <button onClick={() => navigate('/dashboard-manager')} className="sidebar-btn">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Karyawan
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Klien
          </button>
          <button onClick={() => navigate('/admin-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Admin
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Project
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="sidebar-btn active">
            <i className="fas fa-chart-line"></i> Evaluasi Karyawan
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Review Pelanggan
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-right">
            <div className="search-container">
              <input type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <i className="fas fa-search search-icon"></i>
            </div>
            <div className="profile">
              <img src={ProfilePic} alt="Profil" className="profile-pic" />
              <span className="profile-name">Deni el mares</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <h1 className="dashboard-title">Penilaian Karyawan</h1>

        <button className="add-employee-button" onClick={openAddModal}>
          Tambah Karyawan
        </button>

        {/* Table Section */}
        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Nama</th>
                <th>Total Project</th>
                <th>Total Point</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees
                  .map(emp => ({
                    ...emp,
                    totalPoint: emp.rating * emp.projects
                  }))
                  .sort((a, b) => b.totalPoint - a.totalPoint)
                  .map((emp, index) => (
                    <tr key={emp.id}>
                      <td>{index + 1}</td>
                      <td className="font-semibold">{emp.name}</td>
                      <td>{emp.projects}</td>
                      <td>{emp.totalPoint}</td>
                      <td>
                        <button
                          onClick={() => handleViewEmployeeDetail(emp.id)}
                          className="btn-view-detail"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
                    Tidak ada data karyawan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={addEmployee}>
              <h2>Tambah Karyawan</h2>
              <label>Nama</label>
              <input name="name" value={newEmployee.name} onChange={handleInputChange} required />
              <label>Total Project</label>
              <input type="number" name="projects" value={newEmployee.projects} onChange={handleInputChange} required />
              <label>Total Point</label>
              <input type="number" name="point" value={newEmployee.point} onChange={handleInputChange} required />
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={closeAddModal}>Batal</button>
                <button type="submit" className="btn-save">Tambah</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeList;
