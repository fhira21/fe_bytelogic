// src/pages/employee/EmployeeList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../assets/images/profile.jpg';
import axios from 'axios';
import Sidebar from '../../components/SideBar';
import TopbarProfile from '../../components/TopbarProfile';
import { Search, X } from 'lucide-react';

const EmployeeList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registeredUserId, setRegisteredUserId] = useState(null);

  // form data: SAMAKAN dengan schema backend
  const [formData, setFormData] = useState({
    // Step 1 - login
    username: '',
    password: '',
    confirmPassword: '',
    role: 'karyawan',     // <-- role backend valid
    email_login: '',      // email saat register (opsional)

    // Step 2 - profil karyawan
    nama_lengkap: '',
    email: '',
    alamat: '',
    nomor_telepon: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    status_Karyawan: 'Aktif', // default
    nik: '',
  });

  // ===== Helpers =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const cleanObject = (obj) => {
    const out = {};
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (v !== undefined && v !== '') out[k] = v;
    });
    return out;
  };

  const mapGender = (val) => {
    if (!val) return val;
    const v = val.toLowerCase();
    if (v === 'male' || v === 'laki-laki' || v === 'laki laki' || v === 'pria') return 'Laki-laki';
    if (v === 'female' || v === 'perempuan' || v === 'wanita') return 'Perempuan';
    return val;
  };

  const toIsoDate = (val) => {
    if (!val) return val;
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toISOString().slice(0, 10);
  };

  // ===== Fetch list =====
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://be.bytelogic.orenjus.com/api/karyawan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.data;
        setEmployees(data || []);
      } catch (err) {
        console.error('Error fetching employee data:', err);
      }
    };
    fetchEmployees();
  }, [token]);

  const filteredEmployees = employees.filter(emp =>
    emp.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== Edit flow =====
  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData(prev => ({
      ...prev,
      // isi form dari data employee
      nama_lengkap: employee.nama_lengkap || '',
      email: employee.email || '',
      alamat: employee.alamat || '',
      nomor_telepon: employee.nomor_telepon || '',
      jenis_kelamin: employee.jenis_kelamin || '',
      status_Karyawan: employee.status_Karyawan || 'Aktif',
      nik: employee.nik || '',
      // kosongkan field login (edit profil tidak ubah akun user)
      username: '',
      password: '',
      confirmPassword: '',
      role: 'karyawan',
      email_login: '',
      tanggal_lahir: employee.tanggal_lahir || '',
    }));
  };

  const closeEditModal = () => {
    setEditingEmployee(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'karyawan',
      email_login: '',
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      status_Karyawan: 'Aktif',
      nik: '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingEmployee?._id) return;

    try {
      const payload = cleanObject({
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        alamat: formData.alamat,
        nomor_telepon: formData.nomor_telepon,
        tanggal_lahir: toIsoDate(formData.tanggal_lahir),
        jenis_kelamin: mapGender(formData.jenis_kelamin),
        status_Karyawan: formData.status_Karyawan,
        nik: formData.nik,
      });

      const res = await axios.put(
        `http://be.bytelogic.orenjus.com/api/karyawan/${editingEmployee._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        const updated = res.data?.data || res.data;
        setEmployees(prev => prev.map(emp => (emp._id === editingEmployee._id ? { ...emp, ...updated } : emp)));
        closeEditModal();
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Gagal mengupdate karyawan: ${msg}`);
      }
    } catch (error) {
      console.error('Update employee failed:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Gagal mengupdate karyawan.'
      );
    }
  };

  // ===== Add flow (2 langkah) =====
  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(1);
    setRegisteredUserId(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'karyawan',
      email_login: '',
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      status_Karyawan: 'Aktif',
      nik: '',
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    setRegisteredUserId(null);
  };

  // Step 1: register user
  const goNextFromStep1 = async () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      alert('Please fill all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Password and confirmation password do not match');
      return;
    }

    try {
      const ensuredEmail =
        (formData.email_login && formData.email_login.trim()) ||
        (formData.email && formData.email.trim()) ||
        `${formData.username}@bytelogic.local`;

      const payload = {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        passwordConfirmation: formData.confirmPassword,
        role: 'karyawan',       // <-- HARUS sesuai enum backend
        email: ensuredEmail,
      };

      const res = await axios.post(
        'http://be.bytelogic.orenjus.com/api/users/register',
        payload,
        { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true }
      );

      if (res.status >= 400) {
        const msg = res.data?.message || res.data?.error || `Register failed (${res.status})`;
        throw new Error(msg);
      }

      const newUser = res.data?.data || res.data?.user || res.data;
      const newUserId = newUser?._id || newUser?.id;
      if (!newUserId) throw new Error('User ID tidak ditemukan pada respons register');

      setRegisteredUserId(newUserId);
      setCurrentStep(2);
    } catch (err) {
      console.error('Register user gagal:', err);
      alert(err.message || 'Gagal mendaftarkan user');
    }
  };

  // Step 2: create karyawan with user_id
  const createEmployee = async () => {
    try {
      if (!registeredUserId || !/^[0-9a-fA-F]{24}$/.test(registeredUserId)) {
        alert(`User ID dari Step 1 tidak valid: ${registeredUserId || '(kosong)'}`);
        return;
      }

      const payload = cleanObject({
        user_id: registeredUserId,
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        alamat: formData.alamat,
        nomor_telepon: formData.nomor_telepon,
        tanggal_lahir: toIsoDate(formData.tanggal_lahir),
        jenis_kelamin: mapGender(formData.jenis_kelamin),
        status_Karyawan: formData.status_Karyawan,
        nik: formData.nik,
      });

      const res = await axios.post(
        'http://be.bytelogic.orenjus.com/api/karyawan',
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, validateStatus: () => true }
      );

      console.log('[POST /api/karyawan] status=', res.status, 'payload=', payload, 'resp=', res.data);

      if (res.status >= 200 && res.status < 300) {
        const created = res.data?.data || res.data;
        setEmployees(prev => [...prev, created]);
        closeAddModal();
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Failed to add employee: ${msg}`);
      }
    } catch (error) {
      console.error('Error adding new employee:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to add employee. Please check the data and try again.'
      );
    }
  };

  // ===== View & Delete =====
  const openViewModal = (employee) => setViewingEmployee(employee);
  const closeViewModal = () => setViewingEmployee(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Employee Data</h1>

        {/* Search + Add */}
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
            <span className="text-sm md:text-base">Add Employee</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Full Name</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                  <th className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Phone</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Address</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gender</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <tr key={employee._id}>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.nama_lengkap || '-'}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.email || '-'}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.nomor_telepon || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.alamat || '-'}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.jenis_kelamin || '-'}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${employee.status_Karyawan === 'Aktif' ? 'bg-green-100 text-green-800' :
                            employee.status_Karyawan === 'Tidak Aktif' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                          {employee.status_Karyawan || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => openEditModal(employee)}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingEmployee(employee)}
                            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                          <button
                            onClick={() => openViewModal(employee)}
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
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg p-6 w-full ${currentStep === 1 ? 'max-w-md' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {currentStep === 1 ? 'Add Employee' : 'Add Employee'}
                </h3>
                <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700">
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
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                        placeholder="Create Username"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
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
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                          required
                          placeholder="Re-enter Password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email (optional for register)</label>
                      <input
                        type="email"
                        name="email_login"
                        value={formData.email_login}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter email (if required by backend)"
                      />
                    </div>

                    {/* Role fixed */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <input
                        type="text"
                        value="karyawan"
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <input type="hidden" name="role" value="karyawan" />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={goNextFromStep1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Next
                    </button>
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
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="date"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status_Karyawan"
                        value={formData.status_Karyawan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="Aktif">Active</option>
                        <option value="Tidak Aktif">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Id Number (NIK)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter NIK"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={createEmployee}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Employee
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Employee</h3>
                <button onClick={() => setDeletingEmployee(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Do you want to delete employee {deletingEmployee.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.delete(`http://be.bytelogic.orenjus.com/api/karyawan/${deletingEmployee._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setEmployees(prev => prev.filter(emp => emp._id !== deletingEmployee._id));
                      setDeletingEmployee(null);
                    } catch (error) {
                      console.error('Error deleting employee:', error);
                      alert('Failed to delete employee. Please try again.');
                    }
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Edit Employee</h3>
                <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={saveEdit}>
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Employee Information</h4>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="">Select Gender</option>
                        <option value="Laki-laki">Male</option>
                        <option value="Perempuan">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status_Karyawan"
                        value={formData.status_Karyawan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="Aktif">Active</option>
                        <option value="Tidak Aktif">Inactive</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-4">Other</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          name="tanggal_lahir"
                          value={formData.tanggal_lahir}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">NIK</label>
                        <input
                          type="text"
                          name="nik"
                          value={formData.nik}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                          placeholder="Enter NIK"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Employee Details</h3>
                <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Login Information</h4>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Username:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.username || '-'}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Full Name:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.nama_lengkap || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Email:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.email || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Phone Number:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.nomor_telepon || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Address:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.alamat || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Gender:</span>
                      <span className="w-2/3 text-gray-900">{viewingEmployee.jenis_kelamin || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Status:</span>
                      <span className={`w-2/3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${viewingEmployee.status_Karyawan === 'Aktif' ? 'bg-green-100 text-green-800' :
                          viewingEmployee.status_Karyawan === 'Tidak Aktif' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                        {viewingEmployee.status_Karyawan || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-start pt-6">
                    <button onClick={closeViewModal} className="px-4 py-2 bg-gray-200 font-medium text-black rounded-md hover:bg-gray-300">
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

export default EmployeeList;