// src/pages/karyawan/ProjectWaitingList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://be.bytelogic.orenjus.com";

const ProjectWaitingList = () => {
  const [waitingProjects, setWaitingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWaitingProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/projects/total-project`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const list =
          res.data?.data?.statusSummary?.detail?.["Waiting List"] || [];
        setWaitingProjects(list);
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
              {waitingProjects.map((p) => (
                <tr key={p._id} className="border-t border-gray-200 text-sm">
                  <td className="px-4 py-2">{p.title}</td>
                  <td className="px-4 py-2">{p.description || "-"}</td>
                  <td className="px-4 py-2">{p.framework || "-"}</td>
                  <td className="px-4 py-2">
                    {p.figma_link ? (
                      <a
                        href={p.figma_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {p.figma_link}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">{p.github_token || "-"}</td>
                  <td className="px-4 py-2">
                    {p.deadline
                      ? new Date(p.deadline).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{p.client_name || "-"}</td>
                </tr>
              ))}
              {waitingProjects.length === 0 && (
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