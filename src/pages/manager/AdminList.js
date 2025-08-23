// src/pages/admin/AdminList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopbarProfile from '../../components/TopbarProfile';
import Sidebar from '../../components/SideBar';
import axios from 'axios';
import { Search, X } from 'lucide-react';

const ROLE = 'manager/admin';
const API_BASE = 'http://be.bytelogic.orenjus.com';
const currentYear = new Date().getFullYear();

// default row untuk riwayat pendidikan
const EMPTY_EDU = { jenjang: '', institusi: '', tahun_lulus: '' };

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
    role: ROLE,

    // Step 2 - Personal (sesuai BE)
    nama_lengkap: '',
    nik: '',
    email: '',
    nomor_telepon: '',
    alamat: '',
    tanggal_lahir: '',           // UI: MM/DD/YYYY (string)
    jenis_kelamin: '',           // 'laki-laki' | 'perempuan'
    status_pernikahan: '',       // 'menikah' | 'belum menikah'
    posisi: 'manager',           // default 'manager'
    riwayat_pendidikan: [{ ...EMPTY_EDU }], // default 1 baris
  });

  // ======= Helpers (format & parsing tanggal) =======
  const toMMDDYYYY = (val) => {
    if (!val) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const mmddyyyyToIso = (val) => {
    if (!val) return val;
    const m = String(val).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, mm, dd, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(val);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return val;
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
    const out = {};
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (v !== undefined && v !== '') out[k] = v;
    });
    return out;
  };

  const mapGender = (val) => {
    if (!val) return val;
    const v = val.trim().toLowerCase();
    if (['male', 'pria', 'laki-laki', 'laki laki'].includes(v)) return 'laki-laki';
    if (['female', 'wanita', 'perempuan'].includes(v)) return 'perempuan';
    return val;
  };

  const mapMarital = (val) => {
    if (!val) return val;
    const v = val.trim().toLowerCase();
    if (['single', 'belum menikah'].includes(v)) return 'belum menikah';
    if (['married', 'menikah'].includes(v)) return 'menikah';
    return val;
  };

  const ymd = (val) => {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d) ? '' : d.toISOString().slice(0, 10);
  };

  // ======= Fetch data managers =======
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const tk = localStorage.getItem('token');
        if (!tk) {
          navigate('/login');
          return;
        }
        const res = await axios.get(`${API_BASE}/api/managers`, {
          headers: { Authorization: `Bearer ${tk}` },
        });
        const raw = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = (raw || []).map((it) => ({
          ...it,
          _id: it._id || it.id,
          tanggal_lahir: it.tanggal_lahir,
          riwayat_pendidikan: Array.isArray(it.riwayat_pendidikan) ? it.riwayat_pendidikan : [],
        }));
        setManagers(list);
      } catch (err) {
        console.error('Gagal fetch managers:', err);
      }
    };
    fetchManagers();
  }, [navigate]);

  // ======= Filtered list =======
  const filteredManagers = managers.filter((m) => {
    const t = searchTerm.toLowerCase();
    return (
      m.nama_lengkap?.toLowerCase().includes(t) ||
      m.email?.toLowerCase().includes(t) ||
      m.nomor_telepon?.includes(t) ||
      m.nik?.includes(t) ||
      m.posisi?.toLowerCase().includes(t)
    );
  });

  // ======= Edit =======
  const openEditModal = (manager) => {
    setEditingManager(manager);
    const mapped = (manager.riwayat_pendidikan || []).map((r) => ({
      jenjang: r.jenjang || '',
      institusi: r.institusi || '',
      tahun_lulus: r.tahun_lulus || '',
    }));
    setFormData((prev) => ({
      ...prev,
      nama_lengkap: manager.nama_lengkap || '',
      nik: manager.nik || '',
      email: manager.email || '',
      nomor_telepon: manager.nomor_telepon || '',
      alamat: manager.alamat || '',
      tanggal_lahir: toMMDDYYYY(manager.tanggal_lahir),
      jenis_kelamin: manager.jenis_kelamin || '',
      status_pernikahan: manager.status_pernikahan || '',
      posisi: manager.posisi || 'manager',
      riwayat_pendidikan: mapped.length ? mapped : [{ ...EMPTY_EDU }],
      username: '',
      password: '',
      confirmPassword: '',
      role: ROLE,
    }));
  };

  const closeEditModal = () => setEditingManager(null);

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingManager?._id) {
      alert('ID admin tidak ditemukan');
      return;
    }
    if (formData.nik && !/^\d{16}$/.test(formData.nik)) {
      alert('NIK harus 16 digit angka');
      return;
    }
    if (formData.nomor_telepon && !/^\d{10,15}$/.test(formData.nomor_telepon)) {
      alert('Nomor telepon harus 10-15 digit angka');
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.tanggal_lahir || '')) {
      alert('Tanggal lahir harus berformat MM/DD/YYYY');
      return;
    }

    const rp = (formData.riwayat_pendidikan || [])
      .map((r) => ({
        jenjang: r.jenjang?.trim() || '',
        institusi: r.institusi?.trim() || '',
        tahun_lulus: r.tahun_lulus ? Number(r.tahun_lulus) : '',
      }))
      .filter((r) => r.jenjang || r.institusi || r.tahun_lulus);

    for (const r of rp) {
      if (r.tahun_lulus && (r.tahun_lulus < 1900 || r.tahun_lulus > currentYear)) {
        alert(`Tahun lulus harus antara 1900 - ${currentYear}`);
        return;
      }
    }

    try {
      const payload = cleanObject({
        nama_lengkap: formData.nama_lengkap,
        nik: formData.nik,
        email: formData.email,
        nomor_telepon: formData.nomor_telepon,
        alamat: formData.alamat,
        tanggal_lahir: mmddyyyyToIso(formData.tanggal_lahir),
        jenis_kelamin: mapGender(formData.jenis_kelamin),
        status_pernikahan: mapMarital(formData.status_pernikahan),
        posisi: (formData.posisi || 'manager').toLowerCase(),
        riwayat_pendidikan: rp,
      });

      const res = await axios.put(
        `${API_BASE}/api/managers/${editingManager._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const updated = res.data?.data || res.data;
      setManagers((prev) => prev.map((m) => (m._id === editingManager._id ? { ...m, ...updated } : m)));
      closeEditModal();
    } catch (err) {
      console.error('Error updating admin:', err);
      alertFromAxiosError(err, 'Gagal mengupdate admin');
    }
  };

  // ======= Delete =======
  const openDeleteModal = (manager) => setDeletingManager(manager);
  const closeDeleteModal = () => setDeletingManager(null);

  const confirmDelete = async () => {
    if (!deletingManager?._id) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/managers/${deletingManager._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status >= 200 && res.status < 300) {
        setManagers((prev) => prev.filter((m) => m._id !== deletingManager._id));
        closeDeleteModal();
      } else {
        alert(res.data?.message || 'Gagal menghapus admin');
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
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
      username: '',
      password: '',
      confirmPassword: '',
      role: ROLE,
      nama_lengkap: '',
      nik: '',
      email: '',
      nomor_telepon: '',
      alamat: '',
      tanggal_lahir: '', // UI: MM/DD/YYYY
      jenis_kelamin: '',
      status_pernikahan: '',
      posisi: 'manager',
      riwayat_pendidikan: [{ ...EMPTY_EDU }],
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    setRegisteredUserId(null);
  };

  // Step 1 -> Register user (role fixed 'manager/admin')
  const goNextFromStep1 = async () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      alert('Mohon isi username, password, dan confirm password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Password dan konfirmasi tidak sama');
      return;
    }

    try {
      const ensuredEmail = `${formData.username}@bytelogic.local`;

      const payload = {
        username: formData.username,
        email: ensuredEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        passwordConfirmation: formData.confirmPassword,
        role: ROLE,
      };

      const res = await axios.post(`${API_BASE}/api/users/register`, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });

      if (res.status >= 400) {
        const msg = res.data?.message || res.data?.error || `Register failed (${res.status})`;
        throw new Error(msg);
      }

      const newUser = res.data?.data || res.data?.user || res.data;
      const newUserId = newUser?._id || newUser?.id;
      if (!newUserId) throw new Error('User ID tidak ditemukan pada respons register');

      setRegisteredUserId(newUserId);

      // AUTO-FILL ke Step 2 bila ada
      setFormData((prev) => ({
        ...prev,
        nama_lengkap: newUser.full_name || newUser.nama_lengkap || prev.nama_lengkap,
        email: newUser.email || prev.email,
      }));

      setCurrentStep(2);
    } catch (err) {
      console.error('Register user gagal:', err);
      alert(err.message || 'Gagal mendaftarkan user');
    }
  };

  // Step 2 -> Create admin profile
  const createManager = async () => {
    try {
      if (!registeredUserId || !/^[0-9a-fA-F]{24}$/.test(registeredUserId)) {
        alert(`User ID dari Step 1 tidak valid: ${registeredUserId || '(kosong)'}`);
        return;
      }
      if (!/^\d{16}$/.test(formData.nik || '')) {
        alert('NIK wajib 16 digit');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email || '')) {
        alert('Email tidak valid');
        return;
      }
      if (!/^\d{10,15}$/.test(formData.nomor_telepon || '')) {
        alert('Nomor telepon wajib 10-15 digit angka');
        return;
      }
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.tanggal_lahir || '')) {
        alert('Tanggal lahir wajib diisi dan berformat MM/DD/YYYY');
        return;
      }
      if (!formData.jenis_kelamin) {
        alert('Jenis kelamin wajib diisi');
        return;
      }
      if (!formData.status_pernikahan) {
        alert('Status pernikahan wajib diisi');
        return;
      }
      if (!formData.alamat) {
        alert('Alamat wajib diisi');
        return;
      }

      // siapkan riwayat pendidikan
      const rp = (formData.riwayat_pendidikan || [])
        .map((r) => ({
          jenjang: (r.jenjang || '').trim(),
          institusi: (r.institusi || '').trim(),
          tahun_lulus: r.tahun_lulus ? Number(r.tahun_lulus) : '',
        }))
        .filter((r) => r.jenjang || r.institusi || r.tahun_lulus);

      for (const r of rp) {
        if (!r.jenjang || !r.institusi || !r.tahun_lulus) {
          alert('Lengkapi jenjang, institusi, dan tahun lulus di riwayat pendidikan');
          return;
        }
        if (r.tahun_lulus < 1900 || r.tahun_lulus > currentYear) {
          alert(`Tahun lulus harus antara 1900 - ${currentYear}`);
          return;
        }
      }

      const payload = cleanObject({
        user_id: registeredUserId,
        nama_lengkap: formData.nama_lengkap,
        nik: formData.nik,
        email: formData.email,
        nomor_telepon: formData.nomor_telepon,
        alamat: formData.alamat,
        tanggal_lahir: mmddyyyyToIso(formData.tanggal_lahir),
        jenis_kelamin: mapGender(formData.jenis_kelamin),
        status_pernikahan: mapMarital(formData.status_pernikahan),
        // paksa manager
        posisi: 'manager',
        riwayat_pendidikan: rp,
      });

      const res = await axios.post(
        `${API_BASE}/api/managers`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          validateStatus: () => true,
        }
      );

      if (res.status >= 200 && res.status < 300) {
        const created = res.data?.data || res.data;
        setManagers((prev) => [...prev, created]);
        closeAddModal();
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Gagal menambahkan admin: ${msg}`);
      }
    } catch (err) {
      console.error('Error adding admin:', err);
      alertFromAxiosError(err, 'Gagal menambahkan admin');
    }
  };

  // ======= Riwayat Pendidikan editor =======
  const addEduRow = () => {
    setFormData((prev) => ({
      ...prev,
      riwayat_pendidikan: [...(prev.riwayat_pendidikan || []), { ...EMPTY_EDU }],
    }));
  };
  const removeEduRow = (idx) => {
    setFormData((prev) => {
      const arr = [...(prev.riwayat_pendidikan || [])];
      if (arr.length <= 1) return prev; // jaga minimal 1 baris
      arr.splice(idx, 1);
      return { ...prev, riwayat_pendidikan: arr };
    });
  };
  const changeEduRow = (idx, field, value) => {
    setFormData((prev) => {
      const arr = [...(prev.riwayat_pendidikan || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, riwayat_pendidikan: arr };
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Admin Data</h1>

        {/* Search + Add */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">DOB</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gender</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">NIK</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Marital</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Position</th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Education</th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManagers.length > 0 ? (
                  filteredManagers.map((manager) => (
                    <tr key={manager._id || manager.email}>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900">{manager.nama_lengkap ?? '-'}</td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.email || '-'}</td>
                      <td className="hidden sm:table-cell px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">{manager.nomor_telepon || '-'}</td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.alamat || '-'}</td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.tanggal_lahir ? ymd(manager.tanggal_lahir) : '-'}</td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.jenis_kelamin || '-'}</td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.nik || '-'}</td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.status_pernikahan || '-'}</td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.posisi || '-'}</td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-500">
                        {manager.riwayat_pendidikan?.length > 0
                          ? manager.riwayat_pendidikan.map((item) => `${item.jenjang || ''} - ${item.institusi || ''} - ${item.tahun_lulus || ''}`).join(', ')
                          : '-'}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 md:gap-2">
                          <button onClick={() => openEditModal(manager)} className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-yellow-600 transition-colors">
                            <span className="text-sm">Edit</span>
                          </button>
                          <button onClick={() => openDeleteModal(manager)} className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                            <span className="text-sm">Delete</span>
                          </button>
                          <button onClick={() => openViewModal(manager)} className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                            <span className="text-sm">View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data ditemukan</td>
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
              {/* Header selalu "Add Admin" */}
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-2xl font-semibold">Add Admin</h3>
                <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {/* Subjudul dinamis + garis bawah */}
              <h4 className="text-md font-medium pb-2 border-b border-gray-300 mb-4">
                {currentStep === 1 ? 'Login Information' : 'Personal Information'}
              </h4>

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      placeholder="Create Username"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Create Password"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Re-enter Password"
                        required
                      />
                    </div>
                  </div>

                  {/* Role fixed (visible disabled + hidden for submit) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      value="admin"
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <input type="hidden" name="role" value={ROLE} />
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <button type="button" onClick={closeAddModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                      Cancel
                    </button>
                    <button type="button" onClick={goNextFromStep1} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_lengkap: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (NIK)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="16 digits"
                        pattern="\d{16}"
                        title="NIK harus 16 digit angka"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={(e) => setFormData((p) => ({ ...p, nomor_telepon: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="10-15 digits"
                        pattern="\d{10,15}"
                        title="Nomor telepon harus 10-15 digit angka"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="text"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir}
                        onChange={(e) => setFormData((p) => ({ ...p, tanggal_lahir: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="MM/DD/YYYY"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, jenis_kelamin: mapGender(e.target.value) }))
                        }
                        className={`mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 ${
                          formData.jenis_kelamin ? 'text-gray-900' : 'text-gray-400'
                        }`}
                        required
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="laki-laki">laki-laki</option>
                        <option value="perempuan">perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, status_pernikahan: mapMarital(e.target.value) }))
                        }
                        className={`mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 ${
                          formData.status_pernikahan ? 'text-gray-900' : 'text-gray-400'
                        }`}
                        required
                      >
                        <option value="" disabled>
                          Select Marital Status
                        </option>
                        <option value="belum menikah">belum menikah</option>
                        <option value="menikah">menikah</option>
                      </select>
                    </div>

                    {/* Position fixed to "manager" (disabled + hidden) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <input
                        type="text"
                        value="manager"
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <input type="hidden" name="posisi" value="manager" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter address"
                        required
                      />
                    </div>
                  </div>

                  {/* Riwayat Pendidikan */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-2">Riwayat Pendidikan</h5>

                    {(formData.riwayat_pendidikan || []).length === 0 && (
                      <p className="text-sm text-gray-500 mb-3">Belum ada entri pendidikan.</p>
                    )}

                    <div className="space-y-3">
                      {(formData.riwayat_pendidikan || []).map((row, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-start">
                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Jenjang</label>
                            <input
                              type="text"
                              value={row.jenjang || ''}
                              onChange={(e) => changeEduRow(idx, 'jenjang', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="SMA/SMK/D3/S1/S2/..."
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-6">
                            <label className="block text-xs text-gray-600 mb-1">Institusi</label>
                            <input
                              type="text"
                              value={row.institusi || ''}
                              onChange={(e) => changeEduRow(idx, 'institusi', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="Nama Universitas / Sekolah"
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Tahun Lulus</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={row.tahun_lulus || ''}
                                min={1900}
                                max={currentYear}
                                onChange={(e) => changeEduRow(idx, 'tahun_lulus', e.target.value)}
                                className="block w-full border border-gray-300 rounded-md py-2 px-3 pr-9"
                                placeholder="YYYY"
                              />
                              {(formData.riwayat_pendidikan || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEduRow(idx)}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                  title="Remove this row"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <button type="button" onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                      Back
                    </button>
                    <button type="button" onClick={createManager} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
                <button onClick={closeDeleteModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
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

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={(e) => setFormData((p) => ({ ...p, nama_lengkap: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (NIK)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="16 digits"
                        pattern="\d{16}"
                        title="NIK harus 16 digit angka"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={(e) => setFormData((p) => ({ ...p, nomor_telepon: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="10-15 digits"
                        pattern="\d{10,15}"
                        title="Nomor telepon harus 10-15 digit angka"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="text"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir}
                        onChange={(e) => setFormData((p) => ({ ...p, tanggal_lahir: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="MM/DD/YYYY"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={(e) => setFormData((p) => ({ ...p, jenis_kelamin: mapGender(e.target.value) }))}
                        className={`mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 ${
                          formData.jenis_kelamin ? 'text-gray-900' : 'text-gray-400'
                        }`}
                        required
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="laki-laki">laki-laki</option>
                        <option value="perempuan">perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan}
                        onChange={(e) => setFormData((p) => ({ ...p, status_pernikahan: mapMarital(e.target.value) }))}
                        className={`mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 ${
                          formData.status_pernikahan ? 'text-gray-900' : 'text-gray-400'
                        }`}
                        required
                      >
                        <option value="" disabled>
                          Select Marital Status
                        </option>
                        <option value="belum menikah">belum menikah</option>
                        <option value="menikah">menikah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <select
                        name="posisi"
                        value={formData.posisi}
                        onChange={(e) => setFormData((p) => ({ ...p, posisi: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      >
                        <option value="manager">manager</option>
                        <option value="supervisor">supervisor</option>
                        <option value="staf">staf</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter address"
                        required
                      />
                    </div>
                  </div>

                  {/* Riwayat Pendidikan (edit) */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-2">Riwayat Pendidikan</h5>

                    {(formData.riwayat_pendidikan || []).length === 0 && (
                      <p className="text-sm text-gray-500 mb-3">Belum ada entri pendidikan.</p>
                    )}

                    <div className="space-y-3">
                      {(formData.riwayat_pendidikan || []).map((row, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-start">
                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Jenjang</label>
                            <input
                              type="text"
                              value={row.jenjang || ''}
                              onChange={(e) => changeEduRow(idx, 'jenjang', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="SMA/SMK/D3/S1/S2/..."
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <label className="block text-xs text-gray-600 mb-1">Institusi</label>
                            <input
                              type="text"
                              value={row.institusi || ''}
                              onChange={(e) => changeEduRow(idx, 'institusi', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="Nama institusi"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Tahun Lulus</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={row.tahun_lulus || ''}
                                min={1900}
                                max={currentYear}
                                onChange={(e) => changeEduRow(idx, 'tahun_lulus', e.target.value)}
                                className="block w-full border border-gray-300 rounded-md py-2 px-3 pr-9"
                                placeholder="YYYY"
                              />
                              {(formData.riwayat_pendidikan || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEduRow(idx)}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                  title="Remove this row"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <span className="w-1/3">Username:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.username || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-1/3">User Role:</span>
                      <span className="w-2/3 text-gray-900">{viewingManager.role || ROLE}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    <div className="flex"><span className="w-1/3">Full Name:</span><span className="w-2/3 text-gray-900">{viewingManager.nama_lengkap || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">NIK:</span><span className="w-2/3 text-gray-900">{viewingManager.nik || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Email:</span><span className="w-2/3 text-gray-900">{viewingManager.email || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Phone Number:</span><span className="w-2/3 text-gray-900">{viewingManager.nomor_telepon || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Address:</span><span className="w-2/3 text-gray-900">{viewingManager.alamat || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Date of Birth:</span><span className="w-2/3 text-gray-900">{ymd(viewingManager.tanggal_lahir) || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Gender:</span><span className="w-2/3 text-gray-900">{viewingManager.jenis_kelamin || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Marital Status:</span><span className="w-2/3 text-gray-900">{viewingManager.status_pernikahan || '-'}</span></div>
                    <div className="flex"><span className="w-1/3">Position:</span><span className="w-2/3 text-gray-900">{viewingManager.posisi || '-'}</span></div>
                  </div>

                  <div className="space-y-2">
                    {viewingManager.riwayat_pendidikan?.length > 0 ? (
                      viewingManager.riwayat_pendidikan.map((edu, idx) => (
                        <div key={idx} className="flex">
                          <span className="w-1/3">Education:</span>
                          <span className="w-2/3 text-gray-900">
                            {`${edu.jenjang || '-'} - ${edu.institusi || '-'} (${edu.tahun_lulus || '-'})`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No education data</p>
                    )}
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

export default AdminList;