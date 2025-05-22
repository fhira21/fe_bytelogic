import React from 'react';
import { useNavigate } from "react-router-dom";
import ProfilePic from '../../assets/images/pp.png'; // Ganti path sesuai gambar profil

const DashboardKlien = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-600 text-white flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center font-bold">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font-bold mb-6">MENU</h1>
        <button onClick={() => navigate('/dashboard-klien')} className="flex items-center gap-2 text-sm p-2 hover:bg-blue-700 rounded mb-2">
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </button>
        <button onClick={() => navigate('/project-list')} className="flex items-center gap-2 text-sm p-2 hover:bg-blue-700 rounded mb-2">
          <i className="fas fa-folder-open"></i> Proyek Saya
        </button>
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm p-2 hover:bg-blue-700 rounded mb-2">
          <i className="fas fa-user"></i> Profil Saya
        </button>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm p-2 hover:bg-red-600 rounded mt-auto">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Topbar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-4 py-2 text-xs bg-gray-200 rounded-md placeholder-gray-500 text-gray-700"
              />
              <i className="fas fa-search absolute left-2 top-2.5 text-gray-500 text-xs"></i>
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/user-profile')}>
              <img src={ProfilePic} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-xs text-gray-700">Deni el mares</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold mb-6">Dashboard Klien</h1>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow text-sm">
            <p className="font-semibold text-gray-600">Total Proyek</p>
            <h3 className="text-lg font-bold mt-1">5 Proyek</h3>
          </div>
          <div className="bg-white p-4 rounded shadow text-sm">
            <p className="font-semibold text-gray-600">Proyek Aktif</p>
            <h3 className="text-lg font-bold mt-1">3 Proyek</h3>
          </div>
          <div className="bg-white p-4 rounded shadow text-sm">
            <p className="font-semibold text-gray-600">Pesan Terkirim</p>
            <h3 className="text-lg font-bold mt-1">12 Pesan</h3>
          </div>
          <div className="bg-white p-4 rounded shadow text-sm">
            <p className="font-semibold text-gray-600">Peringkat</p>
            <h3 className="text-lg font-bold mt-1">4.5</h3>
          </div>
        </div>

        {/* Progres Proyek */}
        <div className="mb-8">
          <h3 className="text-md font-bold mb-2">Progres Proyek</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded shadow text-sm">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-3">Nama Proyek</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Pengembangan Aplikasi Mobile</td>
                  <td className="p-3">30 Desember 2025</td>
                  <td className="p-3 text-green-600 font-semibold">Selesai</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">Sistem Manajemen Inventaris</td>
                  <td className="p-3">15 Januari 2026</td>
                  <td className="p-3 text-yellow-600 font-semibold">Dalam Proses</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ulasan Terbaru */}
        <div>
          <h3 className="text-md font-bold mb-2">Ulasan Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded shadow text-sm">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Ulasan</th>
                  <th className="p-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Deni el mares</td>
                  <td className="p-3">Proyek sangat memuaskan!</td>
                  <td className="p-3">25 April 2025</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">Anna Bella</td>
                  <td className="p-3">Kerja tim yang luar biasa!</td>
                  <td className="p-3">24 April 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardKlien;
