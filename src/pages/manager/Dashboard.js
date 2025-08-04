import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopbarProfile from '../../components/TopbarProfile';
import axios from "axios";
import {
  Home,
  Folder,
  ChartBar,
  FileText,
  User,
  Users as ClientsIcon,
  List,
  TrendingUp,
} from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardManager = () => {
  const navigate = useNavigate();

  // State for manager profile
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    data: null,
    error: null,
  });

  // State for employee data
  const [employeeData, setEmployeeData] = useState({
    loading: true,
    error: null,
    totalKaryawan: 0,
    status: {
      "Karyawan Aktif": 0,
      "Karyawan Tidak Aktif": 0,
      "Magang Aktif": 0,
      "Magang Tidak Aktif": 0,
    },
  });

  // State for clients data
  const [clientData, setClientData] = useState({
    loading: true,
    error: null,
    totalClients: 0,
  });

  // State for projects
  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    stats: {
      total: 0,
      waiting: 0,
      progress: 0,
      completed: 0,
    },
    lists: [],
  });

  // state for filter status
  const [projectStatusFilter, setProjectStatusFilter] = useState("All");

  // State for evaluations
  const [evaluations, setEvaluations] = useState({
    loading: true,
    error: null,
    topEmployees: [],
  });

  // State for reviews
  const [reviews, setReviews] = useState({
    loading: true,
    error: null,
    averageRating: "0.00",
    totalReviews: 0,
    ratings: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });

  //useeffect total client
  useEffect(() => {
    const fetchTotalClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://be.bytelogic.orenjus.com/api/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setClientData({
          loading: false,
          error: null,
          totalClients: response.data.totalClients || 0,
        });
      } catch (error) {
        console.error("Gagal mengambil data klien:", error);
        setClientData({
          loading: false,
          error: "Gagal mengambil data klien",
          totalClients: 0,
        });
      }
    };

    fetchTotalClients();
  }, []);

  //useeffect maanger profile
  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/managers/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setManagerProfile({
          loading: false,
          data: response.data.data,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching manager profile:", error);
        setManagerProfile({
          loading: false,
          data: null,
          error: "Gagal mengambil profil",
        });
      }
    };

    fetchManagerProfile();
  }, []);

  // Fetch employee status data
  useEffect(() => {
    const fetchEmployeeStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/karyawan/statuskaryawan",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEmployeeData({
          loading: false,
          error: null,
          totalKaryawan: response.data.totalKaryawan,
          status: response.data.data,
        });
      } catch (error) {
        console.error("Error fetching employee status:", error);
      }
    };

    fetchEmployeeStatus();
  }, []);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        // Buat dua request paralel untuk mendapatkan data statistik dan daftar proyek
        const [statusResponse, projectsResponse] = await Promise.all([
          axios.get("http://be.bytelogic.orenjus.com/api/projects/status-summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://be.bytelogic.orenjus.com/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProjects({
          loading: false,
          error: null,
          stats: {
            total: projectsResponse.data.data.length,
            waiting: statusResponse.data.data["Waiting List"] || 0,
            progress: statusResponse.data.data["On Progress"] || 0,
            completed: statusResponse.data.data["Completed"] || 0,
          },
          lists: projectsResponse.data.data,
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch evaluations data
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/evaluations/karyawan/evaluasi-detailed",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Sort and get top 5 employees
        const sorted = response.data.data
          .sort((a, b) => b.average_final_score - a.average_final_score)
          .slice(0, 5);

        setEvaluations({
          loading: false,
          error: null,
          topEmployees: sorted,
        });
      } catch (error) {
        console.error("Error fetching evaluations:", {
          message: error.message,
          response: error.response,
          stack: error.stack,
        });
        setEvaluations({
          loading: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Failed to load evaluations",
          topEmployees: [],
        });
      }
    };

    fetchEvaluations();
  }, []);

  // Fetch reviews data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/reviews/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setReviews({
          loading: false,
          error: null,
          averageRating: response.data.averageRating || "0.00",
          totalReviews: response.data.totalReviews || 0,
          ratings: response.data.ratings || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  // Component for Top 5 Employees table
  const TopEmployeesTable = () => {
    if (evaluations.loading)
      return <div className="p-4 text-center">Loading top employees...</div>;
    if (evaluations.error)
      return <div className="p-4 text-red-500">{evaluations.error}</div>;
    if (evaluations.topEmployees.length === 0) {
      return (
        <div className="p-4 text-gray-500">No evaluation data available</div>
      );
    }

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Ranking</th>
            <th className="px-4 py-2 text-left">Employee Name</th>
            <th className="px-4 py-2 text-left">Point</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.topEmployees.map((employee, index) => (
            <tr key={employee._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">
                {employee.nama_karyawan ||
                  employee.nama_lengkap ||
                  employee.name}
              </td>
              <td className="px-4 py-2">{employee.average_final_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">
            B
          </div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font mb-6">MENU</h1>
        <button
          onClick={() => navigate("/dashboard-manager")}
          className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Home size={18} /> Dashboard
        </button>
        <button
          onClick={() => navigate("/admin-list")}
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Folder size={18} /> Admin Data
        </button>
        <button
          onClick={() => navigate("/employee-list")}
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Folder size={18} /> Employee Data
        </button>
        <button
          onClick={() => navigate("/client-data")}
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Folder size={18} /> Client Data
        </button>
        <button
          onClick={() => navigate("/data-project")}
          className="flex items-center justify-center md:justify-start gap-2 hover:bg-blue-600 p-2 rounded mb-2"
        >
          <Folder size={18} />
          <span className="hidden md:inline">Project Data</span>
        </button>
        <button
          onClick={() => navigate("/employee-evaluation")}
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <ChartBar size={18} /> Evaluation
        </button>
        <button
          onClick={() => navigate("/customer-reviews")}
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Topbar Profile */}
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Dashboard Manager</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Employee Data Card */}
          <div
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/employee-list")}
          >
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Employee Data
              </h3>
              <p className="text-2xl font-bold">
                {employeeData.loading ? "..." : employeeData.totalKaryawan}
              </p>
            </div>
          </div>

          {/* Client Data Card */}
          <div
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/client-data")}
          >
            <div className="p-3 bg-green-100 rounded-full">
              <ClientsIcon className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client Data</h3>
              <p className="text-2xl font-bold">
                {clientData.loading ? "..." : clientData.totalClients}
              </p>
            </div>
          </div>

          {/* Waiting List Card */}
          <div
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/data-project?status=waiting")}
          >
            <div className="p-3 bg-purple-100 rounded-full">
              <List className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Waiting List
              </h3>
              <p className="text-2xl font-bold">
                {projects.loading ? "..." : projects.stats.waiting}
              </p>
            </div>
          </div>

          {/* On Progress Card */}
          <div
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/data-project?status=progress")}
          >
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="text-yellow-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">On Progress</h3>
              <p className="text-2xl font-bold">
                {projects.loading ? "..." : projects.stats.progress}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Performance and Rating Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* === EMPLOYEE STATUS === */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Employee Status
            </h2>
            <div className="flex flex-col items-center lg:flex-row gap-6">
              {/* Donut Chart */}
              <div className="relative w-40 h-40">
                <Pie
                  data={{
                    labels: [],
                    datasets: [
                      {
                        data: Object.values(employeeData.status),
                        backgroundColor: [
                          "#2563eb",
                          "#93c5fd",
                          "#60a5fa",
                          "#bfdbfe",
                        ],
                        borderWidth: 0,
                        cutout: "80%",
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      tooltip: { enabled: false },
                      legend: { display: false },
                    },
                  }}
                />
              </div>

              {/* Legend */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2563eb]"></span>{" "}
                  Active Employee
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#93c5fd]"></span>{" "}
                  Inactive Employee
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#60a5fa]"></span>{" "}
                  Active Internship
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#bfdbfe]"></span>{" "}
                  Inactive Internship
                </div>
              </div>
            </div>
          </div>

          {/* === RATING COMPANY === */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Rating Company
            </h2>

            {reviews.loading ? (
              <div className="p-4 text-center">Loading reviews...</div>
            ) : reviews.error ? (
              <div className="p-4 text-red-500">{reviews.error}</div>
            ) : (
              <div className="flex flex-col items-center lg:flex-row gap-6">
                {/* Donut Chart + Rating Info */}
                <div className="relative w-40 h-40">
                  <Pie
                    data={{
                      labels: [],
                      datasets: [
                        {
                          data: [
                            reviews.totalReviews,
                            reviews.totalReviews * 0.1,
                          ],
                          backgroundColor: ["#3B82F6", "#E5E7EB"],
                          borderWidth: 0,
                          cutout: "80%",
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        tooltip: { enabled: false },
                        legend: { display: false },
                      },
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">
                      {reviews.averageRating}
                    </span>
                    <span className="text-xs text-gray-500">
                      {reviews.totalReviews} Reviews
                    </span>
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="w-full flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.ratings[rating] || 0;
                    const percentage =
                      reviews.totalReviews > 0
                        ? Math.round((count / reviews.totalReviews) * 100)
                        : 0;

                    return (
                      <div
                        key={rating}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-4 text-yellow-400">★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-right text-gray-600">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Status and Top Employees Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Project Progress Table - Takes 3/4 width */}
          <div className="lg:w-3/4 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Project Progress
              </h3>
              <div className="flex items-center">
                {" "}
                {/* Tambahkan flex container di sini */}
                <div className="relative mr-3">
                  {" "}
                  {/* Tambahkan mr-3 untuk margin kanan */}{" "}
                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Waiting List">Waiting List</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    if (projectStatusFilter === "All") {
                      navigate("/data-project");
                    } else {
                      navigate(`/data-project?status=${encodeURIComponent(projectStatusFilter)}`);
                    }
                  }}

                >
                  View Detail
                </button>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Project Name</th>
                    <th className="px-6 py-3 text-left">Client Name</th>
                    <th className="px-6 py-3 text-left">Deadline</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        Loading projects...
                      </td>
                    </tr>
                  ) : projects.error ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-red-500">
                        {projects.error}
                      </td>
                    </tr>
                  ) : projects.lists.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-gray-500 text-center"
                      >
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    projects.lists
                      .filter(
                        (project) =>
                          projectStatusFilter === "All" ||
                          project.status === projectStatusFilter
                      )
                      .slice(0, 5)
                      .map((project) => (
                        <tr
                          key={project._id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">{project.title || "-"}</td>
                          <td className="px-6 py-4">
                            {project.client?.nama_lengkap ||
                              project.client?.name ||
                              "-"}
                          </td>
                          <td className="px-6 py-4">
                            {project.deadline
                              ? new Date(project.deadline).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 capitalize">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${project.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : project.status === "On Progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {project.status || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 5 Employees Table - Takes 1/4 width */}
          <div className="lg:w-1/4 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Top 5 Employees
              </h3>
            </div>
            <div className="p-4">
              <TopEmployeesTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardManager;