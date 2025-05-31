import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../assets/images/pp.png';
import axios from 'axios';
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
  Search,
  Plus,
  Eye,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

const ClientList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/clients', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log('Response from API:', response.data);
        const clientsData = Array.isArray(response.data) ? response.data : response.data.data;
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        } else {
          setClients([]);
          console.warn('Clients data is not an array!');
        }
      })
      .catch(error => {
        console.error('Error fetching admin data:', error);
      });
  }, [token]);

  const filteredClients = Array.isArray(clients)
    ? clients.filter(client =>
      client.nama_lengkap &&
      typeof client.nama_lengkap === 'string' &&
      client.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({ ...client });
  };

  const closeEditModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      address: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/clients/${editingClient.id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setClients(prev =>
          prev.map(client => (client.id === editingClient.id ? response.data : client))
        );
        closeEditModal();
      })
      .catch((error) => {
        console.error('Error updating client:', error);
      });
  };

  const openDeleteModal = (client) => setDeletingClient(client);
  const closeDeleteModal = () => setDeletingClient(null);

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/api/clients/${deletingClient.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setClients(prev => prev.filter(client => client.id !== deletingClient.id));
        closeDeleteModal();
      })
      .catch((error) => {
        console.error('Error deleting client:', error);
      });
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      address: '',
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      address: '',
    });
  };

  const saveAdd = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/clients', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        setClients(prev => [...prev, response.data]);
        closeAddModal();
      })
      .catch(error => {
        console.error('Error adding new client:', error);
      });
  };

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
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Employee Data
        </button>
        <button 
          onClick={() => navigate('/client-data')} 
          className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
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
        <div className="p-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Data Admin</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Admin
              </button>
              <div className="flex items-center gap-2">
                <img src={ProfilePic} alt="Profile" className="w-10 h-10 rounded-full" />
                <span className="font-medium">Deni el mares</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.nama_lengkap}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.nomor_telepon}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.jenis_kelamin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.alamat}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(client)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(client)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {editingClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form 
                onSubmit={saveEdit}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-bold mb-4">Edit Klien</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No Hp</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Modal */}
          {deletingClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Hapus Klien</h2>
                <p className="mb-6">Apakah Anda yakin ingin menghapus klien <strong>{deletingClient.name}</strong>?</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form 
                onSubmit={saveAdd}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-bold mb-4">Tambah Klien</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No Hp</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientList;