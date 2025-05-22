import React from 'react';
import '../../style/manager/ViewProfile.css';
import ProfilePic from '../../assets/images/pp.png';

const ViewProfile = () => {
  // Contoh data user, nanti bisa diganti dari API/backend
  const user = {
    name: 'Deni El Mares',
    email: 'deni@example.com',
    role: 'Manager',
    phone: '08123456789',
  };

  return (
    <div className="view-profile-container">
      <div className="profile-card">
        <img src={ProfilePic} alt="Foto Profil" className="profile-image" />
        <h2>{user.name}</h2>
        <p>{user.role}</p>

        <div className="profile-details">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telepon:</strong> {user.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
