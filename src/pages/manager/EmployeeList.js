import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfilePic from '../../assets/images/pp.png';
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
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/karyawan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const karyawanData = response.data;

      if (!Array.isArray(karyawanData)) {
        throw new Error("Format data tidak valid");
      }

      const validatedData = karyawanData.map(item => ({
        _id: item._id || '',
        nama_lengkap: item.nama_lengkap || '',
        email: item.email || '',
        alamat: item.alamat || '',
        nomor_telepon: item.nomor_telepon || '',
        status_Karyawan: item.status_Karyawan || 'Tidak Diketahui',
        createdAt: item.createdAt || new Date().toISOString()
      }));

      setEmployees(validatedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching employees:", err);
      if (err.response?.status === 401) {
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
      <div className="flex h-screen items-center justify-center">
        <div>Memuat data karyawan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchEmployees}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font-semibold mb-6">MENU</h1>
        <button onClick={() => navigate('/dashboard-manager')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Home size={18} /> Dashboard
        </button>
        <button onClick={() => navigate('/admin-list')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Admin Data
        </button>
        <button onClick={() => navigate('/employee-list')} className="flex items-center gap-2 bg-gray-300 p-2 rounded mb-2">
          <Folder size={18} /> Employee Data
        </button>
        <button onClick={() => navigate('/client-data')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Client Data
        </button>
        <button onClick={() => navigate('/data-project')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Briefcase size={18} /> Project Data
        </button>
        <button onClick={() => navigate('/employee-evaluation')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <ChartBar size={18} /> Client Evaluation
        </button>
        <button onClick={() => navigate('/customer-reviews')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <FileText size={18} /> Client Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-80"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <img src={ProfilePic} alt="Profile" className="w-10 h-10 rounded-full" />
            <span className="font-medium">Deni el mares</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Data Karyawan</h1>
          <button 
            onClick={handleAddEmployee}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={16} /> Tambah Karyawan
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
        </div>

        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Nama</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Alamat</th>
              <th className="border px-4 py-2">No. HP</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
              <tr key={employee._id} className="text-sm text-gray-700">
                <td className="border px-4 py-2">{employee.nama_lengkap || '-'}</td>
                <td className="border px-4 py-2">{employee.email || '-'}</td>
                <td className="border px-4 py-2">{employee.alamat || '-'}</td>
                <td className="border px-4 py-2">{employee.nomor_telepon || '-'}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status_Karyawan.toLowerCase() === 'aktif' 
                      ? 'bg-green-100 text-green-800' 
                      : employee.status_Karyawan.toLowerCase() === 'tidak aktif'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status_Karyawan}
                  </span>
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <button 
                    onClick={() => handleEditEmployee(employee._id)}
                    className="text-blue-600 hover:underline"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(employee._id)}
                    className="text-red-600 hover:underline"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-4">Tidak ada data ditemukan</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default EmployeeList;