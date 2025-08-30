// src/pages/karyawan/EvaluateDetailed.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSearchParams, useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = "http://be.bytelogic.orenjus.com";

/* ===================== Utils ===================== */
function formatDateTimeID(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date)) return "-";
  return date.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
}
function avgScore5(results = []) {
  if (!Array.isArray(results) || results.length === 0) return 0;
  const total = results.reduce(
    (s, r) => s + (Number(r?.selected_criteria?.value) || 0),
    0
  );
  return total / results.length;
}
function score100(detail) {
  if (typeof detail?.final_score === "number") return Math.round(detail.final_score);
  return Math.round(avgScore5(detail?.results) * 20);
}
function normalizeDetail(d = {}) {
  // satukan berbagai kemungkinan nama field komentar
  const comments =
    d.comments ??
    d.comment ??
    d.additional_notes ??
    d?.data?.comments ??
    d?.data?.comment ??
    d?.data?.additional_notes ??
    d?.evaluation?.comments ??
    d?.evaluation?.comment ??
    d?.evaluation?.additional_notes ??
    d?.data?.evaluation?.comments ??
    d?.data?.evaluation?.comment ??
    d?.data?.evaluation?.additional_notes ??
    "";

  // tanggal untuk tampilan
  const tanggal =
    d.tanggal || d.created_at || d.createdAt || d.evaluation_date || d.date || null;

  return {
    ...d,
    comments,
    tanggal,
    project_title: d.project_title || d.title || d?.project?.title || "",
    client_name: d.client_name || d?.client?.nama_lengkap || d?.client_name || "",
    results:
      Array.isArray(d.results)
        ? d.results
        : Array.isArray(d?.data?.results)
          ? d.data.results
          : [],
  };
}

/* ===================== Component ===================== */
const EvaluateDetailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedProjectFromUrl = searchParams.get("project");
  const DASHBOARD_PATH = "/dashboard-karyawan";

  const [allEvaluations, setAllEvaluations] = useState({
    loading: true,
    error: null,
    data: [], // [{ evaluation_id, project_title, client_name, final_score, results, tanggal }]
  });

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1) Ambil semua evaluasi (untuk grafik + simpan evaluation_id)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/evaluations/evaluationmykaryawan`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const list = Array.isArray(res.data?.detail_evaluasi)
          ? res.data.detail_evaluasi
          : [];

        // pastikan setiap item punya evaluation_id dan project_title
        const normalized = list.map((i) => ({
          evaluation_id: i.evaluation_id || i._id,
          project_title: i.project_title || i.title || "(Tanpa Nama)",
          client_name: i.client_name || "",
          final_score: i.final_score,
          results: i.results || [],
          tanggal: i.tanggal || i.created_at || i.createdAt || null,
        }));

        if (!alive) return;
        setAllEvaluations({
          loading: false,
          error: null,
          data: normalized,
        });
      } catch (err) {
        if (!alive) return;
        setAllEvaluations({
          loading: false,
          error: err?.response?.data?.message || "Gagal memuat data evaluasi",
          data: [],
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // helper: ambil item di list berdasarkan title (untuk prefill cepat)
  const findLocalByTitle = (title) =>
    allEvaluations.data.find(
      (i) => (i.project_title || "").toLowerCase() === String(title || "").toLowerCase()
    );

  // 2) Jika ada ?project=... → prefill lokal lalu FETCH detail lengkap by evaluation_id
  useEffect(() => {
    if (!selectedProjectFromUrl) return;

    let alive = true;
    (async () => {
      const local = findLocalByTitle(selectedProjectFromUrl);
      if (local) setSelectedDetail(normalizeDetail(local));
      else setSelectedDetail(null);

      if (!local?.evaluation_id) return; // tanpa id, tidak bisa fetch detail

      try {
        setLoadingDetail(true);
        const res = await axios.get(
          `${API_BASE}/api/evaluations/${local.evaluation_id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!alive) return;

        const detail = normalizeDetail(res.data || {});
        // merge: utamakan data detail dari API by id (punya comments)
        setSelectedDetail((prev) => normalizeDetail({ ...prev, ...detail }));
      } catch (err) {
        if (!alive) return;
        console.error("Gagal fetch detail by id:", err);
        // biarkan hanya lokal
      } finally {
        if (alive) setLoadingDetail(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedProjectFromUrl, allEvaluations.data]);

  // 3) Tanpa ?project= → pilih item pertama, lalu fetch detail by id biar ada comments
  useEffect(() => {
    if (selectedProjectFromUrl) return;
    if (allEvaluations.loading || allEvaluations.data.length === 0) return;

    const first = allEvaluations.data[0];
    setSelectedDetail(normalizeDetail(first));

    if (!first?.evaluation_id) return;

    (async () => {
      try {
        setLoadingDetail(true);
        const res = await axios.get(
          `${API_BASE}/api/evaluations/${first.evaluation_id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const detail = normalizeDetail(res.data || {});
        setSelectedDetail((prev) => normalizeDetail({ ...prev, ...detail }));
      } catch (err) {
        console.error("Gagal fetch detail by id:", err);
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [allEvaluations, selectedProjectFromUrl]);

  // 4) Data grafik
  const chartData = useMemo(() => {
    const labels = allEvaluations.data.map((i) => i.project_title || "Tanpa Nama");
    const values = allEvaluations.data.map((i) =>
      typeof i.final_score === "number" ? Math.round(i.final_score) : Math.round(avgScore5(i.results) * 20)
    );
    return {
      labels,
      datasets: [
        {
          label: "Skor (0–100)",
          data: values,
          backgroundColor: "#2196F3",
          borderRadius: 6,
          barThickness: 30,
        },
      ],
    };
  }, [allEvaluations.data]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 }, title: { display: true, text: "Skor" } },
        x: {
          ticks: {
            callback: function (_val, index) {
              const label = this.getLabelForValue(index);
              return label.length > 14 ? `${label.slice(0, 14)}…` : label;
            },
          },
          title: { display: true, text: "Nama Proyek" },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Evaluasi per Proyek" },
        tooltip: {
          callbacks: {
            label: (ctx) => `Nilai: ${ctx.raw}`,
            title: (items) => items?.[0]?.label || "",
          },
        },
      },
      onClick: async (_evt, elements) => {
        if (!elements?.length) return;
        const idx = elements[0].index;
        const local = allEvaluations.data[idx];
        if (!local) return;

        // set URL agar konsisten
        navigate(`/detail-evaluasi?project=${encodeURIComponent(local.project_title)}`);

        // prefill dulu dari lokal
        setSelectedDetail(normalizeDetail(local));

        // fetch full by id untuk ambil comments
        if (!local.evaluation_id) return;
        try {
          setLoadingDetail(true);
          const res = await axios.get(
            `${API_BASE}/api/evaluations/${local.evaluation_id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          const detail = normalizeDetail(res.data || {});
          setSelectedDetail((prev) => normalizeDetail({ ...prev, ...detail }));
        } catch (err) {
          console.error("Gagal fetch detail by id:", err);
        } finally {
          setLoadingDetail(false);
        }
      },
    }),
    [allEvaluations.data, navigate]
  );

  // Komponen bar aspek
  const AspectRow = ({ idx, name, value, description }) => {
    const val = Math.max(0, Math.min(5, Number(value) || 0));
    const pct = (val / 5) * 100;
    return (
      <li className="py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">
            {idx}. {name || "Aspek tidak tersedia"}
          </span>
          <span className="font-semibold">{val}/5</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-md overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
        </div>
        {description ? (
          <p className="text-sm text-gray-500 italic mt-2">{description}</p>
        ) : null}
      </li>
    );
  };

  const dateISO =
    selectedDetail?.tanggal ||
    selectedDetail?.created_at ||
    selectedDetail?.createdAt ||
    null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(DASHBOARD_PATH, { replace: true })}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Evaluation
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">Detail Evaluation</h1>

        {/* Grafik semua proyek */}
        <div className="p-4 border rounded mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Evaluasi per Proyek</h2>
            {selectedProjectFromUrl && (
              <span className="text-sm text-gray-600">
                Terpilih: <strong>{selectedProjectFromUrl}</strong>
              </span>
            )}
          </div>

          {allEvaluations.loading ? (
            <p className="text-gray-500">Memuat data evaluasi…</p>
          ) : allEvaluations.error ? (
            <p className="text-red-500">{allEvaluations.error}</p>
          ) : allEvaluations.data.length ? (
            <div className="h-72">
              <Bar data={chartData} options={options} />
            </div>
          ) : (
            <p className="text-gray-500">Belum ada data evaluasi.</p>
          )}
        </div>

        {/* Detail proyek terpilih + Aspek */}
        {loadingDetail ? (
          <div>Memuat detail proyek…</div>
        ) : selectedDetail ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-1">
              {selectedDetail.project_title || "(Tanpa Nama)"}
            </h3>
            <p className="text-gray-500 mb-4">
              Client: {selectedDetail.client_name || "-"} •{" "}
              Tanggal: {formatDateTimeID(dateISO)}
            </p>

            {selectedDetail.project_description ? (
              <p className="text-gray-700 mb-6">{selectedDetail.project_description}</p>
            ) : null}

            <h4 className="font-bold mb-3">Assessment Aspect</h4>
            <ul className="space-y-1">
              {(selectedDetail.results || []).map((r, idx) => (
                <AspectRow
                  key={r._id || idx}
                  idx={idx + 1}
                  name={r?.aspect_id?.aspect_name}
                  value={r?.selected_criteria?.value}
                  description={r?.selected_criteria?.description}
                />
              ))}
            </ul>

            {/* Catatan + total skor */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Additional Notes
                </label>
                <div className="p-3 border rounded text-sm text-gray-700 bg-gray-50 whitespace-pre-wrap">
                  {selectedDetail?.comments && String(selectedDetail.comments).trim() !== ""
                    ? selectedDetail.comments
                    : "-"}
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="p-4 border rounded bg-gray-50">
                  <div className="text-sm text-gray-600">Total Nilai</div>
                  <div className="text-2xl font-bold">
                    {score100(selectedDetail)}/100
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedProjectFromUrl ? (
          <div className="text-gray-500">
            Detail untuk proyek <strong>{selectedProjectFromUrl}</strong> tidak
            ditemukan.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EvaluateDetailed;
