import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/manager/UserProfile.css';
import ProfilePic from '../../assets/images/pp.png';

const UserProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logika logout bisa diisi sesuai autentikasi kamu
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <img src={ProfilePic} alt="Foto Profil" className="user-profile-image" />
        <h2 className="user-name">Deni El Mares</h2>
        <p className="user-role">Manager</p>

        <div className="user-profile-actions">
          <button onClick={() => navigate('/view-profile')} className="profile-btn">
            <i className="fas fa-user-circle"></i> Lihat Profil
          </button>
          <button onClick={() => navigate('/edit-profile')} className="profile-btn">
            <i className="fas fa-edit"></i> Edit Profil
          </button>
          <button onClick={handleLogout} className="profile-btn logout">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
