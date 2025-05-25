import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/pp.png';
import { LayoutDashboard, FolderOpen, Briefcase, ChartLine, MessageSquare, Users } from 'lucide-react';
// import '../../style/manager/Dashboard.css';

const DashboardManager = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoCounts, setInfoCounts] = useState({
    totalEmployees: 0,
    totalClients: 0,
    waitingListProjects: 0,
    onProgressProjects: 0,
  });

  const [stats, setStats] = useState({
    employees: 0,
    clients: 0,
    waitingProjects: 0,
    progressProjects: 0,
  });

  const [topEmployees, setTopEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [rating, setRating] = useState({ score: 0, total: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const [managerData, setManagerData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const [
          empRes,
          clientRes,
          waitRes,
          progRes,
          topEmpRes,
          projectRes,
          ratingRes,
          managerRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/karyawan', {
            headers: { Authorization: `Bearer ${token}` }
          }), 
          axios.get('http://localhost:5000/api/clients/count', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/projects/waiting/count', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/projects/onprogress/count', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/karyawan/top-employees', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/projects', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/company/rating', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/managers/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats({
          employees: empRes.data.length,
          clients: clientRes.data.count,
          waitingProjects: waitRes.data.count,
          progressProjects: progRes.data.count,
        });

        setTopEmployees(topEmpRes.data);
        setProjects(projectRes.data);
        setRating(ratingRes.data);
        setManagerData(managerRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateSDLCProgress = (progress = {}) => {
    const total = Object.values(progress).reduce((acc, val) => acc + val, 0);
    const count = Object.keys(progress).length || 1;
    return Math.round((total / (count * 100)) * 100);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-700 rounded-full font-semibold text-sm flex items-center justify-center">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font-semibold mb-6">MENU</h1>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/dashboard-manager')} className="flex items-center gap-2 p-2 rounded-md bg-white/20">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => navigate('/admin-list')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Users size={18} /> Admin Data
          </button>
          <button onClick={() => navigate('/employee-list')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Users size={18} /> Employee Data
          </button>
          <button onClick={() => navigate('/client-data')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Users size={18} /> Client Data
          </button>
          <button onClick={() => navigate('/data-project')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Briefcase size={18} /> Project Data
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <ChartLine size={18} /> Employee Evaluation
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <MessageSquare size={18} /> Client Reviews
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Topbar */}
        <div className="flex justify-end items-center mb-8 gap-6 relative">
          <div className="relative">
            <input type="text" placeholder="Search" className="bg-gray-100 rounded-md pl-10 pr-4 py-2 text-sm text-gray-500 outline-none w-48" />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={ProfilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm text-gray-700">
              {managerData ? managerData.name : 'Loading...'}
            </span>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow w-40 z-10">
                <button
                  onClick={() => navigate('/user-profile')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate('/login');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

        {/* Manager Info Section */}
        {managerData && (
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <h3 className="text-lg font-semibold mb-2">Manager Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{managerData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{managerData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{managerData.position || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium">
                  {new Date(managerData.joinDate).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {error ? (
          <p className="text-red-500 mb-6">Error: {error}</p>
        ) : (
          <div className="flex gap-4 flex-wrap mb-10">
            {[
              { icon: 'fas fa-user', label: 'Employees', value: `${stats.employees} Employees` },
              { icon: 'fas fa-users', label: 'Clients', value: `${stats.clients} Clients` },
              { icon: 'fas fa-list-alt', label: 'Waiting List', value: `${stats.waitingProjects} Projects` },
              { icon: 'fas fa-tasks', label: 'In Progress', value: `${stats.progressProjects} Projects` },
            ].map((card, index) => (
              <div key={index} className="bg-white p-4 rounded-md shadow flex items-center gap-4 min-w-[12rem] flex-1">
                <i className={`${card.icon} text-black-500 text-lg`}></i>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <h3 className="text-base font-semibold">{card.value}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-2">Employee Status</h3>
            <div className="h-40 flex items-center justify-center text-gray-400">[Pie Chart Placeholder]</div>
          </div>
          <div className="bg-white p-6 rounded-md shadow text-center">
            <h3 className="text-lg font-semibold mb-2">Company Rating</h3>
            <div className="text-3xl font-bold text-yellow-500">{rating.score.toFixed(2)}</div>
            <p className="text-gray-500 text-sm mt-1">{rating.total} Reviews</p>
          </div>
        </div>

        {/* Project Progress & Top Employees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Project Progress</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : projects.length === 0 ? (
              <p>No projects found.</p>
            ) : (
              <div className="overflow-auto bg-white rounded-md shadow">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Project Name</th>
                      <th className="px-4 py-2 text-left">Client</th>
                      <th className="px-4 py-2 text-left">Deadline</th>
                      <th className="px-4 py-2 text-left">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{project.title || '-'}</td>
                        <td className="px-4 py-2">{project.client?.nama_lengkap || project.client?.name || '-'}</td>
                        <td className="px-4 py-2">{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US') : '-'}</td>
                        <td className="px-4 py-2">
                          <div className="w-full bg-gray-200 h-2 rounded">
                            <div 
                              className="bg-blue-500 h-2 rounded" 
                              style={{ width: `${calculateSDLCProgress(project.sdlc_progress)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Top 5 Employees</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : topEmployees.length === 0 ? (
              <p>No employee data available</p>
            ) : (
              <div className="overflow-auto bg-white rounded-md shadow">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Ranking</th>
                      <th className="px-4 py-2 text-left">Employee Name</th>
                      <th className="px-4 py-2 text-left">Total Projects</th>
                      <th className="px-4 py-2 text-left">Total Points</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEmployees.slice(0, 5).map((emp, idx) => (
                      <tr key={emp._id || idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{idx + 1}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={emp.profile_pic || ProfilePic} 
                              alt={emp.nama_lengkap || emp.name} 
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            {emp.nama_lengkap || emp.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-4 py-2">{emp.total_projects || emp.projects_count || 0}</td>
                        <td className="px-4 py-2 font-semibold text-blue-600">
                          {emp.total_point || emp.point || 0}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => navigate(`/employee-detail/${emp._id || emp.id}`)}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardManager;