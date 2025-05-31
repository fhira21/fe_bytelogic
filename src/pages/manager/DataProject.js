import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
} from 'lucide-react';

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

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg">Memuat data proyek...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font mb-6">MENU</h1>
        <button 
          onClick={() => navigate('/dashboard-manager')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Home size={18} /> Dashboard
        </button>
        <button 
          onClick={() => navigate('/admin-list')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Admin Data
        </button>
        <button 
          onClick={() => navigate('/employee-list')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Employee Data
        </button>
        <button 
          onClick={() => navigate('/client-data')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Client Data
        </button>
        <button 
          onClick={() => navigate('/data-project')} 
          className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Briefcase size={18} /> Project Data
        </button>
        <button 
          onClick={() => navigate('/employee-evaluation')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <ChartBar size={18} /> Evaluation
        </button>
        <button 
          onClick={() => navigate('/customer-reviews')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Data Projek</h1>
            <button 
              onClick={handleAddProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tambah Projek
            </button>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-1">Filter Status:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="Waiting List">Waiting List</option>
                <option value="On Progress">On Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="deadline-asc">Deadline Terdekat</option>
                <option value="deadline-desc">Deadline Terjauh</option>
                <option value="progress-asc">Progress Terendah</option>
                <option value="progress-desc">Progress Tertinggi</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1">Cari:</label>
              <input
                type="text"
                id="search"
                placeholder="Cari proyek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Menampilkan {filteredProjects.length} dari {projects.length} proyek
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Proyek</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klien</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progres (%)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client?.nama_lengkap || 'Tidak diketahui'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.employees?.nama_lengkap || 'Tidak diketahui'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full text-xs text-white flex items-center justify-center"
                            style={{ width: `${calculateProgress(project.sdlc_progress)}%` }}
                          >
                            {calculateProgress(project.sdlc_progress)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'On Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditProject(project._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data proyek yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}