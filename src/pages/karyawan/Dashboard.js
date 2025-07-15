import React, { useEffect, useState } from "react";
import axios from "axios";
import TopbarProfile from '../../components/TopbarProfile';
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
          "http://localhost:5000/api/karyawan/profile",
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
          error:
            error.response?.data?.message || "Gagal memuat status karyawan",
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
          "http://localhost:5000/api/projects/total-project",
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
          "http://localhost:5000/api/evaluations/evaluationmykaryawan",
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



  const EvaluasiChart = ({ data, loading, error, filter }) => {
    if (loading) return <p>Memuat data evaluasi...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data.length) return <p className="text-gray-500">Tidak ada data evaluasi</p>;

    // Sort berdasarkan filter
    const sortedData = [...data];
    switch (filter) {
      case "tertinggi":
        sortedData.sort((a, b) => b.score - a.score);
        break;
      case "terendah":
        sortedData.sort((a, b) => a.score - b.score);
        break;
      case "terbaru":
        // Misal project memiliki tanggal, urutkan descending berdasarkan tanggal evaluasi jika tersedia
        // Jika tidak ada tanggal, abaikan ini
        break;
      case "terlama":
        break;
      default:
        break;
    }

    const chartData = {
      labels: sortedData.map((item) => item.project || "Tanpa Judul"),
      datasets: [
        {
          label: "Nilai Evaluasi",
          data: sortedData.map((item) => Math.round(item.score)),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 10,
          },
          title: {
            display: true,
            text: "Nilai Final",
          },
        },
        x: {
          title: {
            display: true,
            text: "Nama Proyek",
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Nilai: ${context.raw}`,
          },
        },
      },
    };

    return (
      <div className="h-64 w-full">
        <Bar data={chartData} options={options} />
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard {user.name}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">Total Project</h3>
            <p className="text-medium font-bold">{projects.stats.total}</p>
          </div>
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">On Progress</h3>
            <p className="text-medium font-bold">{projects.stats.progress}</p>
          </div>
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">Waiting List</h3>
            <p className="text-medium font-bold">{projects.stats.waiting}</p>
          </div>
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">Status Karyawan</h3>
            <p className="text-medium font-bold">{statusKaryawan.data}</p>
          </div>
        </div>

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
          />
        </div>

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
