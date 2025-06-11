import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/profile.jpg';
import { Home, Folder, Briefcase, ChartBar, FileText, ChevronLeft } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
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

  // Fetch data with pagination
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

        if (Array.isArray(response.data.data)) {
          const employeesData = response.data.data;
          const formattedEmployees = employeesData.map(emp => ({
            _id: emp.employee_id || emp._id,
            nama_karyawan: emp.nama_karyawan || emp.nama_lengkap,
            total_project_dinilai: emp.total_projects || emp.total_project_dinilai || 0,
            rata_rata_point_evaluasi: calculateAverageScore(emp),
            evaluasi_projects: emp.evaluations || emp.evaluasi_projects || []
          }));
          
          setEmployees(formattedEmployees);
          setPagination(prev => ({
            ...prev,
            total: response.data.total || employeesData.length
          }));
        } 
        else if (Array.isArray(response.data)) {
          const formattedEmployees = response.data.map(emp => ({
            _id: emp.employee_id || emp._id,
            nama_karyawan: emp.nama_karyawan || emp.nama_lengkap,
            total_project_dinilai: emp.total_projects || emp.total_project_dinilai || 0,
            rata_rata_point_evaluasi: calculateAverageScore(emp),
            evaluasi_projects: emp.evaluations || emp.evaluasi_projects || []
          }));
          
          setEmployees(formattedEmployees);
          setPagination(prev => ({
            ...prev,
            total: response.data.length
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

  const handleViewEmployeeDetail = async (employeeId) => {
    try {
      setDetailLoading(true);
      const employeeDetail = employees.find(emp => emp._id === employeeId);
      
      // Fetch detailed evaluation data
      const response = await axios.get(
        `http://localhost:5000/api/evaluations/karyawan/${employeeId}/detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedEmployee(employeeDetail);
      setEvaluationDetails(response.data);
      setViewMode('detail');
    } catch (error) {
      console.error("Error fetching evaluation details:", error);
      setError(error.response?.data?.message || 'Failed to load evaluation details');
    } finally {
      setDetailLoading(false);
    }
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

  // Detail View Component
  const DetailView = ({ employee, onBack, evaluationDetails, loading }) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
        >
          <ChevronLeft size={18} className="mr-1" />
          Back to Evaluation
        </button>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <i className="fas fa-spinner fa-spin mr-2"></i> Loading evaluation details...
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Detail Evaluation</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ranking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.projects} Project</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.totalScore} Point</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {barData && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Project Performance by Category</h3>
                  <div className="h-64">
                    <Bar 
                      data={barData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {pieData && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Score Distribution</h3>
                  <div className="h-64">
                    <Pie 
                      data={pieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Project Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {evaluationDetails?.project_categories?.map((category, index) => (
                  <div key={index} className="border rounded p-3 hover:bg-gray-50">
                    <p className="text-sm font-medium">{category.category_name}</p>
                    <p className="text-xs text-gray-500">Projects: {category.project_count}</p>
                    <p className="text-xs text-gray-500">Avg Score: {category.average_score.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Evaluation Metrics</h3>
              <div className="space-y-2">
                {evaluationDetails?.evaluation_metrics?.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-sm">{metric.metric_name}</span>
                    </div>
                    <span className="text-sm font-medium">{metric.average_score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font mb-6">MENU</h1>
        <button 
          onClick={() => navigate('/dashboard-manager')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Home size={18} /> Dashboard
        </button>
        <button 
          onClick={() => navigate('/admin-list')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Admin Data
        </button>
        <button 
          onClick={() => navigate('/employee-list')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Employee Data
        </button>
        <button 
          onClick={() => navigate('/client-data')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Client Data
        </button>
        <button 
          onClick={() => navigate('/data-project')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Briefcase size={18} /> Project Data
        </button>
        <button 
          onClick={() => navigate('/employee-evaluation')} 
          className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <ChartBar size={18} /> Evaluation
        </button>
        <button 
          onClick={() => navigate('/customer-reviews')} 
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Topbar with Search and Profile */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div className="flex items-center gap-2">
              <img src={ProfilePic} alt="Profile" className="w-10 h-10 rounded-full" />
              <span className="font-medium">Manager</span>
            </div>
          </div>

          {viewMode === 'list' ? (
            <>
              {/* Title */}
              <h1 className="text-2xl font-bold mb-6">Employee Evaluation</h1>

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
                  <table className="min-w-full divide-y divide-black-">  
                    <thead className="bg-white-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 normal-case tracking-wider">
                          Ranking
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort('name')}
                        >
                          <div className="py-3 text-left text-xs font-medium text-gray-500 normal-case tracking-wider">
                            Employee Name
                            {sortConfig.key === 'name' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 normal-case tracking-wider"
                          onClick={() => requestSort('projects')}
                        >
                          <div className="flex items-center">
                            Total Projects
                            {sortConfig.key === 'projects' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 normal-case tracking-wider"
                          onClick={() => requestSort('totalScore')}
                        >
                          <div className="flex items-center">
                            Total Point
                            {sortConfig.key === 'totalScore' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 normal-case tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
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
                              {emp.projects}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {emp.totalScore}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewEmployeeDetail(emp.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <i className="fas fa-eye mr-1"></i> View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            {employees.length === 0
                              ? 'No employee evaluation data available'
                              : 'No employees match your search'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {sortedEmployees.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                    </div>
                  )}
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
        </div>
      </main>
    </div>
  );
};

export default EmployeeEvaluation;