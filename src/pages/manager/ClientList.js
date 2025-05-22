import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/manager/EmployeeList.css';
import ProfilePic from '../../assets/images/pp.png';

const ClientList = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([
    { id: 1, name: 'Andi Wijaya', email: 'andi.client@gmail.com', address: 'Jakarta', phone: '0811112233' },
    { id: 2, name: 'Siti Lestari', email: 'siti.client@gmail.com', address: 'Yogyakarta', phone: '0822333444' },
  ]);

  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
  const [deletingClient, setDeletingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({ ...client });
  };

  const closeEditModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', address: '', phone: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    setClients(prev =>
      prev.map(client => (client.id === editingClient.id ? { ...editingClient, ...formData } : client))
    );
    closeEditModal();
  };

  const openDeleteModal = (client) => {
    setDeletingClient(client);
  };

  const closeDeleteModal = () => {
    setDeletingClient(null);
  };

  const confirmDelete = () => {
    setClients(prev => prev.filter(client => client.id !== deletingClient.id));
    closeDeleteModal();
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({ name: '', email: '', address: '', phone: '' });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: '', email: '', address: '', phone: '' });
  };

  const saveAdd = (e) => {
    e.preventDefault();
    const newClient = {
      id: clients.length ? Math.max(...clients.map(c => c.id)) + 1 : 1,
      ...formData,
    };
    setClients(prev => [...prev, newClient]);
    closeAddModal();
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
            <i className="fas fa-folder-open"></i> Data Admin
          </button>
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Karyawan
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn active">
            <i className="fas fa-folder-open"></i> Data Klien
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Project
          </button>
          <button onClick={() => navigate('/manager/employee-evaluation')} className="sidebar-btn">
            <i className="fas fa-chart-line"></i> Evaluasi Karyawan
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Review Pelanggan
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
                <th>Nama</th>
                <th>Email</th>
                <th>Alamat</th>
                <th>No Hp</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr key={client.id}>
                    <td className="font-semibold">{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.address}</td>
                    <td>{client.phone}</td>
                    <td className="actions-cell">
                      <button className="edit-button" onClick={() => openEditModal(client)}>Edit</button>
                      <button className="delete-button" onClick={() => openDeleteModal(client)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
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
