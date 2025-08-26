import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://be.bytelogic.orenjus.com";

/* ===== Helpers (samakan dengan halaman lain) ===== */
const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

function pullClientId(p = {}) {
  if (p.client_id && isObjectId(p.client_id)) return p.client_id;
  if (typeof p.client === "string" && isObjectId(p.client)) return p.client;
  if (p.client && typeof p.client === "object" && isObjectId(p.client._id)) return p.client._id;
  if (p.clientId && isObjectId(p.clientId)) return p.clientId;
  return null;
}

function pullClientEmbeddedName(p = {}) {
  if (p.client && typeof p.client === "object") {
    return p.client.nama_lengkap || p.client.name || p.client.email || null;
  }
  return p.client_name || p.clientName || null;
}

function normalizeProject(p = {}) {
  const client_id = pullClientId(p);
  const embeddedName = pullClientEmbeddedName(p);

  return {
    _id: p._id,
    title: p.title || p.project_title || "-",
    description: p.description || "-",
    framework: p.framework || "-",
    figma_link: p.figma_link || p.figmaLink || p.figma || "",
    github_repo_url: p.github_repo_url || p.githubURL || "", // pakai repo URL
    deadline: p.deadline || p.due_date || p.dueDate || "",
    client_id,
    client_name:
      embeddedName ||
      (typeof p.client === "string" && !isObjectId(p.client) ? p.client : ""),
  };
}

const ProjectWaitingList = () => {
  const [projects, setProjects] = useState([]);
  const [clientsMap, setClientsMap] = useState({}); // { [clientId]: nama }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWaitingProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1) Ambil semua clients → buat map id -> nama
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

        // 2) Ambil ringkasan total project → bucket "Waiting List"
        const res = await axios.get(`${API_BASE}/api/projects/total-project`, {
          headers,
          validateStatus: () => true,
        });
        if (!(res.status >= 200 && res.status < 300)) {
          throw new Error(res.data?.message || "Gagal memuat data proyek Waiting List");
        }

        const list = res.data?.data?.statusSummary?.detail?.["Waiting List"] || [];

        // 3) Normalisasi + isi nama klien dari cmap bila hanya ada ID
        const normalized = list.map((p) => {
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
        setError("Gagal memuat data proyek Waiting List");
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingProjects();
  }, []);

  return (
    <div className="min-h-screen bg-white px-8 py-6">
      <div className="mb-6">
        <Link to="/dashboard-karyawan" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Status Project : Waiting List</h2>

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
              {projects.map((p) => (
                <tr key={p._id} className="border-gray-200 text-sm">
                  {/* Title */}
                  <td className="px-4 py-2 align-top whitespace-normal break-words">
                    {p.title}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-2 align-top whitespace-pre-line break-words">
                    {p.description || "-"}
                  </td>

                  {/* Framework */}
                  <td className="px-4 py-2 align-top whitespace-normal break-words">
                    {p.framework || "-"}
                  </td>

                  {/* Figma link */}
                  <td className="px-4 py-2 align-top whitespace-normal break-all">
                    {p.figma_link ? (
                      <a
                        href={p.figma_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-all"
                      >
                        {p.figma_link}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  {/* GitHub repo URL */}
                  <td className="px-4 py-2 align-top whitespace-normal break-all">
                    {p.github_repo_url ? (
                      <a
                        href={p.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-all"
                      >
                        {p.github_repo_url}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="px-4 py-2 align-top whitespace-normal">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString("id-ID") : "-"}
                  </td>

                  {/* Client */}
                  <td className="px-4 py-2 align-top whitespace-normal break-words">
                    {p.client_name || "-"}
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={7}>
                    Tidak ada proyek Waiting List.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectWaitingList;
