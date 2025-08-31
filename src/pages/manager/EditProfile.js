// src/pages/manager/EditProfile.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopbarProfile from '../../components/TopbarProfile';
import ProfilePic from '../../assets/images/profile.jpg';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://be.bytelogic.orenjus.com';
const PROFILE_URL = `${API_BASE}/api/managers/profile`;

const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:image');

// Kompres & resize gambar agar base64 kecil (<= ~180KB)
async function compressImageToDataURL(
  file,
  {
    maxWidth = 512,
    maxHeight = 512,
    type = 'image/jpeg',
    initialQuality = 0.9,
    minQuality = 0.5,
    step = 0.1,
    targetSizeKB = 180,
  } = {}
) {
  const readAsDataURL = (f) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });

  const dataURL = await readAsDataURL(file);

  const img = new Image();
  img.src = dataURL;
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let q = initialQuality;
  let out = canvas.toDataURL(type, q);

  const sizeKB = (str) => Math.ceil((str.length * 3) / 4 / 1024);
  while (sizeKB(out) > targetSizeKB && q > minQuality) {
    q = Math.max(minQuality, q - step);
    out = canvas.toDataURL(type, q);
  }

  return out;
}

const EditProfile = () => {
  const [profile, setProfile] = useState({
    _id: '', // penting untuk fallback update by ID
    nama_lengkap: '',
    email: '',
    nomor_telepon: '',
    alamat: '',
    foto_profile: '', // path server (/uploads/...) atau dataURL
  });

  const [previewImage, setPreviewImage] = useState(ProfilePic);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const applyPreviewFromProfile = (data) => {
    if (!data || !data.foto_profile) {
      setPreviewImage(ProfilePic);
      return;
    }
    if (isDataUrl(data.foto_profile)) {
      setPreviewImage(data.foto_profile);
    } else {
      // asumsikan string path dari server, contoh: /uploads/xxx.jpg
      setPreviewImage(`${API_BASE}${data.foto_profile}?t=${Date.now()}`);
    }
  };

  const refetchProfile = async () => {
    setErrorText('');
    try {
      const res = await axios.get(PROFILE_URL, { headers: getAuthHeaders() });
      const data = res.data?.data || {};
      setProfile({
        _id: data._id || '',
        nama_lengkap: data.nama_lengkap ?? '',
        email: data.email ?? '',
        nomor_telepon: data.nomor_telepon ?? '',
        alamat: data.alamat ?? '',
        foto_profile: data.foto_profile ?? '',
      });
      applyPreviewFromProfile(data);
    } catch (err) {
      console.error('GET /managers/profile error:', err?.response?.data || err);
      setErrorText(err?.response?.data?.message || 'Gagal memuat profil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataURL(file, {
        maxWidth: 512,
        maxHeight: 512,
        type: 'image/jpeg',
        initialQuality: 0.9,
        minQuality: 0.5,
        step: 0.1,
        targetSizeKB: 180,
      });
      setProfile((prev) => ({ ...prev, foto_profile: dataUrl }));
      setPreviewImage(dataUrl);
    } catch (err) {
      console.error('Kompresi gambar gagal:', err);
      alert('Gagal memproses gambar. Coba pilih file lain.');
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleDeletePhoto = () => {
    setProfile((prev) => ({ ...prev, foto_profile: '' }));
    setPreviewImage(ProfilePic);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildPayload = () => ({
    nama_lengkap: profile.nama_lengkap || '',
    email: profile.email || '',
    nomor_telepon: profile.nomor_telepon || '',
    alamat: profile.alamat || '',
    // bisa kirim dataURL untuk foto_profile, atau '' untuk hapus
    foto_profile: typeof profile.foto_profile === 'string' ? profile.foto_profile : '',
  });

  const tryUpdateProfileEndpoint = async (payload) => {
    // Coba update ke /api/managers/profile
    return axios.put(PROFILE_URL, payload, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
  };

  const tryUpdateByIdEndpoint = async (payload) => {
    // Fallback: update via /api/managers/:id
    if (!profile._id) {
      const err = new Error('Manager ID kosong untuk update by ID.');
      err.code = 'NO_ID';
      throw err;
    }
    const url = `${API_BASE}/api/managers/${profile._id}`;
    return axios.put(url, payload, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorText('');

    const payload = buildPayload();

    try {
      let res;
      try {
        // Percobaan 1: update lewat /managers/profile
        res = await tryUpdateProfileEndpoint(payload);
      } catch (err1) {
        const status = err1?.response?.status;
        // Kalau 404/405/501 dsb, lanjut coba by-ID
        if ([404, 405, 501].includes(status) || !status) {
          try {
            res = await tryUpdateByIdEndpoint(payload);
          } catch (err2) {
            console.error('PUT /managers/:id error:', err2?.response?.data || err2);
            throw err2;
          }
        } else {
          console.error('PUT /managers/profile error:', err1?.response?.data || err1);
          throw err1;
        }
      }

      // Sukses
      console.log('Update success:', res?.data);
      await refetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error('Update failed:', status, data || error);
      const msg =
        data?.message || data?.error || JSON.stringify(data) || 'Periksa kembali data & endpoint.';
      setErrorText(`(${status || 'ERR'}) ${msg}`);
      alert(
        `Gagal memperbarui profil: ${typeof msg === 'string' ? msg : 'Periksa kembali data & endpoint.'}`
      );
    } finally {
      setSaving(false);
    }
  };

  // ====== UI ======
  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-white p-6 overflow-auto">
          <TopbarProfile />
          <div className="max-w-xl mx-auto mt-6 text-gray-600">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />

      {/* Main area dengan Topbar */}
      <main className="flex-1 bg-white p-6 overflow-auto">
        <TopbarProfile />

        <div className="max-w-xl mx-auto mt-6 bg-gray-50 p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-2">Edit Profile</h1>

          {errorText && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {errorText}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto & aksi */}
            <div className="flex items-center mb-6">
              <img
                src={previewImage || ProfilePic}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover mr-4"
              />

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="cursor-pointer bg-white text-black border border-gray-300 px-4 py-2 rounded text-sm"
                >
                  Upload New Picture
                </button>

                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="bg-white text-black border border-gray-300 px-4 py-2 rounded text-sm"
                >
                  Delete Photo
                </button>
              </div>

              {/* input file hidden */}
              <input
                ref={fileInputRef}
                id="upload-photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Input teks */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="nama_lengkap"
                value={profile.nama_lengkap}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Nama lengkap"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="email@contoh.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="nomor_telepon"
                value={profile.nomor_telepon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="alamat"
                value={profile.alamat}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Alamat lengkap"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
