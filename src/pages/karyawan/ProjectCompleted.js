// src/pages/karyawan/ProjectCompleted.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ProjectCompleted = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://be.bytelogic.orenjus.com/api/projects/total-project", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const allCompleted = response.data.data?.statusSummary?.detail?.["Completed"] || [];
        setCompletedProjects(allCompleted);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data proyek completed");
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
                  <td className="px-4 py-2 text-sm text-gray-700">{project.description}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{project.framework}</td>
                  <td className="px-4 py-2 text-sm text-blue-600 underline">
                    <a href={project.figma_link} target="_blank" rel="noopener noreferrer">
                      {project.figma_link}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">{project.github_token}</td>
                  <td className="px-4 py-2 text-sm">{new Date(project.deadline).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-2 text-sm">{project.client_name}</td>
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