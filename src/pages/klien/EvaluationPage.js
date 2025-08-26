// src/pages/klien/EvaluasiPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import evaluationAspects from "../../data/evaluationAspect.json";
import Header from "../../components/Header";
import axios from "axios";

const API_BASE = "http://be.bytelogic.orenjus.com";
const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

const EvaluasiPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectName, projectId } = location.state || {};

  const [scores, setScores] = useState(Array(evaluationAspects.length).fill(0));
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // nama-nama karyawan pada proyek terpilih
  const [employeeNames, setEmployeeNames] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState(null);

  const handleScoreChange = (aspectIndex, value) => {
    const next = [...scores];
    next[aspectIndex] = parseInt(value, 10);
    setScores(next);
  };

  // Ambil data proyek untuk klien yang login → cari proyek terpilih → ambil employees
  useEffect(() => {
    if (!projectId && !projectName) {
      setEmpLoading(false);
      setEmpError("Project tidak dikenali.");
      return;
    }

    let alive = true;
    (async () => {
      try {
        setEmpLoading(true);
        setEmpError(null);

        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // urutan prioritas endpoint: /api/project/klien (permintaanmu) → fallback /api/projects/klien
        const urls = [
          `${API_BASE}/api/project/klien`,
          `${API_BASE}/api/projects/klien`,
        ];

        let list = [];
        for (const url of urls) {
          try {
            const r = await axios.get(url, { headers, validateStatus: () => true });
            if (r.status >= 200 && r.status < 300) {
              const raw = r.data?.data ?? r.data;
              if (Array.isArray(raw)) {
                list = raw;
                break;
              }
            }
          } catch {
            /* coba url berikutnya */
          }
        }

        // cari proyek berdasarkan id atau title
        const chosen =
          list.find((p) => String(p?._id) === String(projectId)) ||
          list.find(
            (p) =>
              (p?.title || "").toLowerCase() ===
              (projectName || "").toLowerCase()
          ) ||
          null;

        const emps = Array.isArray(chosen?.employees) ? chosen.employees : [];

        // jika sudah nama (seperti contoh BE-mu), langsung pakai
        let names = emps
          .map((it) => {
            if (typeof it === "string" && !isObjectId(it)) return it; // sudah nama
            if (it && typeof it === "object")
              return it.nama_lengkap || it.name || it.email || null; // populated
            return null;
          })
          .filter(Boolean);

        // fallback: kalau masih ada ID yang belum resolve, mapping via /api/karyawan
        if (names.length < emps.length) {
          const empRes = await axios.get(`${API_BASE}/api/karyawan`, {
            headers,
            validateStatus: () => true,
          });
          const arr = Array.isArray(empRes.data?.data) ? empRes.data.data : [];
          const idToName = {};
          for (const e of arr) {
            if (e?._id)
              idToName[e._id] = e.nama_lengkap || e.name || e.email || "";
          }
          names = emps
            .map((it) => {
              if (typeof it === "string") {
                return isObjectId(it) ? idToName[it] || it : it;
              }
              return it?.nama_lengkap || it?.name || it?.email || null;
            })
            .filter(Boolean);
        }

        if (!alive) return;
        setEmployeeNames(names);
      } catch (err) {
        if (!alive) return;
        setEmpError(err?.response?.data?.message || "Gagal memuat karyawan proyek");
      } finally {
        if (alive) setEmpLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId, projectName]);

  const displayEmployeeName =
    employeeNames.length > 0 ? employeeNames.join(", ") : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setErrorMessage("ID proyek tidak ditemukan.");
      return;
    }

    const payload = { project_id: projectId, scores, comments: comment };

    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      await axios.post(`${API_BASE}/api/evaluations`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMessage("✅ Evaluasi berhasil dikirim.");
      setScores(Array(evaluationAspects.length).fill(0));
      setComment("");

      navigate("/review", {
        state: {
          projectId,
          projectName,
          employeeName: displayEmployeeName, // kirim nama yang sudah resolved
        },
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "❌ Gagal mengirim evaluasi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!projectId && !projectName) {
    return (
      <div className="p-10 text-center text-red-600">
        <p>⚠️ Data proyek tidak ditemukan. Silakan kembali dan pilih proyek terlebih dahulu.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <a href="/dashboard-klien" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </a>

        <h1 className="text-3xl font-semibold mt-4 mb-6">Evaluate Project</h1>

        {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}
        {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}

        {/* Info Proyek & Employee */}
        <div className="p-6 rounded-lg mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName || "-"}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
            />
          </div>

          {/* List semua employee (bernomor) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employees in this Project
            </label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm">
              {empLoading ? (
                <span className="text-gray-500">Memuat karyawan…</span>
              ) : empError ? (
                <span className="text-red-600">{empError}</span>
              ) : employeeNames.length ? (
                <ol className="list-decimal pl-5 space-y-1">
                  {employeeNames.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ol>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Form Evaluasi */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 border text-left w-12">No</th>
                  <th className="p-3 border text-left w-1/4">Indicator</th>
                  <th className="p-3 border text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {evaluationAspects.map((aspect, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3 border align-top text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="p-3 border align-top">
                      <div className="font-semibold">{aspect.aspect_name}</div>
                      <div className="text-xs text-gray-500">{aspect.question}</div>
                    </td>
                    <td className="p-3 border align-top">
                      <div className="space-y-2">
                        {aspect.criteria.map((c, i) => (
                          <label key={i} className="flex items-start space-x-2">
                            <input
                              type="radio"
                              name={`aspect-${index}`}
                              value={c.score}
                              checked={scores[index] === c.score}
                              onChange={() => handleScoreChange(index, c.score)}
                              className="mt-1 text-blue-600"
                            />
                            <span className="text-sm">{c.label}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Komentar */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Komentar Tambahan
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tulis komentar mengenai kinerja karyawan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluasiPage;
