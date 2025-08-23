// src/pages/karyawan/ProjectOnProgress.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://be.bytelogic.orenjus.com";

function normalizeProject(p = {}) {
  const clientName =
    p.client_name ||
    p.client?.nama_lengkap ||
    p.client?.name ||
    p.client ||
    "-";
  return {
    _id: p._id,
    title: p.title || p.project_title || "-",
    description: p.description || "-",
    framework: p.framework || "-",
    figma_link: p.figma_link || p.figmaLink || p.figma || "",
    github_token: p.github_token || p.githubToken || "",
    deadline: p.deadline || p.due_date || p.dueDate || "",
    client_name: clientName,
  };
}

const ProjectOnProgress = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnProgressProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");

        // 1) Ambil ringkasan
        const res = await axios.get(`${API_BASE}/api/projects/total-project`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const ids = (res.data?.data?.statusSummary?.detail?.["On Progress"] || [])
          .map((p) => p?._id)
          .filter(Boolean);

        if (!ids.length) {
          setProjects([]);
          setLoading(false);
          return;
        }

        // 2) Ambil detail per proyek
        const detailList = await Promise.all(
          ids.map((id) =>
            axios
              .get(`${API_BASE}/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true,
              })
              .then((r) => (r.status >= 200 && r.status < 300 ? r.data?.data || r.data : null))
              .catch(() => null)
          )
        );

        // 3) Normalisasi
        const normalized = detailList
          .filter(Boolean)
          .map((p) => normalizeProject(p));

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
          <table className="w-full text-left border-t border-b border-gray-200">
            <thead className="bg-gray-50 text-sm text-gray-700">
              <tr>
                <th className="px-4 py-2">Project Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Framework</th>
                <th className="px-4 py-2">Figma Link</th>
                <th className="px-4 py-2">Github Token</th>
                <th className="px-4 py-2">Deadline</th>
                <th className="px-4 py-2">Client</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-t border-gray-200 text-sm">
                  <td className="px-4 py-2">{project.title}</td>
                  <td className="px-4 py-2">{project.description || "-"}</td>
                  <td className="px-4 py-2">{project.framework || "-"}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2 font-mono break-all">
                    {project.github_token || <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-4 py-2">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{project.client_name || "-"}</td>
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