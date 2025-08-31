// src/pages/project/ProjectDataPage.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TopbarProfile from "../../components/TopbarProfile";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://be.bytelogic.orenjus.com";

/** ===== Utils ===== */
const looksLikeGithubToken = (t = "") => {
  const s = (t || "").trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s) || /\s/.test(s)) return false; // jangan URL / ada spasi
  const classic = /^ghp_[A-Za-z0-9_]{20,}$/;
  const fine = /^github_pat_[A-Za-z0-9_]{20,}$/;
  const others = /^gh[ours]_[A-Za-z0-9_]{20,}$/; // gho_/ghu_/ghs_/ghr_
  return classic.test(s) || fine.test(s) || others.test(s);
};

const formatDateID = (d) => (d ? new Date(d).toLocaleDateString("id-ID") : "-");

const maskGithubToken = (t) => {
  if (!t) return "-";
  const s = String(t);
  const prefix = s.startsWith("github_pat_")
    ? "github_pat_"
    : s.startsWith("ghp_")
      ? "ghp_"
      : s.slice(0, 4);
  const last4 = s.slice(-4);
  return `${prefix}••••••${last4}`;
};

const fileNameFromPath = (p = "") => {
  if (!p) return "";
  const parts = p.split("/");
  return parts[parts.length - 1] || p;
};

export default function ProjectDataPage() {
  /** ===== LIST DATA ===== */
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** ===== VIEW ===== */
  const [viewingProject, setViewingProject] = useState(null); // bisa {loading:true} saat fetch detail
  const [viewError, setViewError] = useState("");

  /** ===== ADD ===== */
  const [addingProject, setAddingProject] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [addErrObj, setAddErrObj] = useState(null);
  const [addForm, setAddForm] = useState({
    title: "",
    framework: "",
    description: "",
    github_token: "",
    figma: "",
    status: "Waiting List",
    deadline: "",
    employees: [],
    client_id: "",
    images: [], // File[]
  });

  /** dropdown data */
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  /** ===== EDIT ===== */
  const [editingProject, setEditingProject] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    status: "Waiting List",
    deadline: "",
  });

  const navigate = useNavigate();

  /** ===== FILTER / SEARCH ===== */
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const applyFilters = useCallback(() => {
    let result = [...projects];
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(term) ||
          (p.description || "").toLowerCase().includes(term) ||
          (p.client?.nama_lengkap || "").toLowerCase().includes(term)
      );
    }
    setFilteredProjects(result);
  }, [projects, statusFilter, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success === false) {
        setProjects([]);
        setError(res.data?.message || "Gagal mengambil data proyek");
      } else {
        setProjects(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengambil data");
      console.error("GET /api/projects error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /** ===== ERROR HELPER ===== */
  const explainServerError = (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const raw =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error?.message ||
      data?.error ||
      err?.message ||
      "Terjadi kesalahan";
    if (status === 401 || /status code 401/i.test(raw)) {
      return "[401] Github token tidak valid atau scopenya kurang. Gunakan PAT classic (scope: repo).";
    }
    return `[${status || "ERR"}] ${raw}`;
  };

  /** ===== LOAD DROPDOWNS ===== */
  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error("GET /api/clients error:", e);
    } finally {
      setClientsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/karyawan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeesList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error("GET /api/karyawan error:", e);
    } finally {
      setEmployeesLoading(false);
    }
  };

  /** ===== ADD HANDLERS ===== */
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeesChange = (e) => {
    const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
    setAddForm((prev) => ({ ...prev, employees: vals }));
  };

  const handleAddImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAddForm((prev) => ({ ...prev, images: files }));
  };

  const openAddModal = async () => {
    setAddError("");
    setAddErrObj(null);
    setAddForm({
      title: "",
      framework: "",
      description: "",
      github_token: "",
      figma: "",
      status: "Waiting List",
      deadline: "",
      employees: [],
      client_id: "",
      images: [],
    });
    setAddingProject(true);
    await Promise.all([loadClients(), loadEmployees()]);
  };

  const closeAddModal = () => {
    setAddingProject(false);
    setAddError("");
    setAddErrObj(null);
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError("");
    setAddErrObj(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAddError("Token tidak ditemukan. Silakan login ulang.");
        setAddSaving(false);
        return;
      }
      if (!addForm.title?.trim()) {
        setAddError("Project Name wajib diisi.");
        setAddSaving(false);
        return;
      }
      if (!addForm.client_id || addForm.client_id.length !== 24) {
        setAddError("Client tidak valid.");
        setAddSaving(false);
        return;
      }
      if (!looksLikeGithubToken(addForm.github_token)) {
        setAddError(
          "Github Token tidak valid. Masukkan Personal Access Token (ghp_... / github_pat_...), bukan URL."
        );
        setAddSaving(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", addForm.title);
      if (addForm.framework) fd.append("framework", addForm.framework);
      if (addForm.description) fd.append("description", addForm.description);
      if (addForm.figma) fd.append("figma", addForm.figma);
      fd.append("status", addForm.status || "Waiting List");
      if (addForm.deadline) fd.append("deadline", addForm.deadline);
      fd.append("client_id", addForm.client_id);
      fd.append("github_token", addForm.github_token.trim());
      (addForm.employees || []).forEach((id) => fd.append("employees[]", id));
      (addForm.images || []).forEach((file) => fd.append("images", file));

      await axios.post(`${API_BASE}/api/projects`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchProjects();
      setAddingProject(false);
    } catch (err) {
      console.error("POST /api/projects error:", err);
      setAddErrObj(err);
      setAddError(explainServerError(err));
    } finally {
      setAddSaving(false);
    }
  };

  /** ===== EDIT HANDLERS ===== */
  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "Waiting List",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().slice(0, 10)
        : "",
    });
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
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
      await axios.put(`${API_BASE}/api/projects/${editingProject._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProjects();
      setEditingProject(null);
    } catch (err) {
      console.error("PUT /api/projects/:id error:", err);
      alert(err?.response?.data?.message || "Gagal mengupdate proyek. Coba lagi.");
    } finally {
      setEditSaving(false);
    }
  };

  /** ===== DELETE & VIEW ===== */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (err) {
      console.error("DELETE /api/projects/:id error:", err);
      alert(err?.response?.data?.message || "Gagal menghapus proyek");
    }
  };

  // >>> Perubahan utama: fetch detail saat View diklik
  // helper kecil (optional)
  const preferClientObject = (detailClient, listClient) => {
    // kalau detail berisi object dengan nama, pakai itu; kalau cuma ID, pakai dari list
    if (detailClient && typeof detailClient === "object" &&
      (detailClient.nama_lengkap || detailClient.name)) {
      return detailClient;
    }
    return listClient || detailClient; // kalau list tak ada, kembalikan apa adanya
  };

  const handleViewProject = async (project) => {
    try {
      setViewError("");
      // tampilkan loading dulu
      setViewingProject({ loading: true, _id: project._id });

      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/projects/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};

      // Jika employees di detail masih ID-ID, pakai yang dari list (sudah populated)
      const employeesMerged =
        Array.isArray(data.employees) &&
          data.employees.some((e) => typeof e === "object")
          ? data.employees
          : project.employees;

      // >>> kunci: merge data list (sudah populated) + detail (punya token/komponen lain)
      const merged = {
        ...project,       // keep yang sudah populated (client, employees)
        ...data,          // timpa dengan info terbaru dari detail
        client: preferClientObject(data.client, project.client),
        employees: employeesMerged,
      };

      setViewingProject(merged);
    } catch (err) {
      console.error("GET /api/projects/:id error:", err);
      setViewError(err?.response?.data?.message || "Gagal mengambil detail proyek.");
      // minimal tampilkan data dari list
      setViewingProject(project);
    }
  };

  /** ===== UI LOADING/ERROR ===== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat data proyek...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  /** ===== RENDER ===== */
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto bg-white">
        <TopbarProfile />
        <h1 className="text-2xl font-bold mb-6">Project Data</h1>

        {/* Header actions */}
        <div className="flex flex-col md:flex-row items-center mb-6 gap-2">
          <div className="w-full md:w-64 md:ml-auto">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Waiting List">Waiting List</option>
              <option value="On Progress">On Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-center"
            />
          </div>

          <div className="w-full md:w-auto">
            <button
              onClick={() => openAddModal()}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white 
                         px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors 
                         w-full md:w-auto min-w-[160px]"
            >
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white border-b border-gray-300">
                <tr>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">Project Name</th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">Description</th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">Client Name</th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">Deadline</th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">Status</th>
                  <th className="pr-4 md:pr-6 py-3 text-left text-sm font-normal text-black tracking-wider w-[1%] whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="pl-4 md:pl-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.title}</td>
                      <td className="px-3 md:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{project.description || "-"}</td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.client?.nama_lengkap || "Tidak diketahui"}</td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${project.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "On Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="pr-4 md:pr-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewProject(project)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditProject(project)}
                            className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data proyek yang ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== VIEW MODAL (Detail Project lengkap) ===== */}
        {viewingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">Detail Project</h3>
                <button
                  onClick={() => setViewingProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {viewingProject.loading ? (
                <div className="py-8 text-center text-sm text-gray-600">Memuat detail…</div>
              ) : (
                <>
                  {viewError && (
                    <div className="mb-4 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2">
                      {viewError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-y-4 gap-x-6">
                    {/* Project Name */}
                    <div className="text-sm text-gray-500">Project Name</div>
                    <div className="text-sm text-gray-900">
                      {viewingProject.title || "-"}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-gray-500">Description</div>
                    <div className="text-sm text-gray-900 leading-relaxed">
                      {viewingProject.description || "-"}
                    </div>

                    {/* Framework */}
                    <div className="text-sm text-gray-500">Framework</div>
                    <div className="text-sm text-gray-900">
                      {viewingProject.framework || "-"}
                    </div>

                    {/* Figma */}
                    <div className="text-sm text-gray-500">Link Figma</div>
                    <div className="text-sm text-blue-600">
                      {viewingProject.figma ? (
                        <a
                          href={viewingProject.figma}
                          target="_blank"
                          rel="noreferrer"
                          className="underline break-all"
                        >
                          {viewingProject.figma}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>

                    {/* GitHub Repository URL */}
                    <div className="text-sm text-gray-500">GitHub Repository</div>
                    <div className="text-sm">
                      {viewingProject.github_repo_url ? (
                        <a
                          href={viewingProject.github_repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline break-all"
                          title="Buka repository di GitHub"
                        >
                          {viewingProject.github_repo_url}
                        </a>
                      ) : (
                        "-"   // kalau (sangat jarang) belum ada
                      )}
                    </div>


                    {/* Status */}
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${viewingProject.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : viewingProject.status === "On Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {viewingProject.status || "-"}
                      </span>
                    </div>

                    {/* Deadline */}
                    <div className="text-sm text-gray-500">Deadline</div>
                    <div className="text-sm text-gray-900">
                      {formatDateID(viewingProject.deadline)}
                    </div>

                    {/* Client */}
                    <div className="text-sm text-gray-500">Client Name</div>
                    <div className="text-sm text-gray-900">
                      {viewingProject.client?.nama_lengkap ||
                        viewingProject.client?.name ||
                        "-"}
                    </div>

                    {/* Employees */}
                    <div className="text-sm text-gray-500">Employee Name</div>
                    <div className="text-sm text-gray-900">
                      {Array.isArray(viewingProject.employees) && viewingProject.employees.length > 0 ? (
                        <ol className="list-decimal pl-5 space-y-1">
                          {viewingProject.employees
                            .map((e) =>
                              typeof e === "string" ? e : e?.nama_lengkap || e?.name || ""
                            )
                            .filter(Boolean)
                            .map((name, idx) => (
                              <li key={idx}>{name}</li>
                            ))}
                        </ol>
                      ) : (
                        "-"
                      )}
                    </div>

                    {/* Images */}
                    <div className="text-sm text-gray-500">Images</div>
                    <div className="text-sm text-gray-900 space-y-1">
                      {Array.isArray(viewingProject.images) &&
                        viewingProject.images.length > 0 ? (
                        viewingProject.images.map((p, idx) => (
                          <div key={idx}>{fileNameFromPath(p)}</div>
                        ))
                      ) : (
                        <>-</>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setViewingProject(null)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ===== ADD MODAL ===== */}
        {addingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Project</h3>
              </div>

              {addError && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                  {addError}
                  {addErrObj?.response?.data && (
                    <pre className="mt-2 text-xs text-red-800 whitespace-pre-wrap max-h-48 overflow-auto">
                      {typeof addErrObj.response.data === "string"
                        ? addErrObj.response.data
                        : JSON.stringify(addErrObj.response.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              <form onSubmit={saveAdd}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input
                      type="text"
                      name="title"
                      value={addForm.title}
                      onChange={handleAddFormChange}
                      placeholder="Enter Project Name"
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Framework</label>
                    <input
                      type="text"
                      name="framework"
                      value={addForm.framework}
                      onChange={handleAddFormChange}
                      placeholder="Enter Framework"
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={addForm.description}
                      onChange={handleAddFormChange}
                      placeholder="Enter Project Description"
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Github Token</label>
                      <span className="text-[11px] text-gray-500">*wajib</span>
                    </div>
                    <input
                      type="password"
                      name="github_token"
                      value={addForm.github_token}
                      onChange={handleAddFormChange}
                      autoComplete="off"
                      inputMode="text"
                      spellCheck={false}
                      placeholder="PAT classic (scope: repo) — contoh ghp_XXXXXXXX"
                      pattern="(ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|gh[ours]_[A-Za-z0-9_]{20,})"
                      title="Masukkan Personal Access Token GitHub"
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link Figma</label>
                    <input
                      type="url"
                      name="figma"
                      value={addForm.figma}
                      onChange={handleAddFormChange}
                      placeholder="https://..."
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
                      required
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employees</label>
                    <select
                      multiple
                      value={addForm.employees}
                      onChange={handleEmployeesChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-28"
                    >
                      {employeesLoading ? (
                        <option>Loading...</option>
                      ) : (
                        employeesList.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.nama_lengkap || emp.name || emp.email}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1">Tahan Ctrl/⌘ untuk memilih banyak.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <select
                      name="client_id"
                      value={addForm.client_id}
                      onChange={handleAddFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>
                        {clientsLoading ? "Loading clients..." : "Pilih client"}
                      </option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.nama_lengkap || c.name || c.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Images (optional)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddImagesChange}
                      className="mt-1 block w-full text-sm"
                    />
                  </div>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
