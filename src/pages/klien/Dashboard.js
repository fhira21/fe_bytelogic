import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import axios from "axios";
import {
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiPhone,
  FiMail,
} from "react-icons/fi";

const DashboardKlien = () => {
  // State untuk user
  const [user] = useState({
    name: "Loading...",
    email: "Loading...",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);
    navigate("/profile/edit");
  };

  // State untuk profil klien
  const [profile, setProfile] = useState({
    loading: true,
    error: null,
    data: null,
  });

  // State untuk proyek klien
  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    data: [],
    selectedProject: null,
  });

  // State untuk dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State untuk review
  const [review, setReview] = useState({
    rating: 0,
    comment: "",
    submitting: false,
    error: null,
    success: false,
  });

  // State untuk hover rating
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch data profil klien
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/clients/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        setProfile({
          loading: false,
          error: null,
          data: response.data.data || null,
        });
      } catch (error) {
        console.error("Error fetching client profile:", error);
        setProfile({
          loading: false,
          error: error.response?.data?.message || "Gagal memuat profil klien",
          data: null,
        });
      }
    };

    fetchProfile();
  }, []);

  // Fetch data proyek klien
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/projects/klien",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Projects API Response:", response.data);

        const projectsData = response.data.data || [];

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
          error: error.response?.data?.message || "Gagal memuat proyek klien",
          data: [],
          selectedProject: null,
        });
      }
    };

    fetchProjects();
  }, []);

  // Handle submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (review.rating === 0) {
      setReview((prev) => ({ ...prev, error: "Harap beri rating" }));
      return;
    }

    setReview((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          rating: review.rating,
          comment: review.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setReview({
        rating: 0,
        comment: "",
        submitting: false,
        error: null,
        success: true,
      });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setReview((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReview((prev) => ({
        ...prev,
        submitting: false,
        error: error.response?.data?.message || "Gagal mengirim review",
      }));
    }
  };

  // Komponen untuk menampilkan pie chart progress
  const ProgressPieChart = ({ progressData }) => {
    if (!progressData) {
      return (
        <div className="text-center text-gray-500 p-4">
          Data progress tidak tersedia
        </div>
      );
    }

    const data = [
      { name: "Completed", value: progressData.closed || 0 },
      {
        name: "Remaining",
        value: (progressData.total || 0) - (progressData.closed || 0),
      },
    ];

    return (
      <div className="h-64">
        <h4 className="text-center font-medium mb-2">
          Progress: {progressData.progressPercentage || 0}%
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              <Cell fill="#00C49F" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Komponen untuk menampilkan recent GitHub activity
  const RecentActivity = ({ commits }) => {
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
              <p className="font-medium">{commit.message}</p>
              <p className="text-sm text-gray-600">
                @ {commit.author} - {new Date(commit.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Komponen untuk rating stars
  const StarRating = ({
    rating,
    onRatingChange,
    hoverRating,
    onHoverChange,
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="text-2xl focus:outline-none"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHoverChange(star)}
            onMouseLeave={() => onHoverChange(0)}
          >
            <FiStar
              className={
                (hoverRating || rating) >= star
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  // Komponen untuk menampilkan daftar issues
  const IssuesList = ({ issues, state }) => {
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
              <li key={issue.number} className={`p-2 ${bgClass} rounded`}>
                <a
                  href={issue.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  #{issue.number} - {issue.title || "Untitled Issue"}
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

  // Komponen dropdown untuk memilih proyek
  const ProjectDropdown = ({
    projects,
    selectedProject,
    onSelect,
    isOpen,
    toggleDropdown,
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
                  key={project._id}
                  className={`block w-full text-left px-4 py-2 text-sm ${selectedProject?._id === project._id
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    onSelect(project);
                    toggleDropdown();
                  }}
                >
                  {project.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Bytelogic</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
                <FiBell size={20} />
              </button>
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar}
                      alt="User avatar"
                    />
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-800">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    {isProfileDropdownOpen ? (
                      <FiChevronUp className="ml-1 h-4 w-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>

                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <button
                      onClick={handleEditProfile}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard Klien
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri - 1/3 lebar */}
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Profile Information
              </h2>

              {profile.loading ? (
                <div className="text-center py-8">Memuat profil...</div>
              ) : profile.error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                  <p className="font-bold">Error</p>
                  <p>{profile.error}</p>
                </div>
              ) : profile.data ? (
                <div className="space-y-4">
                  {/* Foto Profil dengan Username dan Nama Lengkap */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <img
                      src={
                        profile.data?.client?.foto_profile ||
                        "/default-profile.png"
                      }
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 mb-4"
                      onError={(e) => {
                        e.target.src = "/default-profile.png";
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-bold">
                        {profile.data.user?.username || "-"}
                      </h3>
                      <p className="text-gray-600">
                        {profile.data?.client?.nama_lengkap || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Informasi Kontak */}
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-500 mb-1">Email</h3>
                      <div className="flex items-center">
                        <FiMail className="w-4 h-4 mr-2 text-gray-600" />
                        <p className="text-gray-800">
                          {profile.data?.client?.email || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-500 mb-1">
                        Address
                      </h3>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-gray-800">
                          {profile.data?.client?.alamat || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-500 mb-1">
                        Phone Number
                      </h3>
                      <div className="flex items-center">
                        <FiPhone className="w-4 h-4 mr-2 text-gray-600" />
                        <p className="text-gray-800">
                          {profile.data?.client?.nomor_telepon || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Data profil tidak tersedia
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

          {/* Kolom Kanan - 2/3 lebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects Section */}
            <div className="bg-white shadow rounded-lg p-5">
              <h2 className="text-xl font-semibold mb-4">Project Progress</h2>

              {projects.loading ? (
                <div className="text-center py-8">Memuat proyek...</div>
              ) : projects.error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                  <p className="font-bold">Error</p>
                  <p>{projects.error}</p>
                </div>
              ) : Array.isArray(projects.data) && projects.data.length > 0 ? (
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
                          {projects.selectedProject.title || "Untitled Project"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${projects.selectedProject.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : projects.selectedProject.status ===
                                "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {projects.selectedProject.status || "Unknown Status"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProgressPieChart
                          progressData={projects.selectedProject.githubProgress}
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
                              issues={projects.selectedProject.githubIssues}
                              state="open"
                            />
                            <IssuesList
                              issues={projects.selectedProject.githubIssues}
                              state="closed"
                            />
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
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white shadow-sm border-t mt-8 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Bagian Kiri */}
              <div className="mb-3 md:mb-0">
                <p className="text-gray-800 text-sm">
                  <span className="font-medium">Connecting your ideas</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">
                    info reality. Bytelogic.com@2025
                  </span>
                </p>
              </div>

              {/* Bagian Kanan - Contact Us dengan Ikon */}
              <div className="flex flex-col items-center md:items-end space-y-2">
                <p className="text-sm font-medium text-gray-700">Contact us</p>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-600" />
                    <p className="text-sm text-gray-600">+6287770300417</p>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="w-4 h-4 mr-2 text-gray-600" />
                    <p className="text-sm text-gray-600">hello@bytelogic.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardKlien;