import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/manager/EmployeeList.css";
import ProfilePic from '../../assets/images/pp.png';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/karyawan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const karyawanData = response.data.data;

      if (!Array.isArray(karyawanData)) {
        throw new Error("Format data tidak valid");
      }

      const validatedData = karyawanData.map(item => ({
        _id: item._id || '',
        nama_lengkap: item.nama_lengkap || '',
        email: item.email || '',
        alamat: item.alamat || '',
        nomor_telepon: item.nomor_telepon || '',
        status_Karyawan: item.status_Karyawan || 'Tidak Diketahui',
        createdAt: item.createdAt || new Date().toISOString()
      }));


      // const validatedData = response.data.map(item => ({
      //   _id: item._id || '',
      //   nama_lengkap: item.nama_lengkap || '',
      //   email: item.email || '',
      //   alamat: item.alamat || '',
      //   nomor_telepon: item.nomor_telepon || '',
      //   status_Karyawan: item.status_Karyawan || 'Tidak Diketahui',
      //   createdAt: item.createdAt || new Date().toISOString()
      // }));

      setEmployees(validatedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching employees:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengambil data");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = () => {
    navigate("/tambah-karyawan");
  };

  const handleEditEmployee = (employeeId) => {
    navigate(`/edit-karyawan/${employeeId}`);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/karyawan/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchEmployees();
    } catch (error) {
      console.error("Gagal menghapus karyawan:", error);
      setError("Gagal menghapus karyawan. Silakan coba lagi.");
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const term = searchTerm.toLowerCase();
    return (
      employee.nama_lengkap?.toLowerCase().includes(term) ||
      employee.email?.toLowerCase().includes(term) ||
      employee.nomor_telepon?.includes(term) ||
      employee.alamat?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div>Memuat data karyawan...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={fetchEmployees}>Coba Lagi</button>
        </div>
      </div>
    );
  }

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
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn active">
            <i className="fas fa-folder-open"></i> Employee Data
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Client Data
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Project Data
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="sidebar-btn">
            <i className="fas fa-chart-line"></i> Client Evaluation
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
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            <div className="profile">
              <img src={ProfilePic} alt="Profil" className="profile-pic" />
              <span className="profile-name">Deni el mares</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <h1 className="dashboard-title">Data Karyawan</h1>

        <button className="add-employee-button" onClick={handleAddEmployee}>
          Tambah Karyawan
        </button>

        <div className="table-section">
          <div className="employee-count">
            Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Alamat</th>
                <th>No. HP</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.nama_lengkap || '-'}</td>
                  <td>{employee.email || '-'}</td>
                  <td>{employee.alamat || '-'}</td>
                  <td>{employee.nomor_telepon || '-'}</td>
                  <td>
                    <span className={`status-badge ${employee.status_Karyawan.toLowerCase().replace(/ /g, '-')}`}>
                      {employee.status_Karyawan}
                    </span>
                  </td>
                  <td>
                    <button className="edit-button" onClick={() => handleEditEmployee(employee._id)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDeleteEmployee(employee._id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default EmployeeList;
