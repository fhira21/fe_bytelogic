import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/pp.png';
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
  Users,
  Clock,
  CheckCircle,
  User,
  Users as ClientsIcon,
  List,
  TrendingUp
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
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

const DashboardManager = () => {
  const navigate = useNavigate();
  
  // State for manager profile
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    error: null,
    data: null
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
      "Magang Tidak Aktif": 0
    }
  });

  // State for clients data
  const [clientData, setClientData] = useState({
    loading: true,
    error: null,
    totalClients: 0
  });

  // State for projects
  const [projects, setProjects] = useState({
    loading: true,
    error: null,
    stats: {
      total: 0,
      waiting: 0,
      progress: 0,
      completed: 0
    },
    lists: []
  });

  // State for evaluations
  const [evaluations, setEvaluations] = useState({
    loading: true,
    error: null,
    topEmployees: []
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
      5: 0
    }
  });

  // Fetch manager profile
  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/managers/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setManagerProfile({
          loading: false,
          error: null,
          data: response.data
        });
      } catch (error) {
        console.error('Error fetching manager profile:', error);
        setManagerProfile({
          loading: false,
          error: error.response?.data?.message || 'Failed to load profile',
          data: null
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
        const response = await axios.get('http://localhost:5000/api/karyawan/statuskaryawan', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEmployeeData({
          loading: false,
          error: null,
          totalKaryawan: response.data.totalKaryawan,
          status: response.data.data
        });
      } catch (error) {
        console.error('Error fetching employee status:', error);
        setEmployeeData({
          loading: false,
          error: error.response?.data?.message || 'Failed to load employee data',
          totalKaryawan: 0,
          status: {
            "Karyawan Aktif": 0,
            "Karyawan Tidak Aktif": 0,
            "Magang Aktif": 0,
            "Magang Tidak Aktif": 0
          }
        });
      }
    };

    fetchEmployeeStatus();
  }, []);

  // Fetch clients data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setClientData({
          loading: false,
          error: null,
          totalClients: response.data.totalClients
        });
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClientData({
          loading: false,
          error: error.response?.data?.message || 'Failed to load clients data',
          totalClients: 0
        });
      }
    };

    fetchClients();
  }, []);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/projects/status-summary', {
          headers: { Authorization: `Bearer ${token}` }
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
          lists: data.projects || []
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects({
          loading: false,
          error: error.response?.data?.message || 'Failed to load projects',
          stats: {
            total: 0,
            waiting: 0,
            progress: 0,
            completed: 0
          },
          lists: []
        });
      }
    };

    fetchProjects();
  }, []);

  // Fetch evaluations data
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/evaluations/karyawan/evaluasi-detailed', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Sort and get top 5 employees
        const sorted = response.data.data.sort((a, b) => b.total_final_score - a.total_final_score).slice(0, 5);
        
        setEvaluations({
          loading: false,
          error: null,
          topEmployees: sorted
        });
      } catch (error) {
        console.error('Error fetching evaluations:', error);
        setEvaluations({
          loading: false,
          error: error.response?.data?.message || 'Failed to load evaluations',
          topEmployees: []
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
        const response = await axios.get('http://localhost:5000/api/reviews/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

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
            5: 0
          }
        });
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews({
          loading: false,
          error: error.response?.data?.message || 'Failed to load reviews',
          averageRating: "0.00",
          totalReviews: 0,
          ratings: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        });
      }
    };

    fetchReviews();
  }, []);

  // Component for project lists
  const ProjectList = ({ title, items, loading, error, icon: Icon }) => {
    if (loading) return <div className="p-4 text-center">Loading {title}...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (items.length === 0) return <div className="p-4 text-gray-500">No {title} projects</div>;

    return (
      <div className="divide-y divide-gray-200">
        {items.map((project) => (
          <div key={project._id} className="px-6 py-4">
            <p className="font-medium text-gray-800">{project.title}</p>
            <p className="text-sm text-gray-500">{project.client?.name || project.client?.nama_lengkap || 'No client'}</p>
          </div>
        ))}
      </div>
    );
  };

  // Component for evaluation chart
  const EvaluationChart = () => {
    if (evaluations.loading) return <div className="p-4 text-center">Loading evaluations...</div>;
    if (evaluations.error) return <div className="p-4 text-red-500">{evaluations.error}</div>;
    if (evaluations.topEmployees.length === 0) {
      return <div className="p-4 text-gray-500">No evaluation data available</div>;
    }

    const chartData = {
      labels: evaluations.topEmployees.map(emp => emp.nama_karyawan || emp.nama_lengkap || emp.name),
      datasets: [
        {
          label: 'Performance Score',
          data: evaluations.topEmployees.map(emp => emp.total_final_score),
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
          text: 'Top Performing Employees',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Score'
          }
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  const calculateSDLCProgress = (progress = {}) => {
    const total = Object.values(progress).reduce((acc, val) => acc + val, 0);
    const count = Object.keys(progress).length || 1;
    return Math.round((total / (count * 100)) * 100);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font-semibold mb-6">MENU</h1>
        <button 
          onClick={() => navigate('/dashboard-manager')} 
          className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Home size={18} /> Dashboard
        </button>
        <button 
          onClick={() => navigate('/admin-list')} 
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Folder size={18} /> Admin Data
        </button>
        <button 
          onClick={() => navigate('/employee-list')} 
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Folder size={18} /> Employee Data
        </button>
        <button 
          onClick={() => navigate('/client-data')} 
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Folder size={18} /> Client Data
        </button>
        <button 
          onClick={() => navigate('/data-project')} 
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <Briefcase size={18} /> Project Data
        </button>
        <button 
          onClick={() => navigate('/employee-evaluation')} 
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <ChartBar size={18} /> Evaluation
        </button>
        <button 
          onClick={() => navigate('/customer-reviews')} 
          className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2"
        >
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Topbar */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <img 
              src={managerProfile.data?.profile_pic || ProfilePic} 
              alt="Profile" 
              className="w-10 h-10 rounded-full" 
            />
            <span className="font-medium">
              {managerProfile.data?.name || 'Loading...'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Dashboard Manager</h1>

        {/* Manager Info Section */}
        {managerProfile.data && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-2">Manager Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{managerProfile.data.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{managerProfile.data.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{managerProfile.data.position || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium">
                  {new Date(managerProfile.data.joinDate).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Updated Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Employee Data Card */}
          <div 
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/employee-list')}
          >
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee Data</h3>
              <p className="text-2xl font-bold">
                {employeeData.loading ? '...' : employeeData.totalKaryawan}
              </p>
            </div>
          </div>

          {/* Client Data Card */}
          <div 
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/client-data')}
          >
            <div className="p-3 bg-green-100 rounded-full">
              <ClientsIcon className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client Data</h3>
              <p className="text-2xl font-bold">
                {clientData.loading ? '...' : clientData.totalClients}
              </p>
            </div>
          </div>

          {/* Waiting List Card */}
          <div 
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/data-project?status=waiting')}
          >
            <div className="p-3 bg-purple-100 rounded-full">
              <List className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Waiting List</h3>
              <p className="text-2xl font-bold">
                {projects.loading ? '...' : projects.stats.waiting}
              </p>
            </div>
          </div>

          {/* On Progress Card */}
          <div 
            className="bg-white rounded-lg p-4 shadow flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/data-project?status=progress')}
          >
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="text-yellow-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">On Progress</h3>
              <p className="text-2xl font-bold">
                {projects.loading ? '...' : projects.stats.progress}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Performance and Rating Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Evaluation Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Performance</h2>
            <EvaluationChart />
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rating Company</h2>
            {reviews.loading ? (
              <div className="p-4 text-center">Loading reviews...</div>
            ) : reviews.error ? (
              <div className="p-4 text-red-500">{reviews.error}</div>
            ) : (
              <div>
                <div className="flex items-start gap-8 mb-4">
                  <div>
                    <div className="text-3xl font-bold">{reviews.averageRating}</div>
                    <div className="text-sm text-gray-500">{reviews.totalReviews} Reviews</div>
                  </div>
                  <div className="flex-1">
                    <table className="w-full">
                      <tbody>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <tr key={rating}>
                            <td className="py-1">{rating} ★</td>
                            <td className="py-1 text-right">
                              {reviews.ratings[rating]} ({Math.round((reviews.ratings[rating] / reviews.totalReviews) * 100)}%)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Status Sections */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Project Progress</h3>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Project Name</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Deadline</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Progress</th>
                </tr>
              </thead>
              <tbody>
                {projects.loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">Loading projects...</td>
                  </tr>
                ) : projects.error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-red-500">{projects.error}</td>
                  </tr>
                ) : projects.lists.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-gray-500 text-center">No projects found</td>
                  </tr>
                ) : (
                  projects.lists.map((project) => (
                    <tr key={project._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{project.title || '-'}</td>
                      <td className="px-6 py-4">{project.client?.nama_lengkap || project.client?.name || '-'}</td>
                      <td className="px-6 py-4">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US') : '-'}
                      </td>
                      <td className="px-6 py-4 capitalize">{project.status || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 h-2 rounded">
                          <div 
                            className="bg-blue-500 h-2 rounded" 
                            style={{ width: `${calculateSDLCProgress(project.sdlc_progress)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardManager;