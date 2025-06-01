import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../assets/images/profile.jpg';
import axios from 'axios';
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
  X
} from 'lucide-react';

const AdminList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [managers, setManagers] = useState([]);
  const [editingManager, setEditingManager] = useState(null);
  const [deletingManager, setDeletingManager] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    address: '', 
    phone: '', 
    dob: '', 
    gender: '', 
    education: '', 
    maritalStatus: '', 
    nik: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/managers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        setManagers(Array.isArray(data) ? data : []);
      })
      .catch(error => console.error('Error fetching admin data:', error));
  }, [token]);

  const filteredManagers = managers.filter(manager =>
    manager.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (manager) => {
    setEditingManager(manager);
    setFormData({ ...manager });
  };

  const closeEditModal = () => {
    setEditingManager(null);
    setFormData({ 
      name: '', 
      email: '', 
      address: '', 
      phone: '', 
      dob: '', 
      gender: '', 
      education: '', 
      maritalStatus: '', 
      nik: '' 
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
        setManagers(prev => prev.map(manager => (manager.id === editingManager.id ? response.data : manager)));
        closeEditModal();
      })
      .catch((error) => console.error('Error updating manager:', error));
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({ 
      name: '', 
      email: '', 
      address: '', 
      phone: '', 
      dob: '', 
      gender: '', 
      education: '', 
      maritalStatus: '', 
      nik: '' 
    });
  };

  const closeAddModal = () => setShowAddModal(false);

  const saveAdd = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/managers', formData, {
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font mb-6">MENU</h1>
        <button onClick={() => navigate('/dashboard-manager')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Home size={18} /> Dashboard
        </button>
        <button onClick={() => navigate('/admin-list')} className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left">
          <Folder size={18} /> Admin Data
        </button>
        <button onClick={() => navigate('/employee-list')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Employee Data
        </button>
        <button onClick={() => navigate('/client-data')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Folder size={18} /> Client Data
        </button>
        <button onClick={() => navigate('/data-project')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <Briefcase size={18} /> Project Data
        </button>
        <button onClick={() => navigate('/employee-evaluation')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <ChartBar size={18} /> Evaluation
        </button>
        <button onClick={() => navigate('/customer-reviews')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Profile Section - Top Right */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <img src={ProfilePic} alt="Profile" className="w-10 h-10 rounded-full" />
            <span className="font-medium">Deni el mares</span>
          </div>
        </div>

        {/* Judul Section */}
        <h1 className="text-2xl font-bold mb-6">Data Admin</h1>

        {/* Search and Action Section */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-4 mr-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ width: '200px' }}
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            <button 
              onClick={openAddModal} 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Add Admin
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Date of Birth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Educational Background</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Marital status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredManagers.length > 0 ? filteredManagers.map(manager => (
                <tr key={manager.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{manager.nama_lengkap}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.nomor_telepon}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.alamat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.tanggal_lahir}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.jenis_kelamin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.nik}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {manager.riwayat_pendidikan?.map(item => `${item.jenjang} - ${item.institusi} - ${item.tahun_lulus}`).join(", ") || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.status_pernikahan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(manager)} 
                        className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Edit2 size={16} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => setDeletingManager(manager)} 
                        className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tambah Admin Baru</h3>
                <button 
                  onClick={closeAddModal} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={saveAdd}>
                <div className="space-y-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alamat</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Male">Laki-laki</option>
                      <option value="Female">Perempuan</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Pernikahan</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="Single">Belum Menikah</option>
                      <option value="Married">Menikah</option>
                      <option value="Divorced">Cerai</option>
                    </select>
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NIK</label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Admin</h3>
                <button 
                  onClick={closeEditModal} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={saveEdit}>
                <div className="space-y-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alamat</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Male">Laki-laki</option>
                      <option value="Female">Perempuan</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Pernikahan</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Single">Belum Menikah</option>
                      <option value="Married">Menikah</option>
                      <option value="Divorced">Cerai</option>
                    </select>
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NIK</label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleEditChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Hapus Admin</h3>
                <button 
                  onClick={() => setDeletingManager(null)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Apakah Anda yakin ingin menghapus admin {deletingManager.nama_lengkap}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingManager(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
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
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminList;