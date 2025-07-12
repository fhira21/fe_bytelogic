import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/profile.jpg';
import { Home, Folder, Briefcase, ChartBar, FileText, ChevronLeft, Search, User } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EmployeeEvaluation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [managerProfile, setManagerProfile] = useState({ data: null, loading: true });

  // State management
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'totalScore',
    direction: 'descending'
  });
  const [viewMode, setViewMode] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch manager profile
  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/manager/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setManagerProfile({ data: response.data, loading: false });
      } catch (error) {
        console.error("Error fetching manager profile:", error);
        setManagerProfile(prev => ({ ...prev, loading: false }));
      }
    };
    fetchManagerProfile();
  }, [token]);

  // Fetch employee evaluation data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const { page, limit } = pagination;
        const response = await axios.get(
          `http://localhost:5000/api/evaluations/karyawan/evaluasi-detailed?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data) {
          throw new Error('Invalid API response structure');
        }

        const responseData = response.data.data || response.data;

        if (Array.isArray(responseData)) {
          const formattedEmployees = responseData.map(emp => ({
            _id: emp.employee_id || emp._id,
            nama_karyawan: emp.nama_karyawan || emp.nama_lengkap || 'Nama tidak tersedia',
            total_project_dinilai: emp.total_projects || 0,
            rata_rata_point_evaluasi: parseFloat(emp.average_final_score) || 0,
            evaluasi_projects: emp.evaluations || []
          }));

          setEmployees(formattedEmployees);
          setPagination(prev => ({
            ...prev,
            total: response.data.total || responseData.length
          }));
        } else {
          throw new Error('Unexpected data format from API');
        }

      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.response?.data?.message || error.message || 'Failed to load evaluation data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token, pagination.page, pagination.limit]);

  // Helper functions
  const calculateAverageScore = (employee) => {
    if (employee.rata_rata_point_evaluasi) {
      return parseFloat(employee.rata_rata_point_evaluasi);
    }
    if (employee.total_final_score && employee.total_evaluations) {
      return employee.total_final_score / employee.total_evaluations;
    }
    return 0;
  };

  const handleViewEmployeeDetail = (employeeId) => {
    const employeeDetail = employees.find(emp => emp._id === employeeId);
    setSelectedEmployee(employeeDetail);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEmployee(null);
    setEvaluationDetails(null);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Memoized calculations
  const filteredEmployees = useMemo(() => {
    return employees
      .map(emp => ({
        id: emp._id,
        name: emp.nama_karyawan,
        projects: emp.total_project_dinilai || 0,
        rating: emp.rata_rata_point_evaluasi ? parseFloat(emp.rata_rata_point_evaluasi) : 0,
        detail: emp.evaluasi_projects || []
      }))
      .filter(emp =>
        emp.name &&
        typeof emp.name === 'string' &&
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(emp => ({
        ...emp,
        totalScore: (emp.rating * emp.projects).toFixed(2)
      }));
  }, [employees, searchTerm]);

  const sortedEmployees = useMemo(() => {
    let sortableItems = [...filteredEmployees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredEmployees, sortConfig]);

  // Prepare chart data from evaluation details
  const prepareChartData = () => {
    if (!evaluationDetails) return { barData: null, pieData: null };

    // Bar chart data - Project performance by category
    const projectCategories = evaluationDetails.project_categories || [];
    const barData = {
      labels: projectCategories.map(cat => cat.category_name),
      datasets: [
        {
          label: 'Average Score',
          data: projectCategories.map(cat => cat.average_score),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };

    // Pie chart data - Score distribution
    const scoreDistribution = evaluationDetails.score_distribution || [];
    const pieData = {
      labels: scoreDistribution.map(item => `Score ${item.score_range}`),
      datasets: [
        {
          data: scoreDistribution.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    return { barData, pieData };
  };

  const { barData, pieData } = prepareChartData();

  // Detail View Component - Updated to match the image
  const DetailView = ({ employee, onBack, evaluationDetails, loading }) => {
    // Prepare chart data
    const chartData = {
      labels: evaluationDetails?.project_categories?.map(cat => cat.category_name) || [],
      datasets: [
        {
          label: 'Average Score',
          data: evaluationDetails?.project_categories?.map(cat => cat.average_score) || [],
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 10,
            callback: (value) => value,
          },
          title: {
            display: true,
            text: 'Nilai Final',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Kategori Proyek',
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
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
        >
          <ChevronLeft size={18} className="mr-1" />
          Kembali ke Daftar Evaluasi
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Evaluasi Karyawan</h2>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <i className="fas fa-spinner fa-spin mr-2"></i> Memuat detail evaluasi...
          </div>
        ) : (
          <>
            {/* Chart Section */}
            <div className="bg-white border rounded-lg p-4 shadow mb-6">
              <h3 className="text-xl font-medium mb-4">Grafik Evaluasi per Kategori</h3>
              <div className="h-72 w-full">
                {evaluationDetails?.project_categories?.length > 0 ? (
                  <Bar
                    data={chartData}
                    options={chartOptions}
                  />
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada data kategori proyek yang tersedia.</p>
                )}
              </div>
            </div>

            {/* Project List */}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 bg-blue-500 p-2 md:p-6 flex flex-col text-white select-none transition-all duration-300">
        <div className="hidden md:flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="hidden md:block text-xs font mb-6">MENU</h1>
        <button onClick={() => navigate('/dashboard-manager')}
          className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Home size={18} />
          <span className="hidden md:inline">Dashboard</span>
        </button>
        <button onClick={() => navigate('/admin-list')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Admin Data</span>
        </button>
        <button onClick={() => navigate('/employee-list')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Employee Data</span>
        </button>
        <button onClick={() => navigate('/client-data')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-blue-600 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Client Data</span>
        </button>
        <button onClick={() => navigate('/data-project')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-blue-600 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Project Data</span>
        </button>
        <button onClick={() => navigate('/employee-evaluation')} className="flex items-center justify-center md:justify-start gap-2 bg-blue-600 p-2 rounded mb-2">
          <ChartBar size={18} />
          <span className="hidden md:inline">Evaluation</span>
        </button>
        <button onClick={() => navigate('/customer-reviews')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <FileText size={18} />
          <span className="hidden md:inline">Review</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Topbar*/}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <img
                src={managerProfile.data?.foto_profile || ProfilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="hidden md:block">
                <p className="font-medium text-sm">
                  {managerProfile.loading ? 'Loading...' :
                    managerProfile.data?.nama_lengkap ||
                    'Asep Jamaludin Wahid'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {managerProfile.data?.email || 'jamaludinasep@gmail.com'}
                </p>
              </div>
            </div>

            {/* Dropdown menu */}
            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                {/* Header dropdown */}
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-800">{managerProfile.data?.nama_lengkap || 'Asep Jamaludin Wahid'}</p>
                  <p className="text-sm text-gray-500 truncate">{managerProfile.data?.email || 'jamaludinasep@gmail.com'}</p>
                </div>

                {/* Menu items */}
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Evaluation</h1>

        {/* Search Section */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center p-4">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading employee data...
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center p-4 text-red-500">
                <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
            )}

            {/* Employee Evaluation Table */}
            {!loading && !error && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Ranking</th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('name')}
                      >
                        Employee Name
                        {sortConfig.key === 'name' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('projects')}
                      >
                        Total Project
                        {sortConfig.key === 'projects' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('totalScore')}
                      >
                        Total Point
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEmployees.length > 0 ? (
                      sortedEmployees.map((emp, index) => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {emp.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.projects} Project
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.totalScore} Point
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewEmployeeDetail(emp.id)}
                                className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <span className="text-sm">View Detail</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          {employees.length === 0
                            ? 'No employee evaluation data available'
                            : 'No employees match your search'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <DetailView
            employee={selectedEmployee}
            onBack={handleBackToList}
            evaluationDetails={evaluationDetails}
            loading={detailLoading}
          />
        )}
      </main>
    </div>
  );
};

export default EmployeeEvaluation;