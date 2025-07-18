import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../assets/images/profile.jpg';
import TopbarProfile from '../../components/TopbarProfile';
import Sidebar from '../../components/SideBar';
import axios from 'axios';

import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
  Search,
  X,
  User
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AdminList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [managers, setManagers] = useState([]);
  const [editingManager, setEditingManager] = useState(null);
  const [deletingManager, setDeletingManager] = useState(null);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    alamat: '',
    nomor_telepon: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    riwayat_pendidikan: [],
    status_pernikahan: '',
    nik: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewingManager, setViewingManager] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // State for manager profile
const [managerProfile, setManagerProfile] = useState({
  loading: true,
  data: null,
  error: null,
});

// useEffect untuk mengambil data profil manager
useEffect(() => {
  const fetchManagerProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/managers/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setManagerProfile({
        loading: false,
        data: response.data.data, // Data profil dari backend
        error: null,
      });
    } catch (error) {
      console.error("Error fetching manager profile:", error);
      setManagerProfile({
        loading: false,
        data: null,
        error: "Gagal mengambil profil",
      });
    }
  };

  fetchManagerProfile();
}, []);

  useEffect(() => {
    // Fetch managers data
    axios.get('http://localhost:5000/api/managers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        const cleanedData = data.map(item => ({
          ...item,
          riwayat_pendidikan: Array.isArray(item.riwayat_pendidikan) ? item.riwayat_pendidikan : []
        }));
        setManagers(cleanedData);
      })
      .catch(error => console.error('Error fetching admin data:', error));

    // Fetch manager profile
    axios.get('http://localhost:5000/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setManagerProfile({
          loading: false,
          data: response.data
        });
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setManagerProfile(prev => ({
          ...prev,
          loading: false
        }));
      });
  }, [token]);

  const filteredManagers = managers.filter(manager =>
    manager.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (manager) => {
    setEditingManager(manager);
    setFormData({
      ...manager,
      password: '',
      confirmPassword: ''
    });
  };

  const closeEditModal = () => {
    setEditingManager(null);
    setFormData({
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      riwayat_pendidikan: [],
      status_pernikahan: '',
      nik: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/managers/${editingManager.id}`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setManagers(prev => prev.map(manager =>
          manager.id === editingManager.id ? response.data : manager
        ));
        closeEditModal();
      })
      .catch((error) => console.error('Error updating manager:', error));
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(1);
    setFormData({
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      riwayat_pendidikan: [],
      status_pernikahan: '',
      nik: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
  };

  const saveAdd = (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!formData.username || !formData.role || !formData.password || !formData.confirmPassword) {
        alert('Please fill all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('Password and confirmation password do not match');
        return;
      }

      setCurrentStep(2);
      return;
    }

    const dataToSend = {
      ...formData,
      confirmPassword: undefined
    };

    axios.post('http://localhost:5000/api/managers', dataToSend, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setManagers(prev => [...prev, response.data]);
        closeAddModal();
      })
      .catch(error => {
        console.error('Error adding new manager:', error);
        alert('Failed to add admin. Please check the data and try again.');
      });
  };

  const openViewModal = (manager) => {
    setViewingManager(manager);
  };

  const closeViewModal = () => {
    setViewingManager(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Admin Data</h1>

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
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            <span className="text-sm md:text-base">Add Admin</span>
          </button>
        </div>

        {/* Table Section - Responsif */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Full Name</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                  <th className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Phone</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Address</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">DOB</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gender</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">NIK</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Education</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManagers.length > 0 ? (
                  filteredManagers.map(manager => (
                    <tr key={manager.id || manager.email}>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900">
                        {manager.nama_lengkap ?? '-'}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.email || '-'}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.nomor_telepon || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.alamat || '-'}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.tanggal_lahir || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.jenis_kelamin || '-'}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.nik || '-'}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-500">
                        {manager.riwayat_pendidikan?.length > 0
                          ? manager.riwayat_pendidikan.map(item =>
                            `${item.jenjang || ''} - ${item.institusi || ''} - ${item.tahun_lulus || ''}`
                          ).join(", ")
                          : '-'}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.status_pernikahan || '-'}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => openEditModal(manager)}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingManager(manager)}
                            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                          <button
                            onClick={() => openViewModal(manager)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span className="text-sm">View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className={`bg-white rounded-lg p-6 w-full ${currentStep === 1 ? 'max-w-md' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {currentStep === 1 ? 'Personal Information' : 'Admin Data'}
                </h3>
                <button
                  onClick={closeAddModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {currentStep === 1 ? (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Login Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Create Username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Create Password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Re-enter Password"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Date full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleEditChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 uppercase-date-input"
                          required
                          style={{ color: formData.dob ? '#111827' : '#9CA3AF' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        style={{ color: formData.gender ? '#111827' : '#9CA3AF' }}
                      >
                        <option value="" disabled hidden style={{ color: '#9CA3AF' }}>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        style={{ color: formData.gender ? '#111827' : '#9CA3AF' }}
                      >
                        <option value="" disabled hidden>
                          Select Martial Status
                        </option>
                        <option value="male" className="text-gray-900">Single</option>
                        <option value="male" className="text-gray-900">Married</option>
                        <option value="male" className="text-gray-900">Divorced</option>
                        <option value="male" className="text-gray-900">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Id Number</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email is number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter educational background"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-4">Educational Background</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                        <input
                          type="text"
                          name="educationLevel"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Select education level"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Health Area</label>
                        <input
                          type="text"
                          name="healthArea"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Select health area"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year of Graduation</label>
                        <input
                          type="text"
                          name="graduationYear"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Select year"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6 pt-4 border-t">
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                )}

                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveAdd}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Admin</h3>
                <button
                  onClick={() => setDeletingManager(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Do You Want To Delete Admin {deletingManager.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingManager(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    axios.delete(`http://localhost:5000/api/managers/${deletingManager.id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                      .then(() => {
                        setManagers(prev => prev.filter(manager => manager.id !== deletingManager.id));
                        setDeletingManager(null);
                      })
                      .catch(error => {
                        console.error('Error deleting manager:', error);
                        alert('Gagal menghapus admin. Silakan coba lagi.');
                      });
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Admin Modal */}
        {editingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Edit Admin</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={saveEdit}>
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Personal Information</h4>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="date"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (NIK)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter NIK"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-4">Educational Background</h5>
                    {formData.riwayat_pendidikan?.map((edu, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                          <input
                            type="text"
                            name={`riwayat_pendidikan[${index}].jenjang`}
                            value={edu.jenjang || ''}
                            onChange={(e) => {
                              const newEducation = [...formData.riwayat_pendidikan];
                              newEducation[index].jenjang = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                riwayat_pendidikan: newEducation
                              }));
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Education level"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            name={`riwayat_pendidikan[${index}].institusi`}
                            value={edu.institusi || ''}
                            onChange={(e) => {
                              const newEducation = [...formData.riwayat_pendidikan];
                              newEducation[index].institusi = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                riwayat_pendidikan: newEducation
                              }));
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Institution name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                          <input
                            type="text"
                            name={`riwayat_pendidikan[${index}].tahun_lulus`}
                            value={edu.tahun_lulus || ''}
                            onChange={(e) => {
                              const newEducation = [...formData.riwayat_pendidikan];
                              newEducation[index].tahun_lulus = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                riwayat_pendidikan: newEducation
                              }));
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Graduation year"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* View Admin Modal */}
        {viewingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Detail Admin</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Login Information</h4>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Username:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.username || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">User Role:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.role || '-'}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Full Name:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.nama_lengkap || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Email:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.email || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Phone Number:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.nomor_telepon || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Address:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.alamat || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Date of Birth:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.tanggal_lahir || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Gender:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.jenis_kelamin || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">ID Number:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.nik || '-'}</span>
                    </div>
                  </div>
                  {/* Education Section */}
                  {viewingManager.riwayat_pendidikan?.length > 0 ? (
                    <div className="space-y-4"> {/* Container untuk education items */}
                      {viewingManager.riwayat_pendidikan.map((edu, index) => (
                        <div key={index} className="flex">
                          <span className="w-1/3 font-normal text-black-500">Educational Background:</span>
                          <span className="w-2/3 text-gray-900">
                            {`${edu.jenjang || '-'} - ${edu.institusi || '-'} (${edu.tahun_lulus || '-'})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No education data available</p>
                  )}

                  {/* Marital Status */}
                  <div className="flex pt-4"> {/* pt-4 untuk padding top */}
                    <span className="w-1/3 font-normal text-black-500">Marital Status:</span>
                    <span className="w-2/3 text-gray-900">{viewingManager.status_pernikahan || '-'}</span>
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-start pt-6"> {/* pt-6 untuk padding top lebih besar */}
                    <button
                      onClick={closeViewModal}
                      className="px-4 py-2 bg-gray-200 font-medium text-black rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminList;