// src/pages/client/ClientList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopbarProfile from '../../components/TopbarProfile';
import Sidebar from '../../components/SideBar';
import { Search, X } from 'lucide-react';

const ClientList = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // simpan user id hasil register step 1
  const [registeredUserId, setRegisteredUserId] = useState(null);

  const [formData, setFormData] = useState({
    // step 1
    username: '',
    password: '',
    confirmPassword: '',

    // step 2 (profil client)
    nama_lengkap: '',
    email: '',
    alamat: '',
    nomor_telepon: '',
    // foto_profile diabaikan (opsional), tidak dikirim bila kosong
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get("http://be.bytelogic.orenjus.com/api/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        let clientsData = [];
        if (Array.isArray(response.data)) {
          clientsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          clientsData = response.data.data;
        } else if (response.data?.result && Array.isArray(response.data.result)) {
          clientsData = response.data.result;
        } else {
          throw new Error("Format data tidak valid");
        }

        const validatedData = clientsData.map(item => ({
          _id: item._id || Math.random().toString(36).substr(2, 9),
          nama_lengkap: item.nama_lengkap || 'Nama tidak tersedia',
          email: item.email || 'Email tidak tersedia',
          alamat: item.alamat || 'Alamat tidak tersedia',
          nomor_telepon: item.nomor_telepon || '-',
          createdAt: item.createdAt || new Date().toISOString()
        }));

        setClients(validatedData);
      } catch (err) {
        console.error("Error fetching clients:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
        } else {
          setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengambil data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [navigate]);

  /* =========================
     Helpers & Handlers
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setCurrentStep(1);
    setRegisteredUserId(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      nama_lengkap: '',
      email: '',
      alamat: '',
      nomor_telepon: '',
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCurrentStep(1);
    setRegisteredUserId(null);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData({
      username: '', // tidak diedit di sini
      password: '',
      confirmPassword: '',
      nama_lengkap: client.nama_lengkap,
      email: client.email,
      alamat: client.alamat,
      nomor_telepon: client.nomor_telepon,
    });
  };

  const closeEditModal = () => {
    setEditingClient(null);
  };

  const handleViewClient = (client) => setViewingClient(client);
  const handleDeleteClient = (client) => setDeletingClient(client);

  /* =========================
     Step 1: Register user (role client)
  ========================== */
  const handleRegister = async () => {
    try {
      if (!formData.username || !formData.password || !formData.confirmPassword) {
        alert("Mohon isi username, password, dan confirm password");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Password and Confirm Password do not match");
        return;
      }

      const registerPayload = {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        passwordConfirmation: formData.confirmPassword, // jaga2
        role: "client",
      };

      const response = await axios.post(
        "http://be.bytelogic.orenjus.com/api/users/register",
        registerPayload,
        { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true }
      );

      if (response.status >= 400) {
        const msg = response.data?.message || response.data?.error || `Register failed (${response.status})`;
        throw new Error(msg);
      }

      // fleksibel ambil user baru dari berbagai kemungkinan field respons
      const newUser = response.data?.data || response.data?.user || response.data;
      const newUserId = newUser?._id || newUser?.id;
      if (!newUserId) throw new Error("User ID tidak ditemukan pada respons register");

      // simpan user id hasil register (dipakai saat create client)
      setRegisteredUserId(newUserId);

      // AUTO-FILL: nama & email jika tersedia
      setFormData(prev => ({
        ...prev,
        nama_lengkap: newUser.full_name || newUser.nama_lengkap || prev.nama_lengkap,
        email: newUser.email || prev.email,
      }));

      alert("User registered successfully. Continue to fill client info.");
      setCurrentStep(2);
    } catch (error) {
      console.error("Register error:", error);
      alert(error?.message || error?.response?.data?.message || "Failed to register. Please try again.");
    }
  };

  /* =========================
     Step 2: Create client (pakai registeredUserId)
  ========================== */
  const saveAdd = async () => {
    try {
      if (!registeredUserId) {
        alert("User belum terdaftar. Selesaikan Step 1 terlebih dahulu.");
        setCurrentStep(1);
        return;
      }

      const token = localStorage.getItem("token");

      const payload = {
        user_id: registeredUserId,
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        nomor_telepon: formData.nomor_telepon,
        alamat: formData.alamat,
        // foto_profile tidak dikirim bila tidak ada
      };

      const response = await axios.post(
        "http://be.bytelogic.orenjus.com/api/clients",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const created = response.data?.data || response.data;
        setClients(prev => [...prev, created]);
        closeAddModal();
      } else {
        const msg = response.data?.message || response.data?.error || `HTTP ${response.status}`;
        alert(`Failed to add client: ${msg}`);
      }
    } catch (error) {
      console.error("Error adding new client:", error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add client. Please check the data and try again."
      );
    }
  };

  /* =========================
     Edit & Delete Existing
  ========================== */
  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://be.bytelogic.orenjus.com/api/clients/${editingClient._id}`,
        {
          nama_lengkap: formData.nama_lengkap,
          email: formData.email,
          alamat: formData.alamat,
          nomor_telepon: formData.nomor_telepon,
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        const updated = res.data?.data || res.data;
        setClients(prev => prev.map(c => (c._id === editingClient._id ? { ...c, ...updated } : c)));
        setEditingClient(null);
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Gagal mengupdate client: ${msg}`);
      }
    } catch (error) {
      console.error("Gagal mengupdate client:", error);
      alert(error?.response?.data?.message || "Gagal mengupdate client. Coba lagi.");
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://be.bytelogic.orenjus.com/api/clients/${deletingClient._id}`,
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        setClients(prev => prev.filter(c => c._id !== deletingClient._id));
        setDeletingClient(null);
      } else {
        const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
        alert(`Gagal menghapus client: ${msg}`);
      }
    } catch (error) {
      console.error("Gagal menghapus client:", error);
      setError("Gagal menghapus client. Silakan coba lagi.");
    }
  };

  /* =========================
     Filter
  ========================== */
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      client.nama_lengkap?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.nomor_telepon?.includes(term) ||
      client.alamat?.toLowerCase().includes(term)
    );
  });

  /* =========================
     UI States
  ========================== */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat data client...</p>
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
            onClick={() => window.location.reload()}
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
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Client Data</h1>

        {/* Search and Action Section */}
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
            <span className="text-sm md:text-base">Add Client</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <tr key={client._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.nama_lengkap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.nomor_telepon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.alamat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                          <button
                            onClick={() => handleViewClient(client)}
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
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Add Client</h3>
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                        placeholder="Re-enter Password"
                      />
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
                      onClick={handleRegister}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-md font-medium mb-4 pb-2 border-b-2 border-gray-300">Personal Information</h4>
                  {/* Username & pilih username TIDAK ditampilkan. user_id diambil dari Step 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="nomor_telepon"
                        value={formData.nomor_telepon}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
                      onClick={saveAdd}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Client
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Client</h3>
                <button
                  onClick={() => setDeletingClient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Are you sure you want to delete {deletingClient.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingClient(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Client</h3>
              </div>
              <form onSubmit={saveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Client Details</h3>
                <button
                  onClick={() => setViewingClient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingClient.nama_lengkap}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingClient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingClient.nomor_telepon}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingClient.alamat}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingClient(null)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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

export default ClientList;
