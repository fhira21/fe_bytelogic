import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../style/manager/DataKlien.css';
import ProfilePic from '../../assets/images/pp.png';

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data from backend
  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/clients', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format from server');
      }

      setClients(response.data);
      setFilteredClients(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch clients');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Apply search filter
  useEffect(() => {
    const filtered = clients.filter(client => 
      client.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nomor_telepon?.includes(searchTerm) ||
      client.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchClients(); // Refresh data
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">B</div>
          <span className="logo-text">Bytelogic</span>
        </div>
        <h1 className="sidebar-menu-title">MENU</h1>
        <div className="sidebar-menu">
          <button onClick={() => navigate('/dashboard-manager')} className="sidebar-btn active">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          <button onClick={() => navigate('/data-karyawan')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Karyawan
          </button>
          <button onClick={() => navigate('/data-admin')} className="sidebar-btn">
            <i className="fas fa-users"></i> Data Admin
          </button>
          <button onClick={() => navigate('/data-klien')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Klien
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Project
          </button>
          <button onClick={() => navigate('/evaluation')} className="sidebar-btn">
            <i className="fas fa-chart-line"></i> Evaluasi Karyawan
          </button>
          <button onClick={() => navigate('/reviews')} className="sidebar-btn">
            <i className="fas fa-star"></i> Review Pelanggan
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="breadcrumbs">
            <h2>Data Klien</h2>
          </div>
          <div className="topbar-right">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            <button className="add-client-btn" onClick={() => navigate('/tambah-klien')}>
              + Tambah Klien
            </button>
            <div className="profile">
              <img src={ProfilePic} alt="Profile" className="profile-pic" />
              <span className="profile-name">Admin</span>
            </div>
          </div>
        </div>

        <div className="client-table-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr key={client._id}>
                    <td>{client.nama_lengkap}</td>
                    <td>{client.email}</td>
                    <td>{client.nomor_telepon}</td>
                    <td>{client.alamat}</td>
                    <td className="actions">
                      <button 
                        className="edit-btn"
                        onClick={() => navigate(`/edit-klien/${client._id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(client._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ClientList;