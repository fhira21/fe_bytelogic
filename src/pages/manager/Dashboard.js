// src/pages/dashboard/DashboardManager.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopbarProfile from "../../components/TopbarProfile";
import axios from "axios";
import {
  Home,
  Folder,
  ChartBar,
  FileText,
  ClipboardList,
  ClipboardCheck,
  Clock,
  UserCheck,
} from "lucide-react";
import { Pie } from "react-chartjs-2";
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

  // Manager profile
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    data: null,
    error: null,
  });

  // Employee data (ambil dari BE)
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

  // Client data
  const [clientData, setClientData] = useState({
    loading: true,
    error: null,
    totalClients: 0,
  });

  // Projects
  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    stats: { total: 0, waiting: 0, progress: 0, completed: 0 },
    lists: [],
  });
  const [projectStatusFilter, setProjectStatusFilter] = useState("All");

  // Evaluations
  const [evaluations, setEvaluations] = useState({
    loading: true,
    error: null,
    topEmployees: [],
  });

  // Reviews
  const [reviews, setReviews] = useState({
    loading: true,
    error: null,
    averageRating: "0.00",
    totalReviews: 0,
    ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const ALLOWED_STATUSES = ["Waiting List", "On Progress", "Completed"];

  // ======= Fetch Total Clients =======
  useEffect(() => {
    const fetchTotalClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://be.bytelogic.orenjus.com/api/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClientData({
          loading: false,
          error: null,
          totalClients: res.data.totalClients || 0,
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

  // ======= Fetch Manager Profile =======
  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://be.bytelogic.orenjus.com/api/managers/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setManagerProfile({ loading: false, data: res.data.data, error: null });
      } catch (error) {
        console.error("Error fetching manager profile:", error);
        setManagerProfile({ loading: false, data: null, error: "Gagal mengambil profil" });
      }
    };
    fetchManagerProfile();
  }, []);

  // ======= Fetch Employee Status =======
  useEffect(() => {
    const fetchEmployeeStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://be.bytelogic.orenjus.com/api/karyawan/statuskaryawan",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setEmployeeData({
          loading: false,
          error: null,
          totalKaryawan: res.data.totalKaryawan,
          status: res.data.data,
        });
      } catch (error) {
        console.error("Error fetching employee status:", error);
        setEmployeeData((p) => ({ ...p, loading: false, error: "Gagal memuat status karyawan" }));
      }
    };
    fetchEmployeeStatus();
  }, []);

  // ======= Fetch Projects =======
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statusRes, listRes] = await Promise.all([
          axios.get("https://be.bytelogic.orenjus.com/api/projects/status-summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://be.bytelogic.orenjus.com/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProjects({
          loading: false,
          error: null,
          stats: {
            total: listRes.data.data.length,
            waiting: statusRes.data.data["Waiting List"] || 0,
            progress: statusRes.data.data["On Progress"] || 0,
            completed: statusRes.data.data["Completed"] || 0,
          },
          lists: listRes.data.data,
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects((p) => ({ ...p, loading: false, error: "Gagal memuat proyek" }));
      }
    };
    fetchProjects();
  }, []);

  // ======= Fetch Evaluations =======
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://be.bytelogic.orenjus.com/api/evaluations/karyawan/evaluasi-detailed",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sorted = res.data.data
          .sort((a, b) => b.average_final_score - a.average_final_score)
          .slice(0, 5);

        setEvaluations({ loading: false, error: null, topEmployees: sorted });
      } catch (error) {
        console.error("Error fetching evaluations:", error);
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

  // ======= Fetch Reviews =======
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://be.bytelogic.orenjus.com/api/reviews/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReviews({
          loading: false,
          error: null,
          averageRating: res.data.averageRating || "0.00",
          totalReviews: res.data.totalReviews || 0,
          ratings: res.data.ratings || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews((p) => ({ ...p, loading: false, error: "Gagal memuat ulasan" }));
      }
    };
    fetchReviews();
  }, []);

  // ======= Table Top Employees =======
  const TopEmployeesTable = () => {
    if (evaluations.loading) return <div className="p-4 text-center">Loading top employees...</div>;
    if (evaluations.error) return <div className="p-4 text-red-500">{evaluations.error}</div>;
    if (evaluations.topEmployees.length === 0) {
      return <div className="p-4 text-gray-500">No evaluation data available</div>;
    }

    return (
      <table className="w-full text-sm">
        {/* garis hanya di bawah header */}
        <thead className="bg-white border-b border-gray-300">
          <tr>
            <th className="px-4 py-2 text-left text-gray-500 font-normal">Ranking</th>
            <th className="px-4 py-2 text-left text-gray-500 font-normal">Employee Name</th>
            <th className="px-4 py-2 text-left text-gray-500 font-normal">Point</th>
          </tr>
        </thead>

        {/* jangan pakai border/divide di body */}
        <tbody>
          {evaluations.topEmployees.map((employee, index) => (
            // HAPUS "border-t" di sini
            <tr key={employee._id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">
                {employee.nama_karyawan || employee.nama_lengkap || employee.name}
              </td>
              <td className="px-4 py-2">{employee.average_final_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ======= Helper untuk Donut 2 status (Active vs Inactive Employee) =======
  const ACTIVE_COLOR = "#2563eb";   // biru (aktif)
  const INACTIVE_COLOR = "#93c5fd"; // biru muda (tidak aktif)

  const activeCount = Number(employeeData.status["Karyawan Aktif"] || 0);
  const inactiveCount = Number(employeeData.status["Karyawan Tidak Aktif"] || 0);
  const totalEmp = activeCount + inactiveCount;
  const pctActive = totalEmp > 0 ? Math.round((activeCount / totalEmp) * 100) : 0;
  const pctInactive = totalEmp > 0 ? Math.round((inactiveCount / totalEmp) * 100) : 0;

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
        <button onClick={() => navigate("/dashboard-manager")} className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left">
          <Home size={18} /> Dashboard
        </button>
        <button onClick={() => navigate("/admin-list")} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Admin Data
        </button>
        <button onClick={() => navigate("/employee-list")} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Employee Data
        </button>
        <button onClick={() => navigate("/client-data")} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Client Data
        </button>
        <button
          onClick={() => navigate("/data-project")}
          className="flex items-center justify-center md:justify-start gap-2 hover:bg-blue-600 p-2 rounded mb-2"
        >
          <Folder size={18} />
          <span className="hidden md:inline">Project Data</span>
        </button>
        <button onClick={() => navigate("/employee-evaluation")} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <ChartBar size={18} /> Evaluation
        </button>
        <button onClick={() => navigate("/customer-reviews")} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-white">
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Kartu statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white text-black rounded-lg p-4 border border-gray-300 flex items-center space-x-4">
            <UserCheck className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">Employee Data</h3>
              <p className="text-medium font-bold">
                {employeeData.loading ? "..." : employeeData.totalKaryawan}
              </p>
            </div>
          </div>

          <div className="bg-white text-black rounded-lg p-4 border border-gray-300 flex items-center space-x-4">
            <ClipboardList className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">Client Data</h3>
              <p className="text-medium font-bold">
                {clientData.loading ? "..." : clientData.totalClients}
              </p>
            </div>
          </div>

          <div className="bg-white text-black rounded-lg p-4 border border-gray-300 flex items-center space-x-4">
            <Clock className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">Waiting List</h3>
              <p className="text-medium font-bold">
                {projects.loading ? "..." : `${projects.stats.waiting} Projects`}
              </p>
            </div>
          </div>

          <div className="bg-white text-black rounded-lg p-4 border border-gray-300 flex items-center space-x-4">
            <ClipboardCheck className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">On Progress</h3>
              <p className="text-medium font-bold">
                {projects.loading ? "..." : `${projects.stats.progress} Projects`}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Status (HANYA 2 STATUS) & Rating Company */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ===== Employee Status (2 status) ===== */}
          <div className="bg-white rounded-lg p-6 border border-gray-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Employee Status
            </h2>

            {employeeData.loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="flex flex-col items-center lg:flex-row gap-6">
                {/* Donut */}
                <div className="relative w-40 h-40">
                  <Pie
                    data={{
                      labels: ["Active Employee", "Inactive Employee"],
                      datasets: [
                        {
                          data: [activeCount, inactiveCount],
                          backgroundColor: [ACTIVE_COLOR, INACTIVE_COLOR],
                          borderWidth: 0,
                          cutout: "80%",
                        },
                      ],
                    }}
                    options={{
                      plugins: { tooltip: { enabled: false }, legend: { display: false } },
                    }}
                  />
                </div>

                {/* Legend (dengan persentase) */}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ACTIVE_COLOR }} />
                    <span>Active Employee ({pctActive}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: INACTIVE_COLOR }} />
                    <span>Inactive Employee ({pctInactive}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== Rating Company (tetap) ===== */}
          <div className="bg-white rounded-lg p-6 border border-gray-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Rating Company
            </h2>

            {reviews.loading ? (
              <div className="p-4 text-center">Loading reviews...</div>
            ) : reviews.error ? (
              <div className="p-4 text-red-500">{reviews.error}</div>
            ) : (
              <div className="flex flex-col items-center lg:flex-row gap-6">
                <div className="relative w-40 h-40">
                  <Pie
                    data={{
                      labels: [],
                      datasets: [
                        {
                          data: [reviews.totalReviews, reviews.totalReviews * 0.1],
                          backgroundColor: ["#3B82F6", "#E5E7EB"],
                          borderWidth: 0,
                          cutout: "80%",
                        },
                      ],
                    }}
                    options={{
                      plugins: { tooltip: { enabled: false }, legend: { display: false } },
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{reviews.averageRating}</span>
                    <span className="text-xs text-gray-500">{reviews.totalReviews} Reviews</span>
                  </div>
                </div>

                <div className="w-full flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.ratings[rating] || 0;
                    const percentage =
                      reviews.totalReviews > 0 ? Math.round((count / reviews.totalReviews) * 100) : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-right text-gray-700">{rating}</span>
                        <span className="w-4 text-yellow-400">★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="w-20 text-right text-gray-600">
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

        {/* Project Status & Top 5 Employees */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Project Progress */}
          <div className="lg:w-3/4 bg-white rounded-lg border border-gray-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-white bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Project Progress</h3>
              <div className="flex items-center">
                <div className="relative mr-3">
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
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    if (projectStatusFilter === "All") navigate("/data-project");
                    else navigate(`/data-project?status=${encodeURIComponent(projectStatusFilter)}`);
                  }}
                >
                  View Detail
                </button>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white border-b border-gray-300">
                  <tr className="text-base md:text-base">
                    <th className="px-6 py-3 text-left font-normal">Project Name</th>
                    <th className="px-6 py-3 text-left font-normal">Client Name</th>
                    <th className="px-6 py-3 text-left font-normal">Deadline</th>
                    <th className="px-6 py-3 text-left font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">Loading projects...</td>
                    </tr>
                  ) : projects.error ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-red-500">{projects.error}</td>
                    </tr>
                  ) : projects.lists.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-gray-500 text-center">No projects found</td>
                    </tr>
                  ) : (
                    projects.lists
                      .filter(project => ALLOWED_STATUSES.includes(project.status))
                      .filter(project => projectStatusFilter === "All" || project.status === projectStatusFilter)
                      .slice(0, 5)
                      .map((project) => {
                        const displayStatus = ALLOWED_STATUSES.includes(project.status) ? project.status : "-";
                        return (
                          <tr key={project._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">{project.title || "-"}</td>
                            <td className="px-6 py-4">
                              {project.client?.nama_lengkap || project.client?.name || "-"}
                            </td>
                            <td className="px-6 py-4">
                              {project.deadline
                                ? new Date(project.deadline).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                                : "-"}
                            </td>
                            <td className="px-6 py-4 capitalize">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${displayStatus === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : displayStatus === "On Progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {displayStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 5 Employees */}
          <div className="lg:w-1/4 bg-white rounded-lg border border-gray-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-white bg-white">
              <h3 className="text-lg font-semibold text-gray-800">Top 5 Employees</h3>
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