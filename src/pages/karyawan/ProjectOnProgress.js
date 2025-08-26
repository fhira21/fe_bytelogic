import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://be.bytelogic.orenjus.com";

/* ===== Helpers ===== */
const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

// Ambil kandidat client id dari berbagai bentuk
function pullClientId(p = {}) {
  if (p.client_id && isObjectId(p.client_id)) return p.client_id;
  if (typeof p.client === "string" && isObjectId(p.client)) return p.client;
  if (p.client && typeof p.client === "object" && isObjectId(p.client._id)) return p.client._id;
  if (p.clientId && isObjectId(p.clientId)) return p.clientId;
  return null;
}

// Ambil nama client kalau sudah dipopulate
function pullClientEmbeddedName(p = {}) {
  if (p.client && typeof p.client === "object") {
    return p.client.nama_lengkap || p.client.name || p.client.email || null;
  }
  return p.client_name || p.clientName || null;
}

// Normalisasi 1 item proyek dari list (bukan detail)
function normalizeProject(p = {}) {
  const client_id = pullClientId(p);
  const embeddedName = pullClientEmbeddedName(p);

  return {
    _id: p._id,
    title: p.title || p.project_title || "-",
    description: p.description || "-",
    framework: p.framework || "-",
    figma_link: p.figma_link || p.figmaLink || p.figma || "",
    github_repo_url: p.github_repo_url || p.githubURL || "",
    deadline: p.deadline || p.due_date || p.dueDate || "",
    client_id,
    client_name: embeddedName || (typeof p.client === "string" && !isObjectId(p.client) ? p.client : ""),
  };
}

const ProjectOnProgress = () => {
  const [projects, setProjects] = useState([]);
  const [clientsMap, setClientsMap] = useState({}); // { [clientId]: nama }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnProgressProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1) Ambil semua clients → buat map id->nama
        const clientsRes = await axios.get(`${API_BASE}/api/clients`, {
          headers,
          validateStatus: () => true,
        });
        const clientsArr = Array.isArray(clientsRes.data?.data) ? clientsRes.data.data : [];
        const cmap = {};
        for (const c of clientsArr) {
          const id = c?._id;
          const name = c?.nama_lengkap || c?.name || c?.email || "-";
          if (id) cmap[id] = name;
        }
        setClientsMap(cmap);

        // 2) Ambil ringkasan total project (pakai langsung list "On Progress")
        const totalRes = await axios.get(`${API_BASE}/api/projects/total-project`, {
          headers,
          validateStatus: () => true,
        });
        if (!(totalRes.status >= 200 && totalRes.status < 300)) {
          throw new Error(totalRes.data?.message || "Gagal mengambil data proyek.");
        }

        const onProgressList =
          totalRes.data?.data?.statusSummary?.detail?.["On Progress"] || [];

        // 3) Normalisasi dan isi client_name dengan prioritas:
        //    a) field client_name dari BE / embedded client
        //    b) nama dari clientsMap via client_id
        //    c) "-"
        const normalized = onProgressList.map((p) => {
          const n = normalizeProject(p);
          const nameFromMap = n.client_id ? cmap[n.client_id] : null;
          return {
            ...n,
            client_name: n.client_name || nameFromMap || "-",
          };
        });

        setProjects(normalized);
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data proyek.");
      } finally {
        setLoading(false);
      }
    };

    fetchOnProgressProjects();
  }, []);

  return (
    <div className="min-h-screen bg-white px-8 py-6">
      <div className="mb-6">
        <Link to="/dashboard-karyawan" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Status Project : On Progress</h2>

      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm border-b border-gray-500">
              <tr>
                <th className="px-4 py-2">Project Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Framework</th>
                <th className="px-4 py-2">Figma Link</th>
                <th className="px-4 py-2">Github Repo</th>
                <th className="px-4 py-2">Deadline</th>
                <th className="px-4 py-2">Client</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-gray-200 text-sm">
                  {/* Title */}
                  <td className="px-4 py-2 align-top whitespace-normal break-words">
                    {project.title}
                  </td>

                  {/* Description: hormati \n jadi baris baru */}
                  <td className="px-4 py-2 align-top whitespace-pre-line break-words">
                    {project.description || "-"}
                  </td>

                  {/* Framework */}
                  <td className="px-4 py-2 align-top whitespace-normal break-words">
                    {project.framework || "-"}
                  </td>

                  {/* Figma link */}
                  <td className="px-4 py-2 align-top whitespace-normal break-all">
                    {project.figma_link ? (
                      <a
                        href={project.figma_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-all"
                      >
                        {project.figma_link}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  {/* GitHub repo URL */}
                  <td className="px-4 py-2 align-top whitespace-normal break-all">
                    {project.github_repo_url ? (
                      <a
                        href={project.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-all"
                      >
                        {project.github_repo_url}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="px-4 py-2 align-top whitespace-normal">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString("id-ID")
                      : "-"}
                  </td>

                  {/* Client name */}
                  <td className="px-4 py-2 align-top whitespace-normal break-words">
                    {project.client_name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectOnProgress;
