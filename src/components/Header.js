import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";

// URL fallback gambar profil kosong
const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";

const Header = () => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role"); // pastikan role disimpan saat login

        if (!token || !userRole) return;

        setRole(userRole);

        // Tentukan endpoint berdasarkan role
        let endpoint = "";
        if (userRole === "client") {
          endpoint = "http://localhost:5000/api/clients/profile";
        } else if (userRole === "karyawan") {
          endpoint = "http://localhost:5000/api/karyawan/profile";
        } else {
          console.warn("Role tidak dikenali:", userRole);
          return;
        }

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data =
          userRole === "client"
            ? response.data.data.client
            : response.data.data.karyawan;

        setProfile({
          name: data.nama_lengkap,
          email: data.email,
          avatar: data.foto_profile || defaultAvatar,
        });
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);
    navigate("/profile/edit");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-base sm:text-lg md:text-xl font-bold text-blue-500">
              Bytelogic
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
              <FiBell size={20} />
            </button>
            {profile && (
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={profile.avatar}
                      alt="User avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <div className="ml-2 text-left">
                      <div className="text-sm font-medium text-gray-800">
                        {profile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {profile.email}
                      </div>
                    </div>
                    {isProfileDropdownOpen ? (
                      <FiChevronUp className="ml-1 h-4 w-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>

                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <button
                      onClick={handleEditProfile}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
