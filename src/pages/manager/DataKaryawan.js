import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/manager/DataKaryawan.css";
import ProfilePic from '../../assets/images/pp.png';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State untuk filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk memfilter dan mengurutkan karyawan
  const applyFilters = useCallback(() => {
    let result = [...employees];

    // Filter berdasarkan status
    if (statusFilter !== "all") {
      result = result.filter(employee => 
        employee.status_Karyawan && employee.status_Karyawan === statusFilter
      );
    }

    // Filter berdasarkan pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(employee => {
        const nama = employee.nama_lengkap || '';
        const email = employee.email || '';
        const telp = employee.nomor_telepon || '';
        const alamat = employee.alamat || '';
        
        return (
          nama.toLowerCase().includes(term) ||
          email.toLowerCase().includes(term) ||
          telp.includes(term) ||
          alamat.toLowerCase().includes(term)
        );
      });
    }

    // Urutkan data
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name-asc":
        result.sort((a, b) => (a.nama_lengkap || '').localeCompare(b.nama_lengkap || ''));
        break;
      case "name-desc":
        result.sort((a, b) => (b.nama_lengkap || '').localeCompare(a.nama_lengkap || ''));
        break;
      default:
        break;
    }

    setFilteredEmployees(result);
  }, [employees, statusFilter, sortBy, searchTerm]);

  // Jalankan filter ketika ada perubahan
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fungsi untuk mengambil data karyawan
  const fetchEmployees = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/karyawan", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Validasi response
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Format data tidak valid");
      }
      
      // Pastikan setiap item memiliki field minimal
      const validatedData = response.data.map(item => ({
        _id: item._id || '',
        nama_lengkap: item.nama_lengkap || '',
        email: item.email || '',
        alamat: item.alamat || '',
        nomor_telepon: item.nomor_telepon || '',
        status_Karyawan: item.status_Karyawan || 'Tidak Diketahui',
        createdAt: item.createdAt || new Date().toISOString()
      }));
      
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

  // Fetch data saat komponen mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Navigasi ke halaman tambah karyawan
  const handleAddEmployee = () => {
    navigate("/tambah-karyawan");
  };

  // Navigasi ke halaman edit karyawan
  const handleEditEmployee = (employeeId) => {
    navigate(`/edit-karyawan/${employeeId}`);
  };

  // Fungsi untuk menghapus karyawan
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/karyawan/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh data setelah menghapus
      await fetchEmployees();
    } catch (error) {
      console.error("Gagal menghapus karyawan:", error);
      setError("Gagal menghapus karyawan. Silakan coba lagi.");
    }
  };

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
        {/* Topbar */}
        <div className="topbar">
          <div className="breadcrumbs">
            <h2>Data Karyawan</h2>
          </div>
          <div className="topbar-right">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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

        {/* Employee Table Section */}
        <div className="table-section">
          <div className="table-header">
            <h3>Data Karyawan</h3>
            <button 
              onClick={handleAddEmployee} 
              className="add-employee-button"
            >
              ➕ Tambah Karyawan
            </button>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-group">
              <label htmlFor="status-filter">Filter Status:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="Karyawan Aktif">Aktif</option>
                <option value="Karyawan Tidak Aktif">Tidak Aktif</option>
                <option value="Magang Aktif">Magang Aktif</option>
                <option value="Magang Tidak Aktif">Magang Tidak Aktif</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-by">Urutkan Berdasarkan:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
              </select>
            </div>
          </div>

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
              {filteredEmployees.map((employee) => {
                const nama = employee.nama_lengkap || '-';
                const email = employee.email || '-';
                const alamat = employee.alamat || '-';
                const telp = employee.nomor_telepon || '-';
                const status = employee.status_Karyawan || '-';

                return (
                  <tr key={employee._id}>
                    <td>{nama}</td>
                    <td>{email}</td>
                    <td>{alamat}</td>
                    <td>{telp}</td>
                    <td>
                      <span className={`status-badge ${status.toLowerCase().replace(/ /g, '-')}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEditEmployee(employee._id)} 
                        className="action-button"
                      >
                        ✏ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee._id)} 
                        className="action-button delete"
                      >
                        🗑 Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}