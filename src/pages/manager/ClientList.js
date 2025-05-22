import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../../style/manager/EmployeeList.css';
import ProfilePic from '../../assets/images/pp.png';
import axios from 'axios';

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
    <div className="dashboard-container">
       {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">B</div>
          <span className="logo-text">Bytelogic</span>
        </div>
        <h1 className="sidebar-menu-title">MENU</h1>
        <div className="sidebar-menu">
          <button onClick={() => navigate('/dashboard-manager')} className="sidebar-btn">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          <button onClick={() => navigate('/admin-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Admin Data
          </button>
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Employee Data
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn active">
            <i className="fas fa-folder-open"></i> Client Data
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Project Data
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="sidebar-btn">
            <i className="fas fa-chart-line"></i> Client Evaluation
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Client Review 
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-right">
            <div className="search-container">
              <input type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <i className="fas fa-search search-icon"></i>
            </div>
            <div className="profile">
              <img src={ProfilePic} alt="Profil" className="profile-pic" />
              <span className="profile-name">Deni el mares</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <h1 className="dashboard-title">Data Klien</h1>

        <button className="add-employee-button" onClick={openAddModal}>
          Tambah Karyawan
        </button>

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
