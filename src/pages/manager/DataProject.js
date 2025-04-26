import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/manager/DataProject.css";

export default function ProjectDataPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State untuk filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk menghitung progress
  const calculateProgress = useCallback((sdlc) => {
    if (!sdlc) return 0;
    const stages = ["analisis", "desain", "implementasi", "pengujian", "maintenance"];
    const total = stages.reduce((sum, stage) => sum + (sdlc[stage] || 0), 0);
    return Math.round(total / stages.length);
  }, []);

  // Fungsi untuk memfilter dan mengurutkan proyek
  const applyFilters = useCallback(() => {
    let result = [...projects];

    // Filter berdasarkan status
    if (statusFilter !== "all") {
      result = result.filter(project => project.status === statusFilter);
    }

    // Filter berdasarkan pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(term) ||
        (project.client?.name && project.client.name.toLowerCase().includes(term)) ||
        (project.manager?.name && project.manager.name.toLowerCase().includes(term))
      );
    }

    // Urutkan data
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

  // Jalankan filter ketika ada perubahan
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fungsi untuk mengambil data proyek
  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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

  // Navigasi ke halaman tambah proyek
  const handleAddProject = () => {
    navigate("/projects/create");
  };

  // Navigasi ke halaman edit proyek
  const handleEditProject = (projectId) => {
    navigate(`/projects/edit/${projectId}`);
  };

  // Fungsi untuk menghapus proyek
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchProjects(); // Refresh data
    } catch (error) {
      console.error("Gagal menghapus proyek:", error);
      alert("Gagal menghapus proyek");
    }
  };

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
    </div>
  );
}