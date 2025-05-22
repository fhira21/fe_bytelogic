import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/manager/EmployeeList.css'; 
import ProfilePic from '../../assets/images/pp.png';

const AdminList = () => {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([
    { id: 1, name: 'Dina Kartika', email: 'dina.admin@gmail.com', address: 'Bandung', phone: '08122334455' },
    { id: 2, name: 'Budi Prasetyo', email: 'budi.admin@gmail.com', address: 'Semarang', phone: '08123456789' },
  ]);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone.includes(searchTerm)
  );

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({ ...admin });
  };

  const closeEditModal = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', address: '', phone: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    setAdmins(prev =>
      prev.map(admin => (admin.id === editingAdmin.id ? { ...editingAdmin, ...formData } : admin))
    );
    closeEditModal();
  };

  const openDeleteModal = (admin) => {
    setDeletingAdmin(admin);
  };

  const closeDeleteModal = () => {
    setDeletingAdmin(null);
  };

  const confirmDelete = () => {
    setAdmins(prev => prev.filter(admin => admin.id !== deletingAdmin.id));
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
    const newAdmin = {
      id: admins.length ? Math.max(...admins.map(a => a.id)) + 1 : 1,
      ...formData,
    };
    setAdmins(prev => [...prev, newAdmin]);
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
          <button onClick={() => navigate('/admin-list')} className="sidebar-btn active">
            <i className="fas fa-folder-open"></i> Data Admin
          </button>
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Karyawan
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Klien
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Project
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="sidebar-btn">
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
        <h1 className="dashboard-title">Data Admin</h1>

        <button className="add-employee-button" onClick={openAddModal}>
              Tambah Admin
            </button>

        {/* Admin Table */}
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
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td className="font-semibold">{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.address}</td>
                    <td>{admin.phone}</td>
                    <td className="actions-cell">
                      <button className="edit-button" onClick={() => openEditModal(admin)}>Edit</button>
                      <button className="delete-button" onClick={() => openDeleteModal(admin)}>Hapus</button>
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

        {/* Modals */}
        {editingAdmin && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={saveEdit}>
              <h2>Edit Admin</h2>
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

        {deletingAdmin && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Hapus Admin</h2>
              <p>Apakah Anda yakin ingin menghapus admin <strong>{deletingAdmin.name}</strong>?</p>
              <div className="modal-buttons">
                <button className="btn-cancel" onClick={closeDeleteModal}>Batal</button>
                <button className="btn-delete" onClick={confirmDelete}>Hapus</button>
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={saveAdd}>
              <h2>Tambah Admin</h2>
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

export default AdminList;
