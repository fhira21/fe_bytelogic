import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TopbarProfile from '../../components/TopbarProfile';
import Sidebar from '../../components/SideBar';
import { useNavigate } from "react-router-dom";
import { Search } from 'lucide-react';

const API_BASE = "http://be.bytelogic.orenjus.com";

export default function ProjectDataPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View detail (modal)
  const [viewingProject, setViewingProject] = useState(null);

  // ====== ADD (baru) ======
  const [addingProject, setAddingProject] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    status: "Waiting List",
    deadline: "",
    // client_id: ""  // kalau backend butuh, buka field ini
  });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // ====== EDIT (punya kamu) ======
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    status: "Waiting List",
    deadline: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  const navigate = useNavigate();

  // Filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const applyFilters = useCallback(() => {
    let result = [...projects];

    if (statusFilter !== "all") {
      result = result.filter(project => project.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project =>
        (project.title || "").toLowerCase().includes(term) ||
        (project.description || "").toLowerCase().includes(term) ||
        (project.client?.nama_lengkap || "").toLowerCase().includes(term)
      );
    }

    setFilteredProjects(result);
  }, [projects, statusFilter, searchTerm]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProjects(Array.isArray(response.data.data) ? response.data.data : []);
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

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ====== Add Project ======
  const openAddModal = () => {
    setAddError("");
    setAddForm({
      title: "",
      description: "",
      status: "Waiting List",
      deadline: "",
      // client_id: ""
    });
    setAddingProject(true);
  };

  const closeAddModal = () => {
    setAddingProject(false);
    setAddError("");
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError("");

    try {
      const token = localStorage.getItem("token");

      // payload minimal (sesuaikan kalau backend butuh field lain seperti client_id / employees)
      const payload = {
        title: addForm.title,
        description: addForm.description,
        status: addForm.status,
        deadline: addForm.deadline || null,
        // client_id: addForm.client_id || undefined,
      };

      const res = await axios.post(`${API_BASE}/api/projects`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success === false) {
        throw new Error(res.data?.message || "Gagal membuat proyek");
      }

      await fetchProjects();
      setAddingProject(false);
    } catch (err) {
      console.error("Gagal menambah proyek:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Gagal menambah proyek";
      setAddError(msg);
      alert(msg);
    } finally {
      setAddSaving(false);
    }
  };

  // ====== Edit Project (punya kamu) ======
  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "Waiting List",
      deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
    });
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };

  const closeEditModal = () => setEditingProject(null);

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        status: projectForm.status,
        deadline: projectForm.deadline || null,
      };

      await axios.put(
        `${API_BASE}/api/projects/${editingProject._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchProjects();
      setEditingProject(null);
    } catch (err) {
      console.error("Gagal mengupdate proyek:", err);
      alert(err?.response?.data?.message || "Gagal mengupdate proyek. Coba lagi.");
    } finally {
      setEditSaving(false);
    }
  };

  // ====== Delete & View ======
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (error) {
      console.error("Gagal menghapus proyek:", error);
      alert(error?.response?.data?.message || "Gagal menghapus proyek");
    }
  };

  const handleViewProject = (project) => setViewingProject(project);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Memuat data proyek...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Project Data</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          {/* Filter */}
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

          {/* Search */}
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

          {/* Add Project */}
          <div className="w-full md:w-auto">
            <button
              onClick={openAddModal} // <-- sebelumnya navigate("/projects/create")
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
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
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'On Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProject(project)}
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

        {/* ===== View Modal ===== */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Project Details</h3>
                <button onClick={() => setViewingProject(null)} className="text-gray-500 hover:text-gray-700">✕</button>
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
                    {viewingProject.deadline ? new Date(viewingProject.deadline).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      viewingProject.status === 'Completed' ? 'bg-green-100 text-green-800' :
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== ADD MODAL ===== */}
        {addingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Project</h3>
              </div>
              {addError && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {addError}
                </div>
              )}
              <form onSubmit={saveAdd}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input
                      type="text"
                      name="title"
                      value={addForm.title}
                      onChange={handleAddFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={addForm.description}
                      onChange={handleAddFormChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={addForm.status}
                      onChange={handleAddFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Waiting List</option>
                      <option>On Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={addForm.deadline}
                      onChange={handleAddFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Jika backend mewajibkan client_id, buka field ini:
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client ID</label>
                    <input
                      type="text"
                      name="client_id"
                      value={addForm.client_id || ""}
                      onChange={handleAddFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                    />
                  </div> */}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    disabled={addSaving}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                    disabled={addSaving}
                  >
                    {addSaving ? "Saving..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== EDIT MODAL ===== */}
        {editingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Project</h3>
              </div>
              <form onSubmit={saveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input
                      type="text"
                      name="title"
                      value={projectForm.title}
                      onChange={handleProjectFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectFormChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={projectForm.status}
                      onChange={handleProjectFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Waiting List</option>
                      <option>On Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={projectForm.deadline}
                      onChange={handleProjectFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    disabled={editSaving}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60"
                    disabled={editSaving}
                  >
                    {editSaving ? "Saving..." : "Edit Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}