// src/pages/karyawan/ProjectCompleted.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://be.bytelogic.orenjus.com";

// Helper untuk menyatukan berbagai kemungkinan nama field
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

const ProjectCompleted = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
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

        const ids = (res.data?.data?.statusSummary?.detail?.["Completed"] || [])
          .map((p) => p?._id)
          .filter(Boolean);

        if (!ids.length) {
          setCompletedProjects([]);
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

        // 3) Normalisasi dan simpan
        const normalized = detailList
          .filter(Boolean)
          .map((p) => normalizeProject(p));
        setCompletedProjects(normalized);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data proyek completed");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <Link to="/dashboard-karyawan" className="text-blue-500 hover:underline mb-4 block">
        ← Back to Dashboard
      </Link>
      <h2 className="text-xl font-semibold mb-6">Status Project : Completed</h2>

      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Project Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Framework</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Figma Link</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Github Token</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Deadline</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Client</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedProjects.map((project) => (
                <tr key={project._id}>
                  <td className="px-4 py-2 text-sm text-gray-800">{project.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{project.description || "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{project.framework || "-"}</td>
                  <td className="px-4 py-2 text-sm">
                    {project.figma_link ? (
                      <a
                        href={project.figma_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {project.figma_link}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono break-all">
                    {project.github_token || <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm">{project.client_name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectCompleted;