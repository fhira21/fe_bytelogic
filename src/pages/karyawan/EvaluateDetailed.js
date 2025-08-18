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

// ===== Util skor =====
function avgScore5(results = []) {
  if (!Array.isArray(results) || results.length === 0) return 0;
  const total = results.reduce(
    (s, r) => s + (Number(r?.selected_criteria?.value) || 0),
    0
  );
  return total / results.length; // 0..5
}
function score100(detail) {
  if (typeof detail?.final_score === "number") return Math.round(detail.final_score);
  return Math.round(avgScore5(detail?.results) * 20);
}

const EvaluateDetailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedProjectFromUrl = searchParams.get("project");
  const DASHBOARD_PATH = "/dashboard-karyawan";

  const [allEvaluations, setAllEvaluations] = useState({
    loading: true,
    error: null,
    data: [], // [{ project_title, results[], client_name, created_at, final_score? }, ...]
  });

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1) Ambil semua evaluasi untuk grafik
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(
          "http://be.bytelogic.orenjus.com/api/evaluations/evaluationmykaryawan",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!alive) return;
        setAllEvaluations({
          loading: false,
          error: null,
          data: res.data?.detail_evaluasi || [],
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

  // 2) Ambil detail proyek spesifik jika ada ?project=
  useEffect(() => {
    if (!selectedProjectFromUrl) return;
    let alive = true;

    (async () => {
      try {
        setLoadingDetail(true);

        // coba cari dulu dari list yang sudah ada (tanpa hit API)
        const local = allEvaluations.data.find(
          (i) => (i.project_title || "").toLowerCase() === selectedProjectFromUrl.toLowerCase()
        );
        if (local) {
          setSelectedDetail(local);
          return;
        }

        // jika tidak ada, baru request detail by title
        const res = await axios.get(
          `http://be.bytelogic.orenjus.com/api/evaluations/detail-by-project?title=${encodeURIComponent(
            selectedProjectFromUrl
          )}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!alive) return;
        setSelectedDetail(res.data?.data || null);
      } catch (err) {
        if (!alive) return;
        console.error("Gagal fetch detail project:", err);
        setSelectedDetail(null);
      } finally {
        if (alive) setLoadingDetail(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedProjectFromUrl, allEvaluations.data]);

  // 3) Jika tidak ada ?project=, default ke item pertama setelah list selesai dimuat
  useEffect(() => {
    if (selectedProjectFromUrl) return;
    if (!allEvaluations.loading && allEvaluations.data.length > 0) {
      setSelectedDetail(allEvaluations.data[0]);
    }
  }, [allEvaluations, selectedProjectFromUrl]);

  // 4) Data grafik (rata-rata per proyek)
  const chartData = useMemo(() => {
    const labels = allEvaluations.data.map((i) => i.project_title || "Tanpa Nama");
    const values = allEvaluations.data.map((i) =>
      Number(avgScore5(i.results).toFixed(2))
    );
    return {
      labels,
      datasets: [
        {
          label: "Skor Rata-Rata (0–5)",
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
        y: {
          beginAtZero: true,
          max: 5,
          ticks: { stepSize: 1 },
          title: { display: true, text: "Rata-rata Nilai" },
        },
        x: {
          ticks: {
            callback: function (val, index) {
              const label = this.getLabelForValue(index);
              return label.length > 14 ? `${label.slice(0, 14)}…` : label;
            },
          },
          title: { display: true, text: "Nama Proyek" },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Rata-Rata Evaluasi per Proyek" },
        tooltip: {
          callbacks: {
            label: (ctx) => `Nilai: ${ctx.raw}`,
            title: (items) => items?.[0]?.label || "",
          },
        },
      },
      onClick: (_evt, elements) => {
        if (elements?.length) {
          const idx = elements[0].index;
          const projectName = chartData.labels[idx];
          if (projectName) {
            navigate(`/detail-evaluasi?project=${encodeURIComponent(projectName)}`);
          }
        }
      },
    }),
    [chartData.labels, navigate]
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* === Tombol Back seperti sebelumnya === */}
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
              {selectedDetail.project_title ||
                selectedDetail.title ||
                "(Tanpa Nama)"}
            </h3>
            <p className="text-gray-500 mb-4">
              Client: {selectedDetail.client_name || "-"} •{" "}
              Tanggal:{" "}
              {selectedDetail.created_at
                ? new Date(selectedDetail.created_at).toLocaleDateString("id-ID")
                : "-"}
            </p>

            {selectedDetail.project_description ? (
              <p className="text-gray-700 mb-6">
                {selectedDetail.project_description}
              </p>
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
                <div className="p-3 border rounded text-sm text-gray-700 bg-gray-50">
                  {selectedDetail.additional_notes ||
                    selectedDetail.comment ||
                    "-"}
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