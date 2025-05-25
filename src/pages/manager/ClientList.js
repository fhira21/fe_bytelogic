import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../../style/manager/EmployeeList.css';
import ProfilePic from '../../assets/images/pp.png';
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
  })
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
        // Jika response.data adalah objek dengan properti data yang berupa array
        const clientsData = Array.isArray(response.data) ? response.data : response.data.data;
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        } else {
          setClients([]); // Set kosong kalau bukan array
          console.warn('Clients data is not an array!');
        }
      })
      .catch(error => {
        console.error('Error fetching admin data:', error);
      });
  }, [token]);

  console.log(clients);

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
            <button onClick={() => navigate('/employee-list')} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded mb-2">
              <Folder size={18} /> Employee Data
            </button>
            <button onClick={() => navigate('/client-data')} className="flex items-center gap-2 bg-gray-300 p-2 rounded mb-2">
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

        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Nama</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.nama_lengkap}</td>
                    <td>{client.email}</td>
                    <td>{client.nomor_telepon}</td>
                    <td>{client.jenis_kelamin}</td>
                    <td>{client.alamat}</td>
                    <td className="actions-cell">
                      <button className="edit-button" onClick={() => openEditModal(client)}>Edit</button>
                      <button className="delete-button" onClick={() => openDeleteModal(client)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingClient && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={saveEdit}>
              <h2>Edit Klien</h2>
              <label>Nama</label>
              <input name="name" value={formData.name} onChange={handleEditChange} required />
              <label>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleEditChange} required />
              <label>Alamat</label>
              <input name="address" value={formData.address} onChange={handleEditChange} required />
              <label>No Hp</label>
              <input name="phone" value={formData.phone} onChange={handleEditChange} required />
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={closeEditModal}>Batal</button>
                <button type="submit" className="btn-save">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Modal */}
        {deletingClient && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Hapus Klien</h2>
              <p>Apakah Anda yakin ingin menghapus klien <strong>{deletingClient.name}</strong>?</p>
              <div className="modal-buttons">
                <button className="btn-cancel" onClick={closeDeleteModal}>Batal</button>
                <button className="btn-delete" onClick={confirmDelete}>Hapus</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={saveAdd}>
              <h2>Tambah Klien</h2>
              <label>Nama</label>
              <input name="name" value={formData.name} onChange={handleEditChange} required />
              <label>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleEditChange} required />
              <label>Alamat</label>
              <input name="address" value={formData.address} onChange={handleEditChange} required />
              <label>No Hp</label>
              <input name="phone" value={formData.phone} onChange={handleEditChange} required />
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={closeAddModal}>Batal</button>
                <button type="submit" className="btn-save">Tambah</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientList;
