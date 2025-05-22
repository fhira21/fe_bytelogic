import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
// import "../../style/manager/DataProject.css";
=======
import "../../style/manager/DataProject.css";
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396

export default function ProjectDataPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

<<<<<<< HEAD
=======
  // State untuk filter
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

<<<<<<< HEAD
=======
  // Fungsi untuk menghitung progress
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
  const calculateProgress = useCallback((sdlc) => {
    if (!sdlc) return 0;
    const stages = ["analisis", "desain", "implementasi", "pengujian", "maintenance"];
    const total = stages.reduce((sum, stage) => sum + (sdlc[stage] || 0), 0);
    return Math.round(total / stages.length);
  }, []);

<<<<<<< HEAD
  const applyFilters = useCallback(() => {
    let result = [...projects];

=======
  // Fungsi untuk memfilter dan mengurutkan proyek
  const applyFilters = useCallback(() => {
    let result = [...projects];

    // Filter berdasarkan status
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
    if (statusFilter !== "all") {
      result = result.filter(project => project.status === statusFilter);
    }

<<<<<<< HEAD
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project =>
=======
    // Filter berdasarkan pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
        project.title.toLowerCase().includes(term) ||
        (project.client?.name && project.client.name.toLowerCase().includes(term)) ||
        (project.manager?.name && project.manager.name.toLowerCase().includes(term))
      );
    }

<<<<<<< HEAD
=======
    // Urutkan data
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "deadline-asc":
        result.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        });
        break;
      case "deadline-desc":
        result.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(b.deadline) - new Date(a.deadline);
        });
        break;
      case "progress-asc":
        result.sort((a, b) => calculateProgress(a.sdlc_progress) - calculateProgress(b.sdlc_progress));
        break;
      case "progress-desc":
        result.sort((a, b) => calculateProgress(b.sdlc_progress) - calculateProgress(a.sdlc_progress));
        break;
      default:
        break;
    }

    setFilteredProjects(result);
  }, [projects, statusFilter, sortBy, searchTerm, calculateProgress]);

<<<<<<< HEAD
=======
  // Jalankan filter ketika ada perubahan
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

<<<<<<< HEAD
=======
  // Fungsi untuk mengambil data proyek
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
<<<<<<< HEAD

=======
      
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError(response.data.message || "Gagal mengambil data proyek");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengambil data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

<<<<<<< HEAD
=======
  // Navigasi ke halaman tambah proyek
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
  const handleAddProject = () => {
    navigate("/projects/create");
  };

<<<<<<< HEAD
=======
  // Navigasi ke halaman edit proyek
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
  const handleEditProject = (projectId) => {
    navigate(`/projects/edit/${projectId}`);
  };

<<<<<<< HEAD
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;

=======
  // Fungsi untuk menghapus proyek
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
<<<<<<< HEAD
      fetchProjects();
=======
      fetchProjects(); // Refresh data
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
    } catch (error) {
      console.error("Gagal menghapus proyek:", error);
      alert("Gagal menghapus proyek");
    }
  };

<<<<<<< HEAD
  if (loading) return <div className="text-center text-lg mt-12 text-red-500">Memuat data proyek...</div>;
  if (error) return <div className="text-center text-lg mt-12 text-red-700">{error}</div>;

  return (
    <div className="flex bg-gray-100 min-h-screen">
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
          <button onClick={() => navigate('/data-project')} className="sidebar-btn active">
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
      <div className="flex-1 p-8 font-sans bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Data Projek</h1>
          <button
            onClick={handleAddProject}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg text-base cursor-pointer hover:bg-blue-600 transition-colors duration-300 shadow-md"
          >
            Tambah Projek
          </button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-5 mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col">
            <label htmlFor="status-filter" className="mb-2 font-semibold text-gray-700">Filter Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="Waiting List">Waiting List</option>
              <option value="On Progress">On Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sort-by" className="mb-2 font-semibold text-gray-700">Urutkan Berdasarkan:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="deadline-asc">Deadline Terdekat</option>
              <option value="deadline-desc">Deadline Terjauh</option>
              <option value="progress-asc">Progress Terendah</option>
              <option value="progress-desc">Progress Tertinggi</option>
            </select>
          </div>

          <div className="flex flex-col flex-1 min-w-[200px]">
            <label htmlFor="search" className="mb-2 font-semibold text-gray-700">Cari:</label>
            <input
              type="text"
              id="search"
              placeholder="Cari proyek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4 text-base text-gray-600">
          Menampilkan {filteredProjects.length} dari {projects.length} proyek
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul Proyek
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klien
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karyawan
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progres (%)
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.client?.nama_lengkap || 'Tidak diketahui'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.employees?.nama_lengkap || 'Tidak diketahui'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full text-center text-white text-xs font-bold flex items-center justify-center transition-all duration-300"
                        style={{ width: `${calculateProgress(project.sdlc_progress)}%` }}
                      >
                        {calculateProgress(project.sdlc_progress)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      project.status === 'Waiting List' ? 'bg-yellow-200 text-yellow-800' :
                      project.status === 'On Progress' ? 'bg-blue-200 text-blue-800' :
                      project.status === 'Completed' ? 'bg-green-200 text-green-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditProject(project._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md text-sm mr-2 hover:bg-green-600 transition-colors duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors duration-300"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
=======
  if (loading) return <div className="loading">Memuat data proyek...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="project-container">
      <div className="project-header">
        <h1>Data Projek</h1>
        <button onClick={handleAddProject} className="btn-add">
          Tambah Projek
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
            <option value="Waiting List">Waiting List</option>
            <option value="On Progress">On Progress</option>
            <option value="Completed">Completed</option>
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
            <option value="deadline-asc">Deadline Terdekat</option>
            <option value="deadline-desc">Deadline Terjauh</option>
            <option value="progress-asc">Progress Terendah</option>
            <option value="progress-desc">Progress Tertinggi</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search">Cari:</label>
          <input
            type="text"
            id="search"
            placeholder="Cari proyek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="project-count">
        Menampilkan {filteredProjects.length} dari {projects.length} proyek
      </div>

      <table className="project-table">
        <thead>
          <tr>
            <th>Judul Proyek</th>
            <th>Klien</th>
            <th>Karyawan</th>
            <th>Deadline</th>
            <th>Progres (%)</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project) => (
            <tr key={project._id}>
              <td>{project.title}</td>
              <td>{project.client?.nama_lengkap || 'Tidak diketahui'}</td>
              <td>{project.employees?.nama_lengkap || 'Tidak diketahui'}</td>
              <td>
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString("id-ID")
                  : "-"}
              </td>
              <td>
                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${calculateProgress(project.sdlc_progress)}%` }}
                  >
                    {calculateProgress(project.sdlc_progress)}%
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge ${project.status.toLowerCase().replace(" ", "-")}`}>
                  {project.status}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => handleEditProject(project._id)} 
                  className="btn-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteProject(project._id)} 
                  className="btn-delete"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
>>>>>>> 54a31aa0c33e948f2c33744caf385d67b0186396
    </div>
  );
}