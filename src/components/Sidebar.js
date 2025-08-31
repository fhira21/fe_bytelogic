import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Folder, ChartBar, FileText } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-16 md:w-56 bg-blue-500 p-2 md:p-6 flex flex-col text-white select-none transition-all duration-300">
      <div className="hidden md:flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
        <span className="font-semibold text-sm">Bytelogic</span>
      </div>
      <h1 className="hidden md:block text-xs font mb-6">MENU</h1>

      <button
        onClick={() => navigate('/dashboard-manager')}
        className={`flex items-center justify-center md:justify-start gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/dashboard-manager' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <Home size={18} />
        <span className="hidden md:inline">Dashboard</span>
      </button>

      <button
        onClick={() => navigate('/admin-list')}
        className={`flex items-center justify-center md:justify-start gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/admin-list' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <Folder size={18} />
        <span className="hidden md:inline">Admin Data</span>
      </button>

      <button
        onClick={() => navigate('/employee-list')}
        className={`flex items-center gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/employee-list' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <Folder size={18} /> Employee Data
      </button>

      <button
        onClick={() => navigate('/client-data')}
        className={`flex items-center gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/client-data' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <Folder size={18} /> Client Data
      </button>

      <button
        onClick={() => navigate('/data-project')}
        className={`flex items-center justify-center md:justify-start gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/data-project' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <Folder size={18} />
        <span className="hidden md:inline">Project Data</span>
      </button>

      <button
        onClick={() => navigate('/employee-evaluation')}
        className={`flex items-center gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/employee-evaluation' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <ChartBar size={18} /> Evaluation
      </button>

      <button
        onClick={() => navigate('/customer-reviews')}
        className={`flex items-center gap-2 p-2 rounded mb-2 transition-colors ${
          currentPath === '/customer-reviews' ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
      >
        <FileText size={18} /> Review
      </button>
    </aside>
  );
};

export default Sidebar;