// src/pages/karyawan/EditProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";

const API_BASE = "http://be.bytelogic.orenjus.com";
const GET_PROFILE_URL = `${API_BASE}/api/karyawan/profile`;   // GET profil
const PUT_PROFILE_URL  = `${API_BASE}/api/karyawan/profile`;   // PUT profil (JSON / multipart)

// ==== Utils ==============================================================
const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:image");

function initials(name = "") {
  const p = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "US";
  const a = p[0]?.[0] || "";
  const b = p.length > 1 ? p[p.length - 1]?.[0] : p[0]?.[1] || "";
  return (a + b).toUpperCase();
}

function resolveAvatar(src) {
  if (!src) return null;
  const s = String(src).trim();
  if (isDataUrl(s)) return s;
  if (/^https?:\/\//i.test(s)) return `${s}${s.includes("?") ? "&" : "?"}t=${Date.now()}`;
  if (s.startsWith("/")) return `${API_BASE}${s}?t=${Date.now()}`;
  return null;
}

// Kompres & resize gambar => sekitar <= 120KB
async function compressImageToDataURL(
  file,
  {
    maxWidth = 512,
    maxHeight = 512,
    type = "image/jpeg",
    initialQuality = 0.9,
    minQuality = 0.5,
    step = 0.1,
    targetSizeKB = 120,
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

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext("2d");
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

// Convert dataURL -> Blob (untuk fallback multipart)
function dataURLtoBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)[1] || "image/jpeg";
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ==== Component ===========================================================
export default function KaryawanEditProfile() {
  const [profile, setProfile] = useState({
    _id: "",
    nama_lengkap: "",
    email: "",
    nomor_telepon: "",
    alamat: "",
    foto_profile: "", // bisa path server (/uploads/...), atau dataURL, atau kosong
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const fileInputRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const refetchProfile = async () => {
    setErrorText("");
    try {
      const res = await axios.get(GET_PROFILE_URL, { headers: getAuthHeaders() });
      const root = res.data?.data || {};
      const data = root.karyawan || root;

      setProfile({
        _id: data?._id || data?.id || "",
        nama_lengkap: data?.nama_lengkap ?? "",
        email: data?.email ?? "",
        nomor_telepon: data?.nomor_telepon ?? "",
        alamat: data?.alamat ?? "",
        foto_profile: data?.foto_profile ?? "",
      });

      setPreview(resolveAvatar(data?.foto_profile));
    } catch (err) {
      console.error("GET /karyawan/profile error:", err?.response?.data || err);
      setErrorText(err?.response?.data?.message || "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const onPickFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(f.type)) {
      alert("File harus berupa JPG/PNG/WEBP.");
      e.target.value = "";
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 3MB.");
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await compressImageToDataURL(f, {
        maxWidth: 512,
        maxHeight: 512,
        type: "image/jpeg",
        initialQuality: 0.9,
        minQuality: 0.5,
        step: 0.1,
        targetSizeKB: 120,
      });
      setProfile((p) => ({ ...p, foto_profile: dataUrl }));
      setPreview(dataUrl);
    } catch (err) {
      console.error("Kompresi gambar gagal:", err);
      alert("Gagal memproses gambar. Coba pilih file lain.");
      e.target.value = "";
    }
  };

  const onDeletePhoto = () => {
    setProfile((p) => ({ ...p, foto_profile: "" }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Payload JSON (mode 1)
  const buildJsonPayload = () => ({
    nama_lengkap: profile.nama_lengkap || "",
    email: profile.email || "",
    nomor_telepon: profile.nomor_telepon || "",
    alamat: profile.alamat || "",
    // kirim base64 bila ada (dataURL), atau kosong untuk hapus.
    ...(isDataUrl(profile.foto_profile)
      ? { foto_profile: profile.foto_profile }
      : profile.foto_profile === ""
      ? { foto_profile: "" }
      : {}),
  });

  // Payload FormData (mode 2) — kirim semua field + file jika ada
  const buildFormDataPayload = () => {
    const fd = new FormData();
    fd.append("nama_lengkap", profile.nama_lengkap || "");
    fd.append("email", profile.email || "");
    fd.append("nomor_telepon", profile.nomor_telepon || "");
    fd.append("alamat", profile.alamat || "");

    if (isDataUrl(profile.foto_profile)) {
      const blob = dataURLtoBlob(profile.foto_profile);
      fd.append("foto_profile", blob, "avatar.jpg");
    } else if (profile.foto_profile === "") {
      fd.append("foto_profile", "");
    }
    return fd;
  };

  // ====== Update strategies ===============================================
  const tryPutJsonProfile = async () => {
    const payload = buildJsonPayload();
    return axios.put(PUT_PROFILE_URL, payload, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });
  };

  const tryPutMultipartProfile = async () => {
    const fd = buildFormDataPayload();
    return axios.put(PUT_PROFILE_URL, fd, {
      headers: { ...getAuthHeaders() }, // biar boundary otomatis
      maxBodyLength: Infinity,
    });
  };

  const tryPutJsonById = async () => {
    if (!profile._id) {
      const err = new Error("Karyawan ID kosong untuk update by ID.");
      err.code = "NO_ID";
      throw err;
    }
    const url = `${API_BASE}/api/karyawan/${profile._id}`;
    const payload = buildJsonPayload();
    return axios.put(url, payload, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });
  };

  const tryPutMultipartById = async () => {
    if (!profile._id) {
      const err = new Error("Karyawan ID kosong untuk update by ID.");
      err.code = "NO_ID";
      throw err;
    }
    const url = `${API_BASE}/api/karyawan/${profile._id}`;
    const fd = buildFormDataPayload();
    return axios.put(url, fd, {
      headers: { ...getAuthHeaders() },
      maxBodyLength: Infinity,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorText("");

    try {
      let res;
      try {
        res = await tryPutJsonProfile();
      } catch (e1) {
        const st = e1?.response?.status;
        if ([400, 401, 403, 404, 405, 413, 415, 500].includes(st) || !st) {
          try {
            res = await tryPutMultipartProfile();
          } catch (e2) {
            const st2 = e2?.response?.status;
            if ([400, 401, 403, 404, 405, 413, 415, 500].includes(st2) || !st2) {
              try {
                res = await tryPutJsonById();
              } catch (e3) {
                const st3 = e3?.response?.status;
                if ([400, 401, 403, 404, 405, 413, 415, 500].includes(st3) || !st3) {
                  try {
                    res = await tryPutMultipartById();
                  } catch (e4) {
                    console.error("ALL UPDATE STRATEGIES FAILED", {
                      e1: e1?.response?.data || e1?.message,
                      e2: e2?.response?.data || e2?.message,
                      e3: e3?.response?.data || e3?.message,
                      e4: e4?.response?.data || e4?.message,
                    });
                    throw e4;
                  }
                } else {
                  throw e3;
                }
              }
            } else {
              throw e2;
            }
          }
        } else {
          throw e1;
        }
      }

      // Sukses
      console.log("Update success:", res?.data);
      await refetchProfile();

      // ⬇️ beri tahu Header dan halaman lain agar re-fetch & paksa refresh avatar
      window.dispatchEvent(new CustomEvent("profile:updated", { detail: { at: Date.now() } }));

      alert("Profile updated successfully!");
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("Update failed:", status, data || error);
      const msg =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : JSON.stringify(data)) ||
        "Periksa kembali data & endpoint.";
      setErrorText(`(${status || "ERR"}) ${msg}`);
      alert(`Gagal memperbarui karyawan: ${typeof msg === "string" ? msg : "Periksa kembali data & endpoint."}`);
    } finally {
      setSaving(false);
    }
  };

  // ==== UI ================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto p-6">Memuat profil…</div>
      </div>
    );
  }

  const init = initials(profile.nama_lengkap);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit Profile</h1>

        {errorText && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {errorText}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm p-6 md:px-8">
          {/* Avatar + actions */}
          <div className="flex items-center gap-4 mb-8">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-300 text-gray-900 font-bold flex items-center justify-center text-2xl ring-2 ring-gray-200">
                {init}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Upload New Picture
              </button>
              <button
                type="button"
                onClick={onDeletePhoto}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Delete
              </button>

              {/* input file hidden */}
              <input
                ref={fileInputRef}
                id="upload-photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={onPickFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="nama_lengkap"
                value={profile.nama_lengkap}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="nomor_telepon"
                value={profile.nomor_telepon}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="alamat"
                value={profile.alamat}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-md bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}