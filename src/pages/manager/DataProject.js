import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TopbarProfile from '../../components/TopbarProfile';
import Sidebar from '../../components/SideBar';
import { useNavigate } from "react-router-dom";
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  Search,
  FileText,
  User
} from 'lucide-react';

export default function ProjectDataPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const navigate = useNavigate();

  // State untuk filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk memfilter proyek
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
        (project.description && project.description.toLowerCase().includes(term)) ||
        (project.client?.nama_lengkap && project.client.nama_lengkap.toLowerCase().includes(term))
      );
    }

    setFilteredProjects(result);
  }, [projects, statusFilter, searchTerm]);

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

  // Fungsi untuk melihat detail proyek
  const handleViewProject = (project) => {
    setViewingProject(project);
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
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Project Data</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          {/* Filter - Paling Kiri */}
          <div className="w-full md:w-64 md:ml-auto">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="all">All Status</option>
              <option value="Waiting List">Waiting List</option>
              <option value="On Progress">On Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Search - Tengah */}
          <div className="relative w-full md:w-64 md:ml-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Add Project - Paling Kanan */}
          <div className="w-full md:w-auto">
            <button
              onClick={handleAddProject}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Project Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Client Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Deadline</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {project.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.client?.nama_lengkap || 'Tidak diketahui'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'On Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProject(project._id)}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                          <button
                            onClick={() => handleViewProject(project)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span className="text-sm">View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data proyek yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Project Details</h3>
                <button
                  onClick={() => setViewingProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Project Name</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingProject.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingProject.description || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Client Name</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingProject.client?.nama_lengkap || 'Tidak diketahui'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Deadline</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewingProject.deadline
                      ? new Date(viewingProject.deadline).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${viewingProject.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      viewingProject.status === 'On Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {viewingProject.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingProject(null)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}