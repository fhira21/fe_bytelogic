import React, { useEffect, useState } from "react";
import { FiBell, FiChevronDown, FiEdit, FiCheck, FiClock, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

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
  // State untuk user dan status karyawan
  const [user] = useState({
    name: "Loading...",
    email: "Loading...",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  // State untuk status karyawan
  const [statusKaryawan, setStatusKaryawan] = useState({
    loading: true,
    error: null,
    data: null
  });

  // State untuk project
  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    stats: {
      total: 0,
      waiting: 0,
      progress: 0,
      completed: 0
    },
    lists: {
      waiting: [],
      progress: [],
      completed: []
    }
  });

  // State untuk evaluasi
  const [evaluations, setEvaluations] = useState({
    loading: true,
    error: null,
    data: {
      nama_karyawan: "",
      jumlah_proyek_dinilai: 0,
      rata_rata_nilai: 0,
      detail_evaluasi: []
    }
  });

  // Fetch data status karyawan
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/karyawan/profile", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        });
        
        setStatusKaryawan({
          loading: false,
          error: null,
          data: response.data.data.statusKaryawan
        });
      } catch (error) {
        console.error("Error fetching employee status:", error);
        setStatusKaryawan({
          loading: false,
          error: error.response?.data?.message || "Gagal memuat status karyawan",
          data: null
        });
      }
    };

    fetchStatus();
  }, []);

  // Fetch data project
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects/total-project", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        });

        const data = response.data.data;
        
        setProjects({
          loading: false,
          error: null,
          stats: {
            total: data.totalProjects || 0,
            waiting: data.statusSummary?.count?.["Waiting List"] || 0,
            progress: data.statusSummary?.count?.["On Progress"] || 0,
            completed: data.statusSummary?.count?.["Completed"] || 0
          },
          lists: {
            waiting: data.statusSummary?.detail?.["Waiting List"] || [],
            progress: data.statusSummary?.detail?.["On Progress"] || [],
            completed: data.statusSummary?.detail?.["Completed"] || []
          }
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
            completed: 0
          },
          lists: {
            waiting: [],
            progress: [],
            completed: []
          }
        });
      }
    };

    fetchProjects();
  }, []);

  // Fetch data evaluasi
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/evaluations/evaluationmykaryawan", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        });

        setEvaluations({
          loading: false,
          error: null,
          data: response.data.data || {
            nama_karyawan: "",
            jumlah_proyek_dinilai: 0,
            rata_rata_nilai: 0,
            detail_evaluasi: []
          }
        });
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        setEvaluations({
          loading: false,
          error: error.response?.data?.message || "Gagal memuat data evaluasi",
          data: {
            nama_karyawan: "",
            jumlah_proyek_dinilai: 0,
            rata_rata_nilai: 0,
            detail_evaluasi: []
          }
        });
      }
    };

    fetchEvaluations();
  }, []);

  // Fungsi untuk memotong teks
  const truncateText = (text, maxLength = 10) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Komponen untuk menampilkan daftar project (hanya title)
  const ProjectList = ({ title, items, loading, error, showActions = false }) => {
    if (loading) return <div className="p-4 text-center">Memuat {title}...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (items.length === 0) return <div className="p-4 text-gray-500">Tidak ada {title}</div>;

    return (
      <div className="divide-y divide-gray-200">
        {items.map((project) => (
          <div key={project._id} className="px-6 py-4 flex justify-between items-center">
            <p className="font-medium text-gray-800 truncate" title={project.title}>
              {project.title}
            </p>
            {showActions && (
              <div className="flex space-x-2">
                <button className="p-1 text-yellow-600 hover:text-yellow-800" title="Update Progress">
                  <FiEdit size={16} />
                </button>
                <button className="p-1 text-green-600 hover:text-green-800" title="Mark as Completed">
                  <FiCheck size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Komponen untuk menampilkan chart evaluasi
  const EvaluasiChart = () => {
    if (evaluations.loading) return <div className="p-4 text-center">Memuat evaluasi...</div>;
    if (evaluations.error) return <div className="p-4 text-red-500">{evaluations.error}</div>;
    if (!evaluations.data.detail_evaluasi || evaluations.data.detail_evaluasi.length === 0) {
      return <div className="p-4 text-gray-500">Belum ada evaluasi</div>;
    }

    // Siapkan data untuk chart
    const chartData = {
      labels: evaluations.data.detail_evaluasi.map(e => truncateText(e.project_title)),
      datasets: [
        {
          label: 'Nilai Evaluasi',
          data: evaluations.data.detail_evaluasi.map(e => Math.round(e.final_score)),
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Hasil Evaluasi Proyek',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const project = evaluations.data.detail_evaluasi[index];
              return [
                `Project: ${project.project_title}`,
                `Nilai: ${Math.round(project.final_score)}`,
                `Client: ${project.client_name}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1000,
          title: {
            display: true,
            text: 'Nilai'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Nama Proyek'
          }
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Evaluasi</h2>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Rata-rata Nilai: <span className="font-bold">{Math.round(evaluations.data.rata_rata_nilai)}</span></p>
          <p>Total Proyek Dinilai: <span className="font-bold">{evaluations.data.jumlah_proyek_dinilai}</span></p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="/company-logo.png" alt="Company Logo" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
                <FiBell size={20} />
              </button>
              <div className="flex items-center">
                <img className="h-8 w-8 rounded-full" src={user.avatar} alt="User avatar" />
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <button className="ml-2 text-gray-500">
                  <FiChevronDown size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard {user.name}</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Project */}
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">Total Project</h3>
            <p className="text-2xl font-bold">{projects.stats.total}</p>
          </div>

          {/* On Progress */}
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">On Progress</h3>
            <p className="text-2xl font-bold">{projects.stats.progress}</p>
          </div>

          {/* Waiting List */}
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">Waiting List</h3>
            <p className="text-2xl font-bold">{projects.stats.waiting}</p>
          </div>

          {/* Status Karyawan */}
          <div className="bg-white text-black rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium">Status Karyawan</h3>
            {statusKaryawan.loading ? (
              <p className="text-2xl font-bold">Loading...</p>
            ) : statusKaryawan.error ? (
              <p className="text-red-500 text-sm">{statusKaryawan.error}</p>
            ) : (
              <p className="text-2xl font-bold">{statusKaryawan.data}</p>
            )}
          </div>
        </div>

        {/* Evaluasi Section */}
        <EvaluasiChart />

        {/* Project Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiting List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <FiClock className="mr-2 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Waiting List ({projects.stats.waiting})
              </h3>
            </div>
            <ProjectList 
              title="waiting list"
              items={projects.lists.waiting}
              loading={projects.loading}
              error={projects.error}
            />
          </div>

          {/* On Progress */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <FiClock className="mr-2 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                On Progress ({projects.stats.progress})
              </h3>
            </div>
            <ProjectList 
              title="on progress"
              items={projects.lists.progress}
              loading={projects.loading}
              error={projects.error}
              showActions={true}
            />
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <FiCheckCircle className="mr-2 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Completed ({projects.stats.completed})
              </h3>
            </div>
            <ProjectList 
              title="completed"
              items={projects.lists.completed}
              loading={projects.loading}
              error={projects.error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardKaryawan;