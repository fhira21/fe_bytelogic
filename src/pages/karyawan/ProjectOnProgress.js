import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ProjectOnProgress = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnProgressProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects/total-project", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const allProjects = response.data.data.statusSummary.detail["On Progress"] || [];
        setProjects(allProjects);
      } catch (err) {
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
                  <td className="px-4 py-2">{project.description}</td>
                  <td className="px-4 py-2">{project.framework || "-"}</td>
                  <td className="px-4 py-2">
                    <a
                      href={project.figma_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {project.figma_link}
                    </a>
                  </td>
                  <td className="px-4 py-2">{project.github_token}</td>
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
