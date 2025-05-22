import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/pp.png';

const EmployeeEvaluation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/evaluations/karyawan', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('API Response:', response.data);
        
        // Pastikan response.data.data ada dan berupa array
        const employeesData = response.data?.data || [];
        if (Array.isArray(employeesData)) {
          setEmployees(employeesData);
        } else {
          setEmployees([]);
          console.warn('Employees data is not an array!');
        }
      } catch (error) {
        console.error('Error fetching employee evaluations:', {
          message: error.message,
          response: error.response,
          config: error.config
        });
        setError(error.response?.data?.message || 'Gagal memuat data evaluasi karyawan');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleViewEmployeeDetail = (employeeId) => {
    const employeeDetail = employees.find(emp => emp._id === employeeId);
    navigate(`/employee-detail/${employeeId}`, { 
      state: { 
        employee: employeeDetail 
      } 
    });
  };

  // Format data untuk tabel
  const formattedEmployees = employees.map(emp => ({
    id: emp._id,
    name: emp.nama_karyawan,
    projects: emp.total_project_dinilai || 0,
    rating: emp.rata_rata_point_evaluasi ? parseFloat(emp.rata_rata_point_evaluasi) : 0,
    detail: emp.evaluasi_projects || []
  }));

  // Filter dan sorting
  const filteredEmployees = formattedEmployees
    .filter(emp => 
      emp.name && 
      typeof emp.name === 'string' &&
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(emp => ({
      ...emp,
      totalPoint: (emp.rating * emp.projects).toFixed(2)
    }))
    .sort((a, b) => b.totalPoint - a.totalPoint);

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
          <button onClick={() => navigate('/admin-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Admin Data
          </button>
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Employee Data
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Client Data
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Project Data
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="sidebar-btn active">
            <i className="fas fa-chart-line"></i> Employee Evaluation
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Client Review
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-right">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            <div className="profile">
              <img src={ProfilePic} alt="Profile" className="profile-pic" />
              <span className="profile-name">Manager</span>
            </div>
          </div>
        </div>

        <h1 className="dashboard-title">Employee Evaluation</h1>

        {/* Loading and Error States */}
        {loading && (
          <div className="loading-message">
            <i className="fas fa-spinner fa-spin"></i> Loading employee data...
          </div>
        )}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Table Section */}
        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Employee Name</th>
                <th>Projects</th>
                <th>Avg Rating</th>
                <th>Total Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp.id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{emp.name}</td>
                    <td>{emp.projects}</td>
                    <td>{emp.rating.toFixed(2)}</td>
                    <td>{emp.totalPoint}</td>
                    <td>
                      <button
                        onClick={() => handleViewEmployeeDetail(emp.id)}
                        className="btn-view-detail"
                      >
                        <i className="fas fa-eye"></i> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="6" className="no-data-message">
                      {employees.length === 0 
                        ? 'No employee evaluation data available' 
                        : 'No employees match your search'}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default EmployeeEvaluation;