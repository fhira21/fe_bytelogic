// src/pages/manager/AdminList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopbarProfile from '../../components/TopbarProfile';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Search, X } from 'lucide-react';

const AdminList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ======= State utama =======
  const [managers, setManagers] = useState([]);
  const [editingManager, setEditingManager] = useState(null);
  const [deletingManager, setDeletingManager] = useState(null);
  const [viewingManager, setViewingManager] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // ======= Add (2 step) =======
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registeredUserId, setRegisteredUserId] = useState(null); // hasil dari /users/register

  // Satu objek untuk menampung semua input
  const [formData, setFormData] = useState({
    // Step 1 - Login
    username: '',
    password: '',
    confirmPassword: '',
    role: 'manager/admin', // fixed, tidak bisa diganti
    email: '',

    // Step 2 - Personal (manager profile)
    nama_lengkap: '',
    email_personal: '',
    alamat: '',
    nomor_telepon: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    status_pernikahan: '',
    nik: '',
    posisi: 'Manajer', // default Indonesia (enum)
    // pendidikan (opsional)
    educationLevel: '',
    institution: '',
    graduationYear: '',
    riwayat_pendidikan: [],
  });

  // ======= Helpers =======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const alertFromAxiosError = (err, fallback = 'Terjadi kesalahan') => {
    const data = err?.response?.data;
    const serverMsg =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : '') ||
      err?.message;
    alert(serverMsg || fallback);
  };

  const cleanObject = (obj) => {
    // hapus key yang undefined atau string kosong
    const out = {};
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (v !== undefined && v !== '') out[k] = v;
    });
    return out;
  };

  // Normalisasi status nikah UI -> enum backend (Indonesia)
  const mapMaritalStatus = (val) => {
    if (!val) return val;
    switch (val.trim().toLowerCase()) {
      case 'single': return 'Belum Menikah';
      case 'married': return 'Menikah';
      case 'divorced': return 'Cerai';
      case 'widowed': return 'Janda/Duda';
      case 'belum menikah':
      case 'menikah':
      case 'cerai':
      case 'janda/duda':
      case 'duda/janda':
        return val;
      default:
        return val;
    }
  };

  // Normalisasi gender UI -> enum backend (Indonesia)
  const mapGender = (val) => {
    if (!val) return val;
    const v = val.trim().toLowerCase();
    if (v === 'male' || v === 'pria' || v === 'laki-laki' || v === 'laki laki') return 'Laki-laki';
    if (v === 'female' || v === 'wanita' || v === 'perempuan') return 'Perempuan';
    return val;
  };

  // Normalisasi posisi UI -> enum backend (Indonesia)
  const mapPosition = (val) => {
    if (!val) return val;
    const v = val.trim().toLowerCase();
    if (v === 'manager' || v === 'manajer') return 'Manajer';
    if (v === 'admin') return 'Manajer';    // jika backend tidak punya "Admin" pada enum posisi
    if (v === 'supervisor') return 'Supervisor';
    if (v === 'staff' || v === 'staf') return 'Staf';
    // jika sudah Indonesia lainnya, biarkan
    return val;
  };

  // Pastikan tanggal format YYYY-MM-DD
  const toIsoDate = (val) => {
    if (!val) return val;
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toISOString().slice(0, 10);
  };

  // ======= Fetch data managers =======
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get('http://be.bytelogic.orenjus.com/api/managers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = (raw || []).map(it => ({
          ...it,
          _id: it._id || it.id, // konsisten
          riwayat_pendidikan: Array.isArray(it.riwayat_pendidikan) ? it.riwayat_pendidikan : [],
        }));
        setManagers(list);
      } catch (err) {
        console.error('Gagal fetch managers:', err);
      }
    };
    fetchManagers();
  }, [token]);

  // ======= Filtered list =======
  const filteredManagers = managers.filter(m =>
    m.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ======= Edit =======
  const openEditModal = (manager) => {
    setEditingManager(manager);
    setFormData(prev => ({
      ...prev,
      // isi field dari manager ke form (personal)
      nama_lengkap: manager.nama_lengkap || '',
      email_personal: manager.email || '',
      alamat: manager.alamat || '',
      nomor_telepon: manager.nomor_telepon || '',
      tanggal_lahir: manager.tanggal_lahir || '',
      jenis_kelamin: manager.jenis_kelamin || '',
      status_pernikahan: manager.status_pernikahan || '',
      nik: manager.nik || '',
      posisi: manager.posisi || 'Manajer',
      riwayat_pendidikan: Array.isArray(manager.riwayat_pendidikan) ? manager.riwayat_pendidikan : [],
      // kosongkan login fields agar tidak mengubah user login di modal edit manager
      username: '',
      password: '',
      confirmPassword: '',
      role: 'manager/admin', // tetap
      email: ''
    }));
  };

  const closeEditModal = () => {
    setEditingManager(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingManager?._id) {
      alert('ID admin tidak ditemukan');
      return;
    }
    try {
      // payload hanya field personal
      const payload = cleanObject({
        nama_lengkap: formData.nama_lengkap,
        email: formData.email_personal,
        alamat: formData.alamat,
        nomor_telepon: formData.nomor_telepon,
        tanggal_lahir: toIsoDate(formData.tanggal_lahir),
        jenis_kelamin: mapGender(formData.jenis_kelamin),
        status_pernikahan: mapMaritalStatus(formData.status_pernikahan),
        nik: formData.nik,
        posisi: mapPosition(formData.posisi),
        riwayat_pendidikan: formData.riwayat_pendidikan,
      });

      const res = await axios.put(
        `http://be.bytelogic.orenjus.com/api/managers/${editingManager._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.data || res.data;
      setManagers(prev => prev.map(m => (m._id === editingManager._id ? { ...m, ...updated } : m)));
      closeEditModal();
    } catch (err) {
      console.error('Error updating manager:', err);
      alertFromAxiosError(err, 'Gagal mengupdate admin');
    }
  };

  // ======= Delete =======
  const openDeleteModal = (manager) => setDeletingManager(manager);
  const closeDeleteModal = () => setDeletingManager(null);

  const confirmDelete = async () => {
    if (!deletingManager?._id) return;
    try {
      await axios.delete(`http://be.bytelogic.orenjus.com/api/managers/${deletingManager._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagers(prev => prev.filter(m => m._id !== deletingManager._id));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting manager:', err);
      alertFromAxiosError(err, 'Gagal menghapus admin');
    }
  };

  // ======= View =======
  const openViewModal = (manager) => setViewingManager(manager);
  const closeViewModal = () => setViewingManager(null);

  // ======= Add (2 langkah) =======
  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(1);
    setRegisteredUserId(null);
    setFormData({
      // step 1
      username: '',
      password: '',
      confirmPassword: '',
      role: 'manager/admin', // fixed
      email: '',

      // step 2
      nama_lengkap: '',
      email_personal: '',
      alamat: '',
      nomor_telepon: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      status_pernikahan: '',
      nik: '',
      posisi: 'Manajer',
      educationLevel: '',
      institution: '',
      graduationYear: '',
      riwayat_pendidikan: [],
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    setRegisteredUserId(null);
  };

  // Step 1 -> Register user
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
      // fallback email jika kosong
      const ensuredEmail =
        (formData.email && formData.email.trim()) ||
        (formData.email_personal && formData.email_personal.trim()) ||
        `${formData.username}@bytelogic.local`;

      // payload hardcode role ke "manager/admin"
      const payload = {
        username: formData.username,
        email: ensuredEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        passwordConfirmation: formData.confirmPassword,
        role: 'manager/admin', // <- paksa
      };

      console.log('[REGISTER payload]', payload);

      const res = await axios.post(
        'http://be.bytelogic.orenjus.com/api/users/register',
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true, // baca body error non-2xx
        }
      );

      if (res.status >= 400) {
        const serverMsg =
          res.data?.message ||
          res.data?.error ||
          (typeof res.data === 'string' ? res.data : '') ||
          `Register failed (${res.status})`;
        throw new Error(serverMsg);
      }

      const newUser = res.data?.data || res.data?.user || res.data;
      const newUserId = newUser?._id || newUser?.id;
      if (!newUserId) {
        throw new Error('User ID tidak ditemukan pada respons register');
      }

      setRegisteredUserId(newUserId);
      setCurrentStep(2);
    } catch (err) {
      console.error('Register user gagal:', err);
      alert(err.message || 'Gagal mendaftarkan user');
    }
  };

  // Step 2 -> Create manager/admin profile
  const createManager = async () => {
    try {
      // 1) Pastikan user_id valid (24 hex)
      if (!registeredUserId || !/^[0-9a-fA-F]{24}$/.test(registeredUserId)) {
        alert(`User ID dari Step 1 tidak valid: ${registeredUserId || '(kosong)'}`);
        return;
      }

      // 2) susun riwayat_pendidikan jika diisi singkat
      let riwayat = formData.riwayat_pendidikan;
      if (!riwayat || riwayat.length === 0) {
        if (formData.educationLevel || formData.institution || formData.graduationYear) {
          riwayat = [{
            jenjang: formData.educationLevel || '',
            institusi: formData.institution || '',
            tahun_lulus: formData.graduationYear || '',
          }];
        }
      }

      // 3) Normalisasi field agar cocok enum backend
      const payload = {
        user_id: registeredUserId, // sesuai error server: field ini yang dipakai
        nama_lengkap: formData.nama_lengkap,
        email: formData.email_personal,
        alamat: formData.alamat,
        nomor_telepon: formData.nomor_telepon,
        tanggal_lahir: toIsoDate(formData.tanggal_lahir),
        jenis_kelamin: mapGender(formData.jenis_kelamin),
        status_pernikahan: mapMaritalStatus(formData.status_pernikahan),
        nik: formData.nik,
        posisi: mapPosition(formData.posisi || 'Manajer'),
        riwayat_pendidikan: riwayat,
      };

      // 4) Bersihkan string kosong
      const cleanPayload = cleanObject(payload);

      const res = await axios.post(
        'http://be.bytelogic.orenjus.com/api/managers',
        cleanPayload,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          validateStatus: () => true,
        }
      );

      console.log('[POST /api/managers] status=', res.status, 'payload=', cleanPayload, 'resp=', res.data);

      if (res.status >= 200 && res.status < 300) {
        const created = res.data?.data || res.data;
        setManagers(prev => [...prev, created]);
        closeAddModal();
        return; // sukses
      }

      const msg =
        res.data?.message ||
        res.data?.error ||
        (typeof res.data === 'string' ? res.data : '') ||
        `HTTP ${res.status}`;
      alert(`Gagal menambahkan manajer: ${msg}`);
    } catch (err) {
      console.error('Error adding manager:', err);
      alertFromAxiosError(err, 'Gagal menambahkan manajer');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Admin Data</h1>

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
            <span className="text-sm md:text-base">Add Admin</span>
          </button>
        </div>

        {/* Table Section */}
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
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Position</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManagers.length > 0 ? (
                  filteredManagers.map(manager => (
                    <tr key={manager._id || manager.email}>
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
                          ? manager.riwayat_pendidikan
                              .map(item => `${item.jenjang || ''} - ${item.institusi || ''} - ${item.tahun_lulus || ''}`)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.status_pernikahan || '-'}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manager.posisi || '-'}
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
                            onClick={() => openDeleteModal(manager)}
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
                    <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== ADD MODAL (2 STEP) ===================== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className={`bg-white rounded-lg p-6 w-full ${currentStep === 1 ? 'max-w-md' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {currentStep === 1 ? 'User Information' : 'Admin Data'}
                </h3>
                <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      placeholder="Create Username"
                      required
                    />
                  </div>

                  {/* Opsional: Email saat register */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email (optional for register)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      placeholder="Enter email (if required by backend)"
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
                        placeholder="Create Password"
                        required
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
                        placeholder="Re-enter Password"
                        required
                      />
                    </div>
                  </div>

                  {/* Role (fixed) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      value="manager/admin"
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <input type="hidden" name="role" value="manager/admin" />
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
                <div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (profile)</label>
                      <input
                        type="email"
                        name="email_personal"
                        value={formData.email_personal}
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
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
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
                        value={formData.nik}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter NIK"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <select
                        name="posisi"
                        value={formData.posisi}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      >
                        <option value="Manajer">Manajer</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Staf">Staf</option>
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
                    <h5 className="text-sm font-medium mb-4">Educational Background (optional)</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <input
                          type="text"
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3"
                          placeholder="Education Level"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3"
                          placeholder="Institution"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3"
                          placeholder="Graduation Year"
                        />
                      </div>
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
                      onClick={createManager}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Admin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== DELETE MODAL ===================== */}
        {deletingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Admin</h3>
                <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Do you want to delete admin {deletingManager.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== EDIT MODAL ===================== */}
        {editingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Edit Admin</h3>
                <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
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
                        name="email_personal"
                        value={formData.email_personal}
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
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
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
                        value={formData.nik}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter NIK"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <select
                        name="posisi"
                        value={formData.posisi}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="Manajer">Manajer</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Staf">Staf</option>
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

        {/* ===================== VIEW MODAL ===================== */}
        {viewingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Detail Admin</h3>
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
                      <span className="w-2/3 text-gray-900">{viewingManager.username || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">User Role:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.role || 'manager/admin'}</span>
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
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Marital Status:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.status_pernikahan || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3 font-normal text-black-500">Position:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.posisi || '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {viewingManager.riwayat_pendidikan?.length > 0 ? (
                      viewingManager.riwayat_pendidikan.map((edu, idx) => (
                        <div key={idx} className="flex">
                          <span className="w-1/3 font-normal text-black-500">Educational Background:</span>
                          <span className="w-2/3 text-gray-900">
                            {`${edu.jenjang || '-'} - ${edu.institusi || '-'} (${edu.tahun_lulus || '-'})`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No education data available</p>
                    )}
                  </div>

                  <div className="flex justify-start pt-6">
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