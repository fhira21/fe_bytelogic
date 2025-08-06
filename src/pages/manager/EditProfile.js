import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/SideBar';
import ProfilePic from "../../assets/images/profile.jpg";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    nama_lengkap: '',
    email: '',
    nomor_telepon: '',
    alamat: '',
    foto_profile: ''
  });

  const [previewImage, setPreviewImage] = useState(ProfilePic);
  const [initialProfile, setInitialProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://be.bytelogic.orenjus.com/api/managers/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.data);
        setInitialProfile(response.data.data);
        setPreviewImage(`http://be.bytelogic.orenjus.com${response.data.data.foto_profile}`);
      } catch (error) {
        console.error("Gagal ambil data profil:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://be.bytelogic.orenjus.com/api/managers/profile", profile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Gagal update profil:", error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-white flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl bg-gray-50 p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center mb-6">
              <img
                src={previewImage || ProfilePic}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover mr-4"
              />
              <div>
                {/* <input
                  id="upload-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                /> */}
                <div className="flex gap-2">
                  <label
                    htmlFor="upload-photo"
                    className="cursor-pointer bg-white-500 text-black border border-gray px-4 py-2 rounded text-sm"
                  >
                    Upload New Picture
                  </label>

                  <button
                    type="button"
                    className="bg-white-500 text-black border border-gray px-4 py-2 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>

                <input
                  id="upload-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />

              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="nama_lengkap"
                value={profile.nama_lengkap}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="nomor_telepon"
                value={profile.nomor_telepon}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="alamat"
                value={profile.alamat}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)} // kembali ke halaman sebelumnya
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;