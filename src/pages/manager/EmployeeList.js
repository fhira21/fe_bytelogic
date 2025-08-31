// src/pages/employee/EmployeeList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopbarProfile from '../../components/TopbarProfile';
import { X } from 'lucide-react';

const API_BASE = 'https://be.bytelogic.orenjus.com';
const THIS_YEAR = new Date().getFullYear();
const MAX_BIRTHDATE = new Date().toISOString().slice(0, 10);

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

  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      // Step 1 - login
      username: '',
      password: '',
      confirmPassword: '',
      role: 'karyawan',

      // Step 2 - profil karyawan (match BE)
      nama_lengkap: '',
      nik: '',
      email: '',
      nomor_telepon: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      status_pernikahan: 'belum menikah',
      alamat: '',
      status_Karyawan: 'Karyawan Aktif', // UI pakai ini; kirim keduanya saat POST/PUT
      riwayat_pendidikan: [{ jenjang: '', institusi: '', tahun_lulus: '' }],
    };
  }

  /* ============== Helpers ============== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEduChange = (idx, field, value) => {
    setFormData(prev => {
      const next = [...prev.riwayat_pendidikan];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, riwayat_pendidikan: next };
    });
  };

  const addEdu = () => {
    setFormData(prev => ({
      ...prev,
      riwayat_pendidikan: [...prev.riwayat_pendidikan, { jenjang: '', institusi: '', tahun_lulus: '' }]
    }));
  };

  const removeEdu = (idx) => {
    setFormData(prev => {
      const next = [...prev.riwayat_pendidikan];
      next.splice(idx, 1);
      return { ...prev, riwayat_pendidikan: next.length ? next : [{ jenjang: '', institusi: '', tahun_lulus: '' }] };
    });
  };

  // normalisasi agar sesuai schema
  const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
  const mapGenderToEnum = (val) => {
    if (!val) return val;
    const v = String(val).toLowerCase();
    if (['laki-laki', 'laki laki', 'pria', 'male', 'l'].includes(v)) return 'laki-laki';
    if (['perempuan', 'wanita', 'female', 'p'].includes(v)) return 'perempuan';
    return val;
  };
  const normalizeEmploymentStatus = (s) => {
    const t = String(s || '').toLowerCase();
    if (t.includes('magang') && t.includes('tidak')) return 'Magang Tidak Aktif';
    if (t.includes('magang') && t.includes('aktif')) return 'Magang Aktif';
    if (t.includes('tidak')) return 'Karyawan Tidak Aktif';
    if (t.includes('aktif')) return 'Karyawan Aktif';
    return s || 'Karyawan Aktif';
  };
  const toIsoDate = (val) => {
    if (!val) return val;
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toISOString().slice(0, 10);
  };
  const cleanObject = (obj) => {
    const out = {};
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (v !== undefined && v !== '' && v !== null) out[k] = v;
    });
    return out;
  };

  // username fallback jika backend tidak mengembalikan langsung
  const deriveUsername = (obj) => {
    if (obj?.username) return obj.username;
    if (obj?.user?.username) return obj.user.username;
    if (obj?.email && obj.email.includes('@')) return obj.email.split('@')[0];
    return '-';
  };

  const fetchUserById = async (uid, tk) => {
    if (!uid) return null;
    try {
      const res = await axios.get(`${API_BASE}/api/users/${uid}`, {
        headers: { Authorization: `Bearer ${tk}` },
        validateStatus: () => true,
      });
      if (res.status >= 200 && res.status < 300) {
        return res.data?.data || res.data || null;
      }
    } catch (_) {}
    return null;
  };

  const validateStep2 = () => {
    const errors = [];
    if (!formData.nama_lengkap?.trim()) errors.push('Nama lengkap wajib diisi.');
    if (!/^\d{16}$/.test(onlyDigits(formData.nik))) errors.push('NIK harus 16 digit angka.');
    if (!/^\S+@\S+\.\S+$/.test(formData.email || '')) errors.push('Format email tidak valid.');
    if (!/^\d{10,15}$/.test(onlyDigits(formData.nomor_telepon))) errors.push('Nomor telepon harus 10-15 digit angka.');
    if (!formData.tanggal_lahir) errors.push('Tanggal lahir wajib diisi.');
    if (formData.tanggal_lahir && new Date(formData.tanggal_lahir) > new Date()) errors.push('Tanggal lahir tidak boleh di masa depan.');
    const g = mapGenderToEnum(formData.jenis_kelamin);
    if (!['laki-laki', 'perempuan'].includes(g || '')) errors.push('Jenis kelamin wajib dipilih.');
    if (!['menikah', 'belum menikah'].includes(formData.status_pernikahan || '')) errors.push('Status pernikahan wajib dipilih.');
    if (!formData.alamat?.trim()) errors.push('Alamat wajib diisi.');
    (formData.riwayat_pendidikan || []).forEach((row, i) => {
      if (!row.jenjang?.trim()) errors.push(`Riwayat pendidikan [${i + 1}] - Jenjang wajib diisi.`);
      if (!row.institusi?.trim()) errors.push(`Riwayat pendidikan [${i + 1}] - Institusi wajib diisi.`);
      const year = Number(row.tahun_lulus);
      if (!year || year < 1900 || year > THIS_YEAR) {
        errors.push(`Riwayat pendidikan [${i + 1}] - Tahun lulus harus antara 1900 dan ${THIS_YEAR}.`);
      }
    });
    return errors;
  };

  /* ============== Fetch list ============== */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/karyawan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.data;
        const list = (data || []).map((it) => ({
          ...it,
          _id: it._id || it.id,
          // simpan user_id & username jika ada
          user_id: it.user_id?._id || it.user_id || it.user?._id || it.user?.id || it.userId,
          username: it.user?.username || it.username, // kalau BE sudah populate
        }));
        setEmployees(list);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchEmployees();
  }, [token, navigate]);

  const filteredEmployees = employees.filter(emp => {
    const t = searchTerm.toLowerCase();
    return (
      emp.nama_lengkap?.toLowerCase().includes(t) ||
      emp.email?.toLowerCase().includes(t) ||
      String(emp.nomor_telepon || '').includes(t) ||
      emp.alamat?.toLowerCase().includes(t) ||
      String(emp.nik || '').includes(t)
    );
  });

  /* ============== Edit flow ============== */
  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...getEmptyForm(),
      nama_lengkap: employee.nama_lengkap || '',
      nik: employee.nik || '',
      email: employee.email || '',
      nomor_telepon: employee.nomor_telepon || '',
      tanggal_lahir: employee.tanggal_lahir ? toIsoDate(employee.tanggal_lahir) : '',
      jenis_kelamin: employee.jenis_kelamin || '',
      status_pernikahan: employee.status_pernikahan || 'belum menikah',
      alamat: employee.alamat || '',
      // fallback kedua nama field:
      status_Karyawan: normalizeEmploymentStatus(
        employee.status_karyawan ?? employee.status_Karyawan
      ),
      riwayat_pendidikan: Array.isArray(employee.riwayat_pendidikan) && employee.riwayat_pendidikan.length
        ? employee.riwayat_pendidikan.map(r => ({
          jenjang: r.jenjang || '',
          institusi: r.institusi || '',
          tahun_lulus: r.tahun_lulus || ''
        }))
        : [{ jenjang: '', institusi: '', tahun_lulus: '' }],
    });
  };

  const closeEditModal = () => {
    setEditingEmployee(null);
    setFormData(getEmptyForm());
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingEmployee?._id) return;

    const errs = validateStep2();
    if (errs.length) {
      alert(errs.join('\n'));
      return;
    }

    try {
      const normalizedStatus = normalizeEmploymentStatus(formData.status_Karyawan);

      const payload = cleanObject({
        nama_lengkap: formData.nama_lengkap.trim(),
        nik: onlyDigits(formData.nik),
        email: formData.email.trim().toLowerCase(),
        nomor_telepon: onlyDigits(formData.nomor_telepon),
        tanggal_lahir: toIsoDate(formData.tanggal_lahir),
        jenis_kelamin: mapGenderToEnum(formData.jenis_kelamin),
        status_pernikahan: formData.status_pernikahan,
        alamat: formData.alamat.trim(),
        // kirim dua kunci agar BE mana pun menangkap
        status_Karyawan: normalizedStatus,
        status_karyawan: normalizedStatus,
        riwayat_pendidikan: (formData.riwayat_pendidikan || []).map(r => ({
          jenjang: r.jenjang.trim(),
          institusi: r.institusi.trim(),
          tahun_lulus: Number(r.tahun_lulus),
        })),
      });

      const res = await axios.put(
        `${API_BASE}/api/karyawan/${editingEmployee._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        const updated = res.data?.data || res.data || {};
        setEmployees(prev =>
          prev.map(emp => {
            if (emp._id !== editingEmployee._id) return emp;
            const newStatus =
              updated.status_karyawan ?? updated.status_Karyawan ?? normalizedStatus;
            return {
              ...emp,
              ...updated,
              status_karyawan: newStatus,
              status_Karyawan: newStatus,
            };
          })
        );
        closeEditModal();
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Gagal mengupdate karyawan: ${msg}`);
      }
    } catch (error) {
      console.error('Update employee failed:', error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Gagal mengupdate karyawan.'
      );
    }
  };

  /* ============== Add flow (2 langkah) ============== */
  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(1);
    setRegisteredUserId(null);
    setFormData(getEmptyForm());
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    setRegisteredUserId(null);
  };

  // Step 1: register user (role karyawan)
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
      const payload = {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        passwordConfirmation: formData.confirmPassword,
        role: 'karyawan',
      };

      const res = await axios.post(
        `${API_BASE}/api/users/register`,
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

      const autoName =
        newUser?.full_name ||
        newUser?.fullName ||
        newUser?.nama_lengkap ||
        newUser?.name ||
        newUser?.displayName ||
        '';

      setRegisteredUserId(newUserId);
      setFormData(prev => ({
        ...prev,
        nama_lengkap: autoName || prev.nama_lengkap,
      }));

      setCurrentStep(2);
    } catch (err) {
      console.error('Register user gagal:', err);
      alert(err.message || 'Gagal mendaftarkan user');
    }
  };

  // Step 2: create karyawan (JSON)
  const createEmployee = async () => {
    const errs = validateStep2();
    if (errs.length) {
      alert(errs.join('\n'));
      return;
    }

    try {
      if (!registeredUserId || !/^[0-9a-fA-F]{24}$/.test(registeredUserId)) {
        alert(`User ID dari Step 1 tidak valid: ${registeredUserId || '(kosong)'}`);
        return;
      }

      const normalizedStatus = normalizeEmploymentStatus(formData.status_Karyawan);

      const payload = cleanObject({
        user_id: registeredUserId,
        nama_lengkap: formData.nama_lengkap.trim(),
        nik: onlyDigits(formData.nik),
        email: formData.email.trim().toLowerCase(),
        nomor_telepon: onlyDigits(formData.nomor_telepon),
        tanggal_lahir: toIsoDate(formData.tanggal_lahir),
        jenis_kelamin: mapGenderToEnum(formData.jenis_kelamin),
        status_pernikahan: formData.status_pernikahan,
        alamat: formData.alamat.trim(),
        // kirim dua kunci:
        status_Karyawan: normalizedStatus,
        status_karyawan: normalizedStatus,
        riwayat_pendidikan: (formData.riwayat_pendidikan || []).map(r => ({
          jenjang: r.jenjang.trim(),
          institusi: r.institusi.trim(),
          tahun_lulus: Number(r.tahun_lulus),
        })),
      });

      const res = await axios.post(
        `${API_BASE}/api/karyawan`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        const created = res.data?.data || res.data || {};
        const newStatus = created.status_karyawan ?? created.status_Karyawan ?? normalizedStatus;
        setEmployees(prev => [
          ...prev,
          { ...created, status_karyawan: newStatus, status_Karyawan: newStatus }
        ]);
        closeAddModal();
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Failed to add employee: ${msg}`);
      }
    } catch (error) {
      console.error('Error adding new employee:', error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to add employee. Please check the data and try again.'
      );
    }
  };

  /* ============== View & Delete ============== */
  const openViewModal = async (employee) => {
    // tampilkan dulu dengan fallback, lalu coba ambil username asli via user_id
    const initial = {
      ...employee,
      username: employee.username || deriveUsername(employee),
    };
    setViewingEmployee(initial);

    const tk = localStorage.getItem('token');
    const uid = employee?.user_id;
    const user = tk && uid ? await fetchUserById(uid, tk) : null;

    if (user?.username || user?.role) {
      setViewingEmployee(prev => ({
        ...prev,
        username: user.username || prev.username || deriveUsername(prev),
      }));
    }
  };

  const closeViewModal = () => setViewingEmployee(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-white">
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Employee Data</h1>

        {/* Search + Add */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-center"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white 
             px-3 py-2 md:px-4 md:py-2 
             rounded-lg hover:bg-blue-700 transition-colors 
             w-full md:w-auto min-w-[160px]"
          >
            <span className="text-sm md:text-base">Add Employee</span>
          </button>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white border-b border-gray-300">
                <tr>
                  {/* kolom pertama mepet kiri */}
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Full Name
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Email
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Phone
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Address
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Gender
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Status
                  </th>
                  {/* HEADER Action kiri agar rata kanan-kiri keseluruhan tapi header kiri */}
                  <th
                    className="pr-4 md:pr-6 py-3 text-left text-sm font-normal text-black tracking-wider w-[1%] whitespace-nowrap"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => {
                    const statusRaw = employee.status_karyawan ?? employee.status_Karyawan ?? '';
                    const isAktif = String(statusRaw).toLowerCase().includes('aktif');
                    return (
                      <tr key={employee._id}>
                        {/* kolom pertama mepet kiri */}
                        <td className="pl-4 md:pl-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.nama_lengkap || '-'}
                        </td>
                        <td className="hidden md:table-cell px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.email || '-'}
                        </td>
                        <td className="hidden sm:table-cell px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.nomor_telepon || '-'}
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.alamat || '-'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.jenis_kelamin || '-'}
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isAktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {statusRaw || '-'}
                          </span>
                        </td>
                        {/* kolom terakhir right aligned + tombol justify-end */}
                        <td className="pr-4 md:pr-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          <div className="inline-flex gap-2 justify-end">
                            <button
                              onClick={() => openEditModal(employee)}
                              className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingEmployee(employee)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => openViewModal(employee)}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
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
            <div className={`bg-white rounded-lg p-6 w-full ${currentStep === 1 ? 'max-w-md' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto`}>
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

                    <div className="grid grid-cols-1 gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 digit)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan NIK"
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
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan nomor telepon"
                        pattern="\d{10,15}"
                        title="Nomor telepon harus 10-15 digit angka"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir}
                        max={MAX_BIRTHDATE}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      >
                        <option value="">Pilih</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Pernikahan</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      >
                        <option value="belum menikah">Belum Menikah</option>
                        <option value="menikah">Menikah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Karyawan</label>
                      <select
                        name="status_Karyawan"
                        value={formData.status_Karyawan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="Karyawan Aktif">Karyawan Aktif</option>
                        <option value="Karyawan Tidak Aktif">Karyawan Tidak Aktif</option>
                        <option value="Magang Aktif">Magang Aktif</option>
                        <option value="Magang Tidak Aktif">Magang Tidak Aktif</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan alamat lengkap"
                        required
                      />
                    </div>
                  </div>

                  {/* Riwayat Pendidikan - Dinamis */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">Riwayat Pendidikan</h5>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addEdu}
                          className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                        >
                          + Row
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEdu((formData.riwayat_pendidikan || []).length - 1)}
                          className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                          disabled={(formData.riwayat_pendidikan || []).length <= 1}
                        >
                          − Row
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {formData.riwayat_pendidikan.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-start">
                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Jenjang</label>
                            <input
                              type="text"
                              value={row.jenjang}
                              onChange={e => handleEduChange(idx, 'jenjang', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="SMA/SMK/D3/S1/S2/..."
                              required
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-6">
                            <label className="block text-xs text-gray-600 mb-1">Institusi</label>
                            <input
                              type="text"
                              value={row.institusi}
                              onChange={e => handleEduChange(idx, 'institusi', e.target.value)}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="Nama Universitas / Sekolah"
                              required
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Tahun Lulus</label>
                            <input
                              type="number"
                              value={row.tahun_lulus}
                              onChange={e => handleEduChange(idx, 'tahun_lulus', e.target.value)}
                              min="1900"
                              max={THIS_YEAR}
                              className="block w-full border border-gray-300 rounded-md py-2 px-3"
                              placeholder="YYYY"
                              required
                            />
                          </div>
                        </div>
                      ))}
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
                      await axios.delete(`${API_BASE}/api/karyawan/${deletingEmployee._id}`, {
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 digit)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan NIK"
                        pattern="\d{16}"
                        required
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
                        placeholder="Masukkan email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan nomor telepon"
                        pattern="\d{10,15}"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir}
                        max={MAX_BIRTHDATE}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      >
                        <option value="">Pilih</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Pernikahan</label>
                      <select
                        name="status_pernikahan"
                        value={formData.status_pernikahan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        required
                      >
                        <option value="belum menikah">Belum Menikah</option>
                        <option value="menikah">Menikah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Karyawan</label>
                      <select
                        name="status_Karyawan"
                        value={formData.status_Karyawan}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="Karyawan Aktif">Karyawan Aktif</option>
                        <option value="Karyawan Tidak Aktif">Karyawan Tidak Aktif</option>
                        <option value="Magang Aktif">Magang Aktif</option>
                        <option value="Magang Tidak Aktif">Magang Tidak Aktif</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        placeholder="Masukkan alamat lengkap"
                        required
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
                      <span className="w-1/3 text-gray-500">Username:</span>
                      <span className="w-2/3 text-gray-900">{deriveUsername(viewingEmployee)}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div className="flex"><span className="w-1/3 text-gray-500">Nama Lengkap:</span><span className="w-2/3 text-gray-900">{viewingEmployee.nama_lengkap || '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">NIK:</span><span className="w-2/3 text-gray-900">{viewingEmployee.nik || '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">Email:</span><span className="w-2/3 text-gray-900">{viewingEmployee.email || '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">Phone:</span><span className="w-2/3 text-gray-900">{viewingEmployee.nomor_telepon || '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">Birth Date:</span><span className="w-2/3 text-gray-900">{viewingEmployee.tanggal_lahir ? toIsoDate(viewingEmployee.tanggal_lahir) : '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">Gender:</span><span className="w-2/3 text-gray-900">{viewingEmployee.jenis_kelamin || '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">Marital Status:</span><span className="w-2/3 text-gray-900">{viewingEmployee.status_pernikahan || '-'}</span></div>
                    <div className="flex"><span className="w-1/3 text-gray-500">Address:</span><span className="w-2/3 text-gray-900">{viewingEmployee.alamat || '-'}</span></div>
                    <div className="flex">
                      <span className="w-1/3 text-gray-500">Employment Status:</span>
                      {(() => {
                        const statusView = viewingEmployee.status_karyawan ?? viewingEmployee.status_Karyawan;
                        const aktif = String(statusView || '').toLowerCase().includes('aktif');
                        return (
                          <span className={`w-2/3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${aktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {statusView || '-'}
                          </span>
                        );
                      })()}
                    </div>
                    {Array.isArray(viewingEmployee.riwayat_pendidikan) && viewingEmployee.riwayat_pendidikan.length > 0 && (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700 mb-1">Riwayat Pendidikan:</span>
                        <ul className="list-disc pl-6 space-y-1">
                          {viewingEmployee.riwayat_pendidikan.map((r, i) => (
                            <li key={i} className="text-gray-900 text-sm">
                              {`${r.jenjang || '-'} • ${r.institusi || '-'} • ${r.tahun_lulus || '-'}`}
                            </li>
                          ))}
                        </ul>
                      </div>
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

export default EmployeeList;
