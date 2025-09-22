import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer } from "recharts";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Header from "../../components/Header";
import DonutChart from "../../components/DonutChart";

const DashboardKlien = () => {
  // State untuk user dengan nilai default yang aman
  const [user] = useState({
    name: "Loading...",
    email: "Loading...",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  const navigate = useNavigate();

  // State untuk profil klien dengan inisialisasi yang lebih aman
  const [profile, setProfile] = useState({
    loading: true,
    error: null,
    data: {
      client: {},
      user: {},
    },
  });

  // State untuk proyek klien dengan inisialisasi yang lebih aman
  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    data: [],
    selectedProject: null,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [evaluatedProjects, setEvaluatedProjects] = useState([]);
  const [isEvaluated, setIsEvaluated] = useState(false);

  // Menghindari potential null reference
  const currentProjectId = projects.selectedProject?._id
    ? String(projects.selectedProject._id)
    : "";

  // Fetch data profil klien dengan error handling yang lebih baik
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "https://be.bytelogic.orenjus.com/api/clients/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setProfile({
          loading: false,
          error: null,
          data: response.data?.data || { client: {}, user: {} },
        });
      } catch (error) {
        console.error("Error fetching client profile:", error);
        setProfile({
          loading: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Gagal memuat profil klien",
          data: { client: {}, user: {} },
        });
      }
    };

    fetchProfile();
  }, []);

  // Fetch data proyek klien dengan error handling yang lebih baik
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "https://be.bytelogic.orenjus.com/api/projects/klien",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const projectsData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setProjects({
          loading: false,
          error: null,
          data: projectsData,
          selectedProject: projectsData.length > 0 ? projectsData[0] : null,
        });
      } catch (error) {
        console.error("Error fetching client projects:", error);
        setProjects({
          loading: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Gagal memuat proyek klien",
          data: [],
          selectedProject: null,
        });
      }
    };

    fetchProjects();
  }, []);

  // Fetch evaluations dengan error handling yang lebih baik
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await axios.get(
          "https://be.bytelogic.orenjus.com/api/evaluations/evaluationmyclient",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const sudahDinilaiSemua = Array.isArray(res.data?.data)
          ? res.data.data.every((e) => e?.sudah_dinilai === true)
          : false;

        setIsEvaluated(sudahDinilaiSemua);
      } catch (err) {
        console.error("Gagal fetch evaluasi", err);
        setEvaluatedProjects([]);
      }
    };

    fetchEvaluations();
  }, []);

  // Komponen ProgressPieChart dengan null checks
  const ProgressPieChart = ({ progressData, project }) => {
    if (!progressData || typeof progressData !== "object") {
      return (
        <div className="text-center text-gray-500 p-4">
          Data progress tidak tersedia
        </div>
      );
    }

    const total = Number(progressData.total) || 0;
    const closed = Number(progressData.closed) || 0;
    const remaining = Math.max(0, total - closed);
    const progressPercentage =
      total > 0 ? Math.round((closed / total) * 100) : 0;

    return (
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="h-64 w-full">
          <h4 className="text-center font-medium mb-2">
            {progressPercentage}% Overall Progress
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <DonutChart progress={progressData.percentage || 0} />
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Deadline:</span>
            <span>
              {project?.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-semibold">Status:</span>
            <span>{project?.status || "N/A"}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-semibold">Framework:</span>
            <span>{project?.framework || "Belum ditentukan"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-700 mb-4">
          <p>
            <b>Link Figma:</b>{" "}
            {project?.figma ? (
              <a
                href={project.figma}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {project.figma}
              </a>
            ) : (
              "Tidak tersedia"
            )}
          </p>

          {/* Employee Name */}
          <p>
            <b>Employee Name:</b>{" "}
            {project?.employees && project.employees.length > 0
              ? project.employees.join(", ")
              : "Tidak ada data"}
          </p>

          {/* Link GitHub */}
          <p>
            <b>Link GitHub:</b>{" "}
            {project?.github_repo_url ? (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {project.github_repo_name || project.github_repo_url}
              </a>
            ) : (
              "Tidak tersedia"
            )}
          </p>
        </div>
      </div>
    );
  };

  // Komponen RecentActivity dengan null checks
  const RecentActivity = ({ commits = [] }) => {
    if (!Array.isArray(commits)) {
      return <div className="text-gray-500">Data commit tidak valid</div>;
    }

    if (commits.length === 0) {
      return <div className="text-gray-500">Belum ada aktivitas GitHub</div>;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity GitHub</h3>
        <div className="space-y-2">
          {commits.slice(0, 5).map((commit, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <p className="font-medium">
                {commit.message || "No commit message"}
              </p>
              <p className="text-sm text-gray-600">
                @ {commit.author || "Unknown author"} -{" "}
                {commit.date
                  ? new Date(commit.date).toLocaleDateString()
                  : "Unknown date"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Komponen IssuesList dengan null checks
  const IssuesList = ({ issues = [], state = "open" }) => {
    if (!Array.isArray(issues)) {
      return <div className="text-gray-500">Data issues tidak valid</div>;
    }

    const filteredIssues = issues.filter((issue) => issue?.state === state);
    const colorClass = state === "open" ? "text-red-600" : "text-green-600";
    const bgClass = state === "open" ? "bg-red-50" : "bg-green-50";

    return (
      <div>
        <h5 className={`font-medium ${colorClass} mb-2`}>
          {state === "open" ? "Open" : "Closed"} Issues ({filteredIssues.length}
          )
        </h5>
        <ul className="space-y-2">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <li
                key={issue.number || Math.random()}
                className={`p-2 ${bgClass} rounded`}
              >
                <a
                  href={issue.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  #{issue.number || "N/A"} - {issue.title || "Untitled Issue"}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No {state} issues</li>
          )}
        </ul>
      </div>
    );
  };

  // Komponen ProjectDropdown dengan null checks
  const ProjectDropdown = ({
    projects = [],
    selectedProject = null,
    onSelect = () => {},
    isOpen = false,
    toggleDropdown = () => {},
  }) => {
    return (
      <div className="relative mb-4">
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={toggleDropdown}
        >
          {selectedProject?.title || "Pilih Proyek"}
          {isOpen ? (
            <FiChevronUp className="ml-2 h-5 w-5" />
          ) : (
            <FiChevronDown className="ml-2 h-5 w-5" />
          )}
        </button>

        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1 max-h-60 overflow-auto">
              {projects.map((project) => (
                <button
                  key={project._id || Math.random()}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedProject?._id === project._id
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    onSelect(project);
                    toggleDropdown();
                  }}
                >
                  {project.title || "Untitled Project"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <Header user={user} />
      </header>
      <div className="h-16"></div>

      {/* <main className="flex-grow py-6"> */}
      <main className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Dashboard Klien
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
            <div className="lg:col-span-2 space-y-6">
              {/* Projects Section */}
              <div className="bg-white shadow rounded-lg p-5 w-full">
                <h2 className="text-xl font-semibold mb-4">Progress Project</h2>

                {projects.loading ? (
                  <div className="text-center py-8">Memuat proyek...</div>
                ) : projects.error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                    <p className="font-bold">Error</p>
                    <p>{projects.error}</p>
                  </div>
                ) : projects.data.length > 0 ? (
                  <>
                    <ProjectDropdown
                      projects={projects.data}
                      selectedProject={projects.selectedProject}
                      onSelect={(project) =>
                        setProjects((prev) => ({
                          ...prev,
                          selectedProject: project,
                        }))
                      }
                      isOpen={isDropdownOpen}
                      toggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
                    />

                    {projects.selectedProject && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            {projects.selectedProject.title ||
                              "Untitled Project"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              projects.selectedProject.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : projects.selectedProject.status ===
                                  "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {projects.selectedProject.status ||
                              "Unknown Status"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ProgressPieChart
                            progressData={
                              projects.selectedProject.githubProgress || {}
                            }
                            project={projects.selectedProject}
                          />

                          <div>
                            <h4 className="font-medium mb-3">
                              Issues (
                              {Array.isArray(
                                projects.selectedProject.githubIssues
                              )
                                ? projects.selectedProject.githubIssues.length
                                : 0}
                              )
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <IssuesList
                                issues={
                                  projects.selectedProject.githubIssues || []
                                }
                                state="open"
                              />
                              <IssuesList
                                issues={
                                  projects.selectedProject.githubIssues || []
                                }
                                state="closed"
                              />
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  if (!isEvaluated) {
                                    navigate(`/evaluate/${currentProjectId}`, {
                                      state: {
                                        projectName:
                                          projects.selectedProject.title,
                                        employeeName:
                                          projects.selectedProject.employees
                                            ?.map((e) => e?.nama_lengkap)
                                            ?.join(", ") || "Unknown",
                                        projectId: currentProjectId,
                                      },
                                    });
                                  }
                                }}
                                disabled={isEvaluated}
                                className={`w-full py-2 px-4 rounded-md transition duration-200 text-white ${
                                  isEvaluated
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                              >
                                {isEvaluated
                                  ? "Sudah Dievaluasi"
                                  : "Evaluate Project"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data proyek yang tersedia
                  </div>
                )}
              </div>

              {/* Recent GitHub Activity Section */}
              <div className="bg-white shadow rounded-lg p-6">
                {projects.loading ? (
                  <div className="text-center py-8">
                    Memuat aktivitas GitHub...
                  </div>
                ) : projects.selectedProject ? (
                  <RecentActivity
                    commits={projects.selectedProject.github_commits || []}
                  />
                ) : (
                  <div className="text-gray-500">
                    Pilih proyek untuk melihat aktivitas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white text-black py-4 px-4 border-t shadow">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="text-sm opacity-70">CONNECTING YOUR IDEAS</p>
              <p className="text-sm opacity-70">
                INTO REALITY. <b>Bytelogi.com@2025</b>
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <p className="text-sm opacity-70">
                <b>Contact Us</b>
              </p>
              <span className="h-12 w-px bg-blue-400"></span>
              <div className="flex flex-col text-center md:text-right">
                <a
                  href="https://wa.me/6283121596554"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <b>+6283121596554</b>
                </a>
                <a
                  href="mailto:hello@bytelogic.com"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  hello@bytelogic.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardKlien;
