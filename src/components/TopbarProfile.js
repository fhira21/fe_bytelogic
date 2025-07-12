// components/TopbarProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, X } from 'lucide-react';
import ProfilePic from '../assets/images/profile.jpg';

const TopbarProfile = () => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/managers/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setManagerProfile({
          loading: false,
          data: response.data.data,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching manager profile:", error);
        setManagerProfile({
          loading: false,
          data: null,
          error: "Gagal mengambil profil",
        });
      }
    };

    fetchManagerProfile();
  }, []);

  return (
    <div className="flex justify-end mb-4">
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onMouseEnter={() => setShowProfileDropdown(true)}
          onMouseLeave={() => setShowProfileDropdown(false)}
        >
          <img
            src={
              managerProfile.data?.foto_profile
                ? `http://localhost:5000${managerProfile.data.foto_profile}`
                : ProfilePic
            }
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="hidden md:block">
            <p className="font-medium text-sm">
              {managerProfile.loading
                ? "Loading..."
                : managerProfile.data?.nama_lengkap || "Unknown"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {managerProfile.data?.email || "unknown@gmail.com"}
            </p>
          </div>
        </div>
        
        {showProfileDropdown && (
          <div
            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <div className="px-4 py-3 border-b">
              <p className="font-medium text-gray-800">{managerProfile.data?.nama_lengkap}</p>
              <p className="text-sm text-gray-500 truncate">{managerProfile.data?.email}</p>
            </div>

            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
              onClick={(e) => {
                e.preventDefault();
                navigate('/profile');
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                navigate('/login');
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopbarProfile;