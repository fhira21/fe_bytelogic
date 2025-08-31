// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import axios from "axios";

const API_BASE = "https://be.bytelogic.orenjus.com";
const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";

function normalizeRole(raw) {
  const r = String(raw || "").trim().toLowerCase();
  if (r.includes("manager")) return "manajer";
  if (r.includes("client")) return "klien";
  return r; // "admin", "karyawan", "klien", "manajer"
}

const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:image");

function resolveAvatarSrc(v, nonce) {
  if (!v) return defaultAvatar;
  const s = String(v).trim();
  if (isDataUrl(s)) return s;
  if (/^https?:\/\//i.test(s)) {
    const sep = s.includes("?") ? "&" : "?";
    return `${s}${sep}t=${nonce}`;
  }
  if (s.startsWith("/")) return `${API_BASE}${s}?t=${nonce}`;
  return defaultAvatar;
}

function getProfileEndpoint(role) {
  if (role === "klien") return `${API_BASE}/api/clients/profile`;
  if (role === "karyawan") return `${API_BASE}/api/karyawan/profile`;
  if (role === "manajer" || role === "admin") return `${API_BASE}/api/managers/profile`;
  return null;
}

export default function Header() {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [role, setRole] = useState(null);

  // data profil (avatarPath = path mentah dari server)
  const [profile, setProfile] = useState({
    name: "User",
    email: "unknown@gmail.com",
    avatarPath: "",
  });

  // Nonce untuk bust cache avatar
  const [avatarNonce, setAvatarNonce] = useState(Date.now());

  const fetchProfile = async (forcedNonce) => {
    try {
      const token = localStorage.getItem("token");
      const storedRole = normalizeRole(localStorage.getItem("role"));
      if (!token || !storedRole) return;

      setRole(storedRole);
      const endpoint = getProfileEndpoint(storedRole);
      if (!endpoint) return;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data;
      if (storedRole === "klien") {
        data = response.data?.data?.client || response.data?.data || {};
      } else if (storedRole === "karyawan") {
        data = response.data?.data?.karyawan || response.data?.data || {};
      } else {
        data = response.data?.data || {};
      }

      setProfile({
        name: data.nama_lengkap || data.username || "User",
        email: data.email || "unknown@gmail.com",
        avatarPath: data.foto_profile || "",
      });

      setAvatarNonce(forcedNonce || Date.now());
    } catch (error) {
      console.error("Gagal mengambil data profil:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    fetchProfile();
    const onUpdated = () => fetchProfile(Date.now());
    window.addEventListener("profile:updated", onUpdated);
    return () => window.removeEventListener("profile:updated", onUpdated);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);

    if (role === "karyawan") {
      navigate("/karyawan/profile");
    } else if (role === "manajer" || role === "admin") {
      navigate("/profile");
    } else if (role === "klien") {
      navigate("/klien/profile");
    } else {
      navigate("/");
    }
  };

  const isManagerLike = role === "manajer" || role === "admin";
  const isEmployeeOrClient = role === "karyawan" || role === "klien";

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
            <div className="relative ml-3">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                {/* avatar di topbar tetap ada */}
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={resolveAvatarSrc(profile.avatarPath, avatarNonce)}
                  alt="User avatar"
                  onClick={() => setAvatarNonce(Date.now())}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
                <div className="ml-2 text-left">
                  <div className="text-sm font-medium text-gray-800">
                    {profile.name}
                  </div>
                  <div className="text-xs text-gray-500">{profile.email}</div>
                </div>
                {isProfileDropdownOpen ? (
                  <FiChevronUp className="ml-1 h-4 w-4 text-gray-500" />
                ) : (
                  <FiChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                )}
              </button>

              {isProfileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
                  {/* ===== header di dalam dropdown ===== */}
                  <div className="px-4 py-3 border-b bg-white">
                    {isManagerLike ? (
                      // Manager/Admin: avatar + teks
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveAvatarSrc(profile.avatarPath, avatarNonce)}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultAvatar;
                          }}
                        />
                        <div className="leading-tight">
                          <div className="text-sm font-semibold text-gray-900">
                            {profile.name}
                          </div>
                          <div className="text-xs text-gray-500">{profile.email}</div>
                        </div>
                      </div>
                    ) : (
                      // Karyawan/Klien: HANYA nama & email (tanpa avatar)
                      <div className="leading-tight">
                        <div className="text-sm font-semibold text-gray-900">
                          {profile.name}
                        </div>
                        <div className="text-xs text-gray-500">{profile.email}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleEditProfile}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiUser className="min-w-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FiLogOut className="min-w-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}