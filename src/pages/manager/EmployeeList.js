import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfilePic from '../../assets/images/profile.jpg';
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
  Search,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get("http://localhost:5000/api/karyawan", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("API Response:", response.data);

      // Handle multiple response formats
      let karyawanData = [];
      if (Array.isArray(response.data)) {
        karyawanData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        karyawanData = response.data.data;
      } else if (response.data?.result && Array.isArray(response.data.result)) {
        karyawanData = response.data.result;
      } else {
        throw new Error("Format data tidak valid");
      }

      const validatedData = karyawanData.map(item => ({
        _id: item._id || Math.random().toString(36).substr(2, 9),
        nama_lengkap: item.nama_lengkap || 'Nama tidak tersedia',
        email: item.email || 'Email tidak tersedia',
        alamat: item.alamat || 'Alamat tidak tersedia',
        nomor_telepon: item.nomor_telepon || '-',
        status_Karyawan: item.status_Karyawan || 'Tidak Diketahui',
        createdAt: item.createdAt || new Date().toISOString()
      }));

      setEmployees(validatedData);
    } catch (err) {
      console.error("Error fetching employees:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengambil data");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = () => {
    navigate("/tambah-karyawan");
  };

  const handleEditEmployee = (employeeId) => {
    navigate(`/edit-karyawan/${employeeId}`);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/karyawan/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchEmployees();
    } catch (error) {
      console.error("Gagal menghapus karyawan:", error);
      setError("Gagal menghapus karyawan. Silakan coba lagi.");
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const term = searchTerm.toLowerCase();
    return (
      employee.nama_lengkap?.toLowerCase().includes(term) ||
      employee.email?.toLowerCase().includes(term) ||
      employee.nomor_telepon?.includes(term) ||
      employee.alamat?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat data karyawan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 font-medium mb-4">{error}</div>
          <button 
            onClick={fetchEmployees}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

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
            className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
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
            className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
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
        <div className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="relative w-80">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <img src={ProfilePic} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white" />
              <span className="font-medium">Deni el mares</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
            <button 
              onClick={handleAddEmployee}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Plus size={16} /> Tambah Karyawan
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-medium">{filteredEmployees.length}</span> dari{' '}
                <span className="font-medium">{employees.length}</span> karyawan
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <TableHeader>Nama</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Alamat</TableHeader>
                    <TableHeader>No. HP</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Aksi</TableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <TableRow 
                        key={employee._id}
                        employee={employee}
                        onEdit={handleEditEmployee}
                        onDelete={handleDeleteEmployee}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search size={32} className="mb-3 text-gray-400" />
                          <p className="mb-1">Tidak ada data karyawan ditemukan</p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Reset pencarian
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable components
const SidebarButton = ({ icon, text, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-2 rounded-md transition-colors ${
      active ? 'bg-blue-700' : 'hover:bg-blue-700'
    }`}
  >
    <span className="text-blue-100">{icon}</span>
    <span>{text}</span>
  </button>
);

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableRow = ({ employee, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {employee.nama_lengkap}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {employee.email}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {employee.alamat}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {employee.nomor_telepon}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={employee.status_Karyawan} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <div className="flex space-x-3">
        <button
          onClick={() => onEdit(employee._id)}
          className="text-blue-600 hover:text-blue-900 transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(employee._id)}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

const StatusBadge = ({ status }) => {
  const statusLower = status.toLowerCase();
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  if (statusLower === 'aktif') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (statusLower === 'tidak aktif') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default EmployeeList;