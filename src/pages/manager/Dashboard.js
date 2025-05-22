import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/pp.png';
import { LayoutDashboard, FolderOpen, Briefcase, ChartLine, MessageSquare, Users } from 'lucide-react';

const DashboardManager = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          empRes,
          clientRes,
          waitRes,
          progRes,
          topEmpRes,
          projectRes,
          ratingRes,
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/Karyawan`), 
          axios.get(`http://localhost:5000/api/clients/count`),
          axios.get(`http://localhost:5000/api/projects/waiting/count`),
          axios.get(`http://localhost:5000/api/projects/onprogress/count`),
          axios.get(`http://localhost:5000/api/karyawan`),
          axios.get(`http://localhost:5000/api/projects/{projectId}/progress`),
          axios.get(`http://localhost:5000/api/company/rating`),
        ]);

        setStats({
          employees: empRes.data.data.length,
          clients: clientRes.data.count,
          waitingProjects: waitRes.data.count,
          progressProjects: progRes.data.count,
        });

        setTopEmployees(topEmpRes.data);
        setProjects(projectRes.data);
        setRating(ratingRes.data);
      } catch (error) {
        console.error('Gagal memuat data:', error);
      }
    };

    fetchData();
  }, []);

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
            <Users size={18} /> Data Admin
          </button>
          <button onClick={() => navigate('/employee-list')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Users size={18} /> Data Karyawan
          </button>
          <button onClick={() => navigate('/client-data')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Users size={18} /> Data Klien
          </button>
          <button onClick={() => navigate('/data-project')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <Briefcase size={18} /> Data Project
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <ChartLine size={18} /> Evaluasi Karyawan
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20">
            <MessageSquare size={18} /> Review Pelanggan
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
            <span className="text-sm text-gray-700">Deni el mares</span>

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
                    // Logout logic here
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

        {/* Info Cards */}
        <div className="flex gap-4 flex-wrap mb-10">
          {[
            { icon: 'fas fa-user', label: 'Employee Data', value: `${stats.employees} Karyawan` },
            { icon: 'fas fa-users', label: 'Clients Data', value: `${stats.clients} Pelanggan` },
            { icon: 'fas fa-list-alt', label: 'Waiting List', value: `${stats.waitingProjects} Project` },
            { icon: 'fas fa-tasks', label: 'On Progress', value: `${stats.progressProjects} Project` },
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-md shadow">
            <h3 className="text-lg font-semibold mb-2">Employee Status</h3>
            <div className="h-40 flex items-center justify-center text-gray-400">[Pie Chart Placeholder]</div>
          </div>
          <div className="bg-white p-6 rounded-md shadow text-center">
            <h3 className="text-lg font-semibold mb-2">Rating Company</h3>
            <div className="text-3xl font-bold text-yellow-500">{rating.score.toFixed(2)}</div>
            <p className="text-gray-500 text-sm mt-1">{rating.total} Review</p>
          </div>
        </div>

        {/* Project Progress & Top Employees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Progres Project</h3>
            <div className="overflow-auto bg-white rounded-md shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Nama Project</th>
                    <th className="px-4 py-2 text-left">Klien</th>
                    <th className="px-4 py-2 text-left">Deadline</th>
                    <th className="px-4 py-2 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{project.name}</td>
                      <td className="px-4 py-2">{project.client}</td>
                      <td className="px-4 py-2">{project.deadline}</td>
                      <td className="px-4 py-2">
                        <div className="w-full bg-gray-200 h-2 rounded">
                          <div className="bg-blue-500 h-2 rounded" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Top 5 Employees</h3>
            <div className="overflow-auto bg-white rounded-md shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Ranking</th>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Point</th>
                  </tr>
                </thead>
                <tbody>
                  {topEmployees.map((emp, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2">{emp.point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardManager;
