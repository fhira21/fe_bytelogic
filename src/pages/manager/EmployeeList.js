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
  X
} from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    alamat: '',
    nomor_telepon: '',
    jenis_kelamin: '',
    status_Karyawan: '',
  });
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
        jenis_kelamin: item.jenis_kelamin || 'Tidak Diketahui',
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

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      nama_lengkap: employee.nama_lengkap,
      email: employee.email,
      alamat: employee.alamat,
      nomor_telepon: employee.nomor_telepon,
      jenis_kelamin: employee.jenis_kelamin,
      status_Karyawan: employee.status_Karyawan,
    });
  };

  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee);
  };

  const handleDeleteEmployee = (employee) => {
    setDeletingEmployee(employee);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/karyawan/${editingEmployee._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchEmployees();
      setEditingEmployee(null);
    } catch (error) {
      console.error("Gagal mengupdate karyawan:", error);
      }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/karyawan/${deletingEmployee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchEmployees();
      setDeletingEmployee(null);
    } catch (error) {
      console.error("Gagal menghapus karyawan:", error);
      setError("Gagal menghapus karyawan. Silakan coba lagi.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredEmployees = employees.filter(employee => {
    const term = searchTerm.toLowerCase();
    return (
      employee.nama_lengkap?.toLowerCase().includes(term) ||
      employee.email?.toLowerCase().includes(term) ||
      employee.nomor_telepon?.includes(term) ||
      employee.alamat?.toLowerCase().includes(term) ||
      employee.jenis_kelamin?.toLowerCase().includes(term)
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Responsif */}
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
        <button onClick={() => navigate('/employee-list')} className="flex items-center justify-center md:justify-start gap-2 bg-blue-600 p-2 rounded mb-2">
          <Folder size={18} /> 
          <span className="hidden md:inline">Employee Data</span>
        </button>
        <button onClick={() => navigate('/client-data')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> 
          <span className="hidden md:inline">Client Data</span>
        </button>
        <button onClick={() => navigate('/data-project')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Briefcase size={18} /> 
          <span className="hidden md:inline">Project Data</span>
        </button>
        <button onClick={() => navigate('/employee-evaluation')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <ChartBar size={18} /> 
          <span className="hidden md:inline">Evaluation</span>
        </button>
        <button onClick={() => navigate('/customer-reviews')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <FileText size={18} /> 
          <span className="hidden md:inline">Review</span>
        </button>
      </aside>

      {/* Main Content - Responsif */}
      <main className="flex-1 p-2 md:p-6 overflow-auto bg-gray-50">
        {/* Profile Section - Responsif - Diubah untuk berada di pojok kanan */}
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-2">
            <img src={ProfilePic} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
            <span className="hidden md:inline font-medium">Deni el mares</span>
          </div>
        </div>

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Employee Data</h1>

        {/* Search and Action Section - Responsif */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button
            onClick={handleAddEmployee}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            <span className="text-sm md:text-base">Add Employee</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Full Name</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.nama_lengkap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.nomor_telepon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.alamat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.jenis_kelamin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${employee.status_Karyawan === 'Aktif' ? 'bg-green-100 text-green-800' : 
                            employee.status_Karyawan === 'Tidak Aktif' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {employee.status_Karyawan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee)}
                            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                          <button
                            onClick={() => handleViewEmployee(employee)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span className="text-sm">View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Employee</h3>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={saveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status_Karyawan"
                      value={formData.status_Karyawan}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Employee</h3>
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Are you sure you want to delete {deletingEmployee.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Employee Details</h3>
                <button
                  onClick={() => setViewingEmployee(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingEmployee.nama_lengkap}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingEmployee.nomor_telepon}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingEmployee.alamat}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingEmployee.jenis_kelamin}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingEmployee.status_Karyawan}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingEmployee(null)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeList;