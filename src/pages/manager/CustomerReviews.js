import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/manager/EmployeeList.css';
import ProfilePic from '../../assets/images/pp.png';

const CustomerReviews = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([
    { id: 1, clientName: 'Andi Rahman', project: 'Website Toko', rating: 4, comment: 'Pelayanan cepat dan hasil memuaskan!', date: '2025-04-25' },
    { id: 2, clientName: 'Sinta Putri', project: 'Mobile App', rating: 5, comment: 'Aplikasi bagus dan user-friendly.', date: '2025-04-26' },
  ]);

  const [newReview, setNewReview] = useState({ clientName: '', project: '', rating: '', comment: '', date: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const openAddModal = () => {
    setNewReview({ clientName: '', project: '', rating: '', comment: '', date: '' });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const addReview = (e) => {
    e.preventDefault();
    const newId = reviews.length ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    setReviews([...reviews, { id: newId, ...newReview }]);
    closeAddModal();
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
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
          <button onClick={() => navigate('/employee-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Karyawan
          </button>
          <button onClick={() => navigate('/client-data')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Klien
          </button>
          <button onClick={() => navigate('/admin-list')} className="sidebar-btn">
            <i className="fas fa-folder-open"></i> Data Admin
          </button>
          <button onClick={() => navigate('/data-project')} className="sidebar-btn">
            <i className="fas fa-briefcase"></i> Data Project
          </button>
          <button onClick={() => navigate('/employee-evaluation')} className="sidebar-btn">
            <i className="fas fa-chart-line"></i> Evaluasi Karyawan
          </button>
          <button onClick={() => navigate('/customer-reviews')} className="sidebar-btn active">
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
        <h1 className="dashboard-title">Review Pelanggan</h1>

        {/* Table Section */}
        <div className="table-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Klien</th>
                <th>Komentar</th>
                <th>Rating</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <tr key={review.id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{review.clientName}</td>
                    <td>{review.comment}</td>
                    <td>{'⭐'.repeat(review.rating)}</td>
                    <td>{review.date}</td>
                    <td>
                      <button className="delete-button" onClick={() => deleteReview(review.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
                    Tidak ada review pelanggan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={addReview}>
              <h2>Tambah Review</h2>
              <label>Nama Klien</label>
              <input name="clientName" value={newReview.clientName} onChange={handleInputChange} required />
              <label>Proyek</label>
              <input name="project" value={newReview.project} onChange={handleInputChange} required />
              <label>Rating (1-5)</label>
              <input type="number" name="rating" value={newReview.rating} onChange={handleInputChange} min="1" max="5" required />
              <label>Komentar</label>
              <textarea name="comment" value={newReview.comment} onChange={handleInputChange} required />
              <label>Tanggal</label>
              <input type="date" name="date" value={newReview.date} onChange={handleInputChange} required />
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

export default CustomerReviews;
