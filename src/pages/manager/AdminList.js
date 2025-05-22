import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../assets/images/pp.png';
import axios from 'axios';

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
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/managers', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log('Response from API:', response.data);
        // Jika response.data adalah objek dengan properti data yang berupa array
        const managersData = Array.isArray(response.data) ? response.data : response.data.data;
        if (Array.isArray(managersData)) {
          setManagers(managersData);
        } else {
          setManagers([]); // Set kosong kalau bukan array
          console.warn('Managers data is not an array!');
        }
      })
      .catch(error => {
        console.error('Error fetching admin data:', error);
      });
  }, [token]);

  console.log(managers);

  const filteredManagers = Array.isArray(managers)
    ? managers.filter(manager =>
      manager.nama_lengkap &&
      typeof manager.nama_lengkap === 'string' &&
      manager.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];


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
      nik: '',
      education: '',
      maritalStatus: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/managers/${editingManager.id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setManagers(prev =>
          prev.map(manager => (manager.id === editingManager.id ? response.data : manager))
        );
        closeEditModal();
      })
      .catch((error) => {
        console.error('Error updating manager:', error);
      });
  };

  const openDeleteModal = (manager) => setDeletingManager(manager);
  const closeDeleteModal = () => setDeletingManager(null);

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/api/managers/${deletingManager.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setManagers(prev => prev.filter(manager => manager.id !== deletingManager.id));
        closeDeleteModal();
      })
      .catch((error) => {
        console.error('Error deleting manager:', error);
      });
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
      nik: '',
      education: '',
      maritalStatus: '',
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      email: '',
      address: '',
      phone: '',
      dob: '',
      gender: '',
      nik: '',
      education: '',
      maritalStatus: '',
    });
  };

  const saveAdd = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/managers', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        setManagers(prev => [...prev, response.data]);
        closeAddModal();
      })
      .catch(error => {
        console.error('Error adding new manager:', error);
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
          <button onClick={() => navigate('/admin-list')} className="sidebar-btn active">
            <i className="fas fa-folder-open"></i> Admin Data
          </button>
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Employee Data
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn">
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
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            <div className="profile">
              <img src={ProfilePic} alt="Profil" className="profile-pic" />
              <span className="profile-name">Deni el mares</span>
            </div>
          </div>
        </div>

        <h1 className="dashboard-title">Data Admin</h1>
        <button className="add-employee-button" onClick={openAddModal}>Tambah Admin</button>

        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>NIK</th>
                <th>Educational Background</th>
                <th>Marital Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map(manager => (
                  <tr key={manager.id}>
                    <td>{manager.nama_lengkap}</td>
                    <td>{manager.email}</td>
                    <td>{manager.nomor_telepon}</td>
                    <td>{manager.alamat}</td>
                    <td>{manager.tanggal_lahir}</td>
                    <td>{manager.jenis_kelamin}</td>
                    <td>{manager.nik}</td>
                    <td>
                      {manager.riwayat_pendidikan && manager.riwayat_pendidikan.length > 0
                        ? manager.riwayat_pendidikan
                          .map(item => `${item.jenjang} - ${item.institusi} - ${item.tahun_lulus}`)
                          .join(", ")
                        : "-"}
                    </td>
                    <td>{manager.status_pernikahan}</td>
                    <td className="actions-cell">
                      <button className="edit-button" onClick={() => openEditModal(manager)}>Edit</button>
                      <button className="delete-button" onClick={() => openDeleteModal(manager)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '1rem' }}>Tidak ada data ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit */}
        {(editingManager || showAddModal) && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={editingManager ? saveEdit : saveAdd}>
              <h2>{editingManager ? 'Edit Manager' : 'Tambah Manager'}</h2>
              {['name', 'email', 'phone', 'address', 'dob', 'gender', 'nik', 'education', 'maritalStatus'].map(field => (
                <React.Fragment key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleEditChange}
                    required
                    type={field === 'email' ? 'email' : 'text'}
                  />
                </React.Fragment>
              ))}
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={editingManager ? closeEditModal : closeAddModal}>Batal</button>
                <button type="submit" className="btn-save">{editingManager ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Hapus */}
        {deletingManager && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Hapus Manager</h2>
              <p>Yakin ingin menghapus <strong>{deletingManager.name}</strong>?</p>
              <div className="modal-buttons">
                <button className="btn-cancel" onClick={closeDeleteModal}>Batal</button>
                <button className="btn-delete" onClick={confirmDelete}>Hapus</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminList;
