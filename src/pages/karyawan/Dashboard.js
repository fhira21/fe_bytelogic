import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, ClipboardCheck, Clock, UserCheck } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Header from "../../components/Header";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardKaryawan = () => {
  const [user] = useState({
    name: "Loading...",
    email: "Loading...",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  const [statusKaryawan, setStatusKaryawan] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fungsi untuk menangani klik pada bar chart
  const handleBarClick = async (projectName) => {
    if (!projectName) {
      console.error("Nama proyek tidak valid");
      return;
    }

    try {
      const response = await axios.get(
        `http://be.bytelogic.orenjus.com/api/evaluations/detail-by-project?title=${encodeURIComponent(projectName)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        setSelectedProjectDetail(response.data.data);
        setShowDetailModal(true);
      } else {
        console.error("Data detail proyek tidak ditemukan");
      }
    } catch (err) {
      console.error("Gagal mengambil detail proyek:", err);
    }
  };

  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    stats: {
      total: 0,
      waiting: 0,
      progress: 0,
      completed: 0,
    },
    lists: {
      waiting: [],
      progress: [],
      completed: [],
    },
  });

  const [evaluasiData, setEvaluasiData] = useState({
    loading: true,
    error: null,
    data: [],
  });
  const [evaluasiFilter, setEvaluasiFilter] = useState("terbaru");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/karyawan/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        setStatusKaryawan({
          loading: false,
          error: null,
          data: response.data.data.karyawan.status_Karyawan,
        });
      } catch (error) {
        console.error("Error fetching employee status:", error);
        setStatusKaryawan({
          loading: false,
          error: error.response?.data?.message || "Gagal memuat status karyawan",
          data: null,
        });
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/projects/total-project",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data.data;

        setProjects({
          loading: false,
          error: null,
          stats: {
            total: data.totalProjects || 0,
            waiting: data.statusSummary?.count?.["Waiting List"] || 0,
            progress: data.statusSummary?.count?.["On Progress"] || 0,
            completed: data.statusSummary?.count?.["Completed"] || 0,
          },
          lists: {
            waiting: data.statusSummary?.detail?.["Waiting List"] || [],
            progress: data.statusSummary?.detail?.["On Progress"] || [],
            completed: data.statusSummary?.detail?.["Completed"] || [],
          },
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects({
          loading: false,
          error: error.response?.data?.message || "Gagal memuat data proyek",
          stats: {
            total: 0,
            waiting: 0,
            progress: 0,
            completed: 0,
          },
          lists: {
            waiting: [],
            progress: [],
            completed: [],
          },
        });
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchEvaluasi = async () => {
      try {
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/evaluations/evaluationmykaryawan",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const hasil = response.data.detail_evaluasi.map((item) => ({
          project: item.project_title,
          score: item.final_score,
          date: item.created_at // Add date for sorting
        }));

        setEvaluasiData({
          loading: false,
          error: null,
          data: hasil,
        });
      } catch (error) {
        console.error("Gagal ambil data evaluasi:", error);
        setEvaluasiData({
          loading: false,
          error: error.response?.data?.message || "Terjadi kesalahan",
          data: [],
        });
      }
    };

    fetchEvaluasi();
  }, []);

  const ProjectList = ({ title, items, loading, error }) => {
    if (loading) return <div className="p-4 text-center">Memuat {title}...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (items.length === 0)
      return <div className="p-4 text-gray-500">Tidak ada {title}</div>;

    return (
      <div className="divide-y divide-gray-200">
        {items.map((project) => {
          const formattedDate = new Date(project.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          return (
            <div
              key={project._id}
              className="px-6 py-4 flex justify-between items-center"
            >
              <span className="text-gray-800 truncate" title={project.title}>
                {project.title}
              </span>
              <span className="text-sm text-gray-600">{formattedDate}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const EvaluasiChart = ({ data, loading, error, filter, onBarClick }) => {
    if (loading) return <p>Memuat data evaluasi...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data.length) return <p className="text-gray-500">Tidak ada data evaluasi</p>;

    // Sort data berdasarkan filter
    const sortedData = [...data].sort((a, b) => {
      switch (filter) {
        case "tertinggi": return b.score - a.score;
        case "terendah": return a.score - b.score;
        case "terbaru": return new Date(b.date) - new Date(a.date);
        case "terlama": return new Date(a.date) - new Date(b.date);
        default: return 0;
      }
    });

    const chartData = {
      labels: sortedData.map((item) => item.project || "Proyek Tanpa Nama"),
      datasets: [{
        label: "Nilai Evaluasi",
        data: sortedData.map((item) => Math.round(item.score)),
        backgroundColor: "#2196F3",
        borderRadius: 6,
        barThickness: 30,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements && elements.length > 0) {
          const clickedIndex = elements[0].index;
          const projectName = chartData.labels[clickedIndex];
          if (projectName && typeof onBarClick === 'function') {
            onBarClick(projectName);
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          title: { display: true, text: "Nilai Final" }
        },
        x: {
          ticks: {
            callback: function (val, index) {
              const label = this.getLabelForValue(index);
              return label.length > 10 ? `${label.substring(0, 10)}...` : label;
            }
          },
          title: { display: true, text: "Nama Proyek" }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Nilai: ${context.raw}`,
            title: (context) => `${context[0].label}`
          }
        }
      }
    };

    return (
      <div className="h-64 w-full">
        <Bar
          data={chartData}
          options={options}
          getElementAtEvent={(elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const projectName = chartData.labels[index];
              onBarClick(projectName);
            }
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          My Work Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Project */}
          <div className="bg-white text-black rounded-lg p-4 shadow flex items-center space-x-4">
            <ClipboardList className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">Total Project</h3>
              <p className="text-medium font-bold">{projects.stats.total} Projects </p>
            </div>
          </div>

          {/* On Progress */}
          <div className="bg-white text-black rounded-lg p-4 shadow flex items-center space-x-4">
            <ClipboardCheck className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">On Progress</h3>
              <p className="text-medium font-bold">{projects.stats.progress} Projects</p>
            </div>
          </div>

          {/* Waiting List */}
          <div className="bg-white text-black rounded-lg p-4 shadow flex items-center space-x-4">
            <Clock className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">Waiting List</h3>
              <p className="text-medium font-bold">{projects.stats.waiting} Projects</p>
            </div>
          </div>

          {/* Status Karyawan */}
          <div className="bg-white text-black rounded-lg p-4 shadow flex items-center space-x-4">
            <UserCheck className="w-8 h-8 text-gray-700" />
            <div>
              <h3 className="text-sm font-medium">Status Karyawan</h3>
              <p className="text-medium font-bold">{statusKaryawan.data} </p>
            </div>
          </div>
        </div>

        {/* Bagian Evaluasi Chart */}
        <div className="bg-white text-black rounded-lg p-4 shadow col-span-2 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Evaluasi Bar</h3>
            <div className="flex items-center space-x-2">
              <select
                value={evaluasiFilter}
                onChange={(e) => setEvaluasiFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="tertinggi">Tertinggi</option>
                <option value="terendah">Terendah</option>
              </select>
              <Link
                to="/detail-evaluasi"
                className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-100"
              >
                Lihat Semua
              </Link>
            </div>
          </div>
          <EvaluasiChart
            data={evaluasiData.data}
            loading={evaluasiData.loading}
            error={evaluasiData.error}
            filter={evaluasiFilter}
            onBarClick={handleBarClick}
          />
        </div>

        {/* Modal untuk menampilkan detail proyek */}
        {showDetailModal && selectedProjectDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Detail Evaluasi Proyek</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-3">
                <p><span className="font-semibold">Nama Proyek:</span> {selectedProjectDetail.title || '-'}</p>
                <p><span className="font-semibold">Nilai:</span> {selectedProjectDetail.final_score || '-'}</p>
                <p><span className="font-semibold">Tanggal:</span> {new Date(selectedProjectDetail.created_at).toLocaleDateString('id-ID') || '-'}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiting List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Status Project : Waiting List
              </h3>
              <Link
                to="/detail-project"
                className="text-sm text-gray-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="px-6">
              <div className="flex justify-between px-6 py-2 border-b border-gray-200 text-sm text-gray-600 font-semibold mb-2">
                <span>Nama Project</span>
                <span>Tanggal</span>
              </div>
              <ProjectList
                title="waiting list"
                items={projects.lists.waiting}
                loading={projects.loading}
                error={projects.error}
              />
            </div>
          </div>

          {/* On Progress */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Status Project : On Progress
              </h3>
              <Link
                to="/project-onprogress"
                className="text-sm text-gray-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="px-6">
              <div className="flex justify-between px-6 py-2 border-b border-gray-200 text-sm text-gray-600 font-semibold mb-2">
                <span>Nama Project</span>
                <span>Tanggal</span>
              </div>
              <ProjectList
                title="on progress"
                items={projects.lists.progress}
                loading={projects.loading}
                error={projects.error}
                showActions={true}
              />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Status Project : Completed
              </h3>
              <Link
                to="/project-completed"
                className="text-sm text-gray-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
              >
                Lihat Semua
              </Link>

            </div>
            <div className="px-6">
              <div className="flex justify-between px-6 py-2 border-b border-gray-200 text-sm text-gray-600 font-semibold mb-2">
                <span>Nama Project</span>
                <span>Tanggal</span>
              </div>
              <ProjectList
                title="completed"
                items={projects.lists.completed}
                loading={projects.loading}
                error={projects.error}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardKaryawan;