import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
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

import Sidebar from "../../components/SideBar";
import TopbarProfile from "../../components/TopbarProfile";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ===================== Helpers ===================== */

// Konversi skor ke skala 0–100 (dukung 2 bentuk respons: final_score langsung, atau results 1..5)
const getFinalScore100 = (item) => {
  if (typeof item?.final_score === "number") {
    return Math.round(item.final_score);
  }
  if (Array.isArray(item?.results) && item.results.length) {
    const total = item.results.reduce(
      (s, r) => s + (Number(r?.selected_criteria?.value) || 0),
      0
    );
    return Math.round((total / item.results.length) * 20); // 1..5 → 0..100
  }
  return 0;
};

// Ekstrak array proyek dari berbagai kemungkinan struktur respons backend
const extractProjectsArray = (detail) => {
  if (!detail) return [];
  const d = detail.data && typeof detail.data === "object" ? detail.data : detail;

  const candidates = [
    d?.detail_evaluasi, // contoh /evaluationmykaryawan
    d?.evaluations,     // contoh /karyawan/evaluasi-detailed/:id
    d?.projects,        // kemungkinan lain
    d?.project_list,    // jaga-jaga
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
};

// Normalisasi 1 item proyek → { id, title, score, date }
const normalizeProjectItem = (p) => ({
  id: p?.project_id || p?.project?._id || p?._id || undefined,
  title: (p?.project_title || p?.title || p?.project?.title || "Tanpa Nama").trim(),
  score: getFinalScore100(p),
  date: p?.created_at || p?.date || null,
});

/* ===================== KOMPONEN KECIL ===================== */

const AspectRow = ({ idx, name, value, description }) => {
  const val = Math.max(0, Math.min(5, Number(value) || 0));
  const pct = (val / 5) * 100;
  return (
    <li className="py-3 border-b">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">
          {idx}. {name || "Aspek"}
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

/* ===================== Detail View (INLINE, FIXED) ===================== */

const safeResults = (payload) => {
  const candidates = [
    payload?.results,
    payload?.data?.results,
    payload?.detail?.results,
    payload?.detail_evaluasi?.results,
    payload?.evaluation?.results,
  ];
  for (const r of candidates) if (Array.isArray(r)) return r;
  return [];
};

const pickTitle = (p) =>
  (p?.project_title || p?.title || p?.project?.title || "(Tanpa Nama)").trim();

const DetailView = ({
  employee,
  onBack,
  evaluationDetails,
  loading,
  employeeIdForDetail,
}) => {
  const token = localStorage.getItem("token");

  // Sumber asli untuk chart + versi normalisasi
  const { sourceProjects, projectsForChart } = useMemo(() => {
    const fromDetail = extractProjectsArray(evaluationDetails);
    const src =
      Array.isArray(fromDetail) && fromDetail.length
        ? fromDetail
        : Array.isArray(employee?.evaluasi_projects)
        ? employee.evaluasi_projects
        : [];
    return {
      sourceProjects: src,
      projectsForChart: src.map((p) => ({
        // perluas kandidat id supaya lebih tahan ragam backend
        id:
          p?.project_id ||
          p?.project?._id ||
          p?._id ||
          p?.project ||
          p?.projectId ||
          undefined,
        title: pickTitle(p),
        score: getFinalScore100(p),
        date: p?.created_at || p?.date || null,
      })),
    };
  }, [evaluationDetails, employee]);

  const labels = projectsForChart.map((p) => p.title);
  const values = projectsForChart.map((p) => p.score);

  const barData = {
    labels,
    datasets: [
      {
        label: "Nilai Final",
        data: values,
        backgroundColor: "#2196F3",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  // === state detail proyek (inline) ===
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

  // Klik bar → ambil DETAIL dari sumber data di indeks yang sama dulu (pasti cocok),
  // baru fallback ke HTTP kalau benar2 perlu.
  const fetchProjectDetailInline = async (index) => {
    const meta = projectsForChart[index];
    const raw = sourceProjects[index]; // <- langsung pakai objek mentah yang jadi sumber chart

    if (!meta) return;

    setSelectedProjectTitle(meta.title);
    setLoadingProjectDetail(true);
    setSelectedProjectDetail(null);

    // 1) Langsung dari data lokal (pasti konsisten dengan bar yang dipilih)
    if (raw) {
      setSelectedProjectDetail({
        title: pickTitle(raw),
        client_name: raw?.client_name || raw?.client?.nama_lengkap || "-",
        created_at: raw?.created_at || raw?.date || null,
        results: safeResults(raw),
        additional_notes: raw?.additional_notes || raw?.comment || "-",
        final_score: getFinalScore100(raw),
      });
      setLoadingProjectDetail(false);
      return;
    }

    // 2) Fallback HTTP jika karena suatu alasan 'raw' tidak ada
    const projectName = meta.title;
    const projectId = meta.id ? String(meta.id) : null;

    const urls = [
      `http://be.bytelogic.orenjus.com/api/evaluations/karyawan/detail-by-project/${encodeURIComponent(
        employeeIdForDetail
      )}?title=${encodeURIComponent(projectName)}`,
      `http://be.bytelogic.orenjus.com/api/evaluations/detail-by-project?title=${encodeURIComponent(
        projectName
      )}&employeeId=${encodeURIComponent(employeeIdForDetail)}`,
      projectId
        ? `http://be.bytelogic.orenjus.com/api/evaluations/detail-by-project?projectId=${encodeURIComponent(
            projectId
          )}`
        : null,
      `http://be.bytelogic.orenjus.com/api/evaluations/detail-by-project?title=${encodeURIComponent(
        projectName
      )}`,
    ].filter(Boolean);

    let found = null;
    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = res.data?.data || res.data;
        const resultsArr = safeResults(payload);

        if (
          payload &&
          (resultsArr.length ||
            payload.final_score != null ||
            pickTitle(payload) !== "(Tanpa Nama)")
        ) {
          found = {
            title: pickTitle(payload),
            client_name:
              payload?.client_name || payload?.client?.nama_lengkap || "-",
            created_at: payload?.created_at || payload?.date || null,
            results: resultsArr,
            additional_notes: payload?.additional_notes || payload?.comment || "-",
            final_score: getFinalScore100(payload),
          };
          break;
        }
      } catch (_e) {
        // coba URL berikutnya
      }
    }

    setSelectedProjectDetail(found);
    setLoadingProjectDetail(false);
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_evt, elements) => {
      if (elements && elements.length > 0) {
        fetchProjectDetailInline(elements[0].index);
      }
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 }, title: { display: true, text: "Nilai Final" } },
      x: {
        title: { display: true, text: "Nama Proyek" },
        ticks: {
          callback: function (val, index) {
            const label = this.getLabelForValue(index);
            return label.length > 12 ? `${label.slice(0, 12)}…` : label;
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `Nilai: ${ctx.raw}` } },
    },
  };

  // header ringkas
  const employeeName = employee?.nama_karyawan || employee?.name || "-";
  const rank = typeof employee?.rank === "number" ? employee.rank : 1;
  const totalProject =
    projectsForChart.length || Number(employee?.total_project_dinilai || 0);
  const totalPoint =
    employee?.listTotalPoint != null
      ? Number(employee.listTotalPoint)
      : projectsForChart.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / projectsForChart.length)
      : Math.round(Number(employee?.rating || 0) * 20);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <button onClick={onBack} className="flex items-center text-blue-600 mb-4 hover:text-blue-800">
        <ChevronLeft size={18} className="mr-1" />
        Back to Evaluation
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Evaluation</h2>

      <div className="w-full border-b border-gray-200 pb-3 mb-4 grid grid-cols-4 text-sm text-gray-600">
        <div>
          <div className="text-gray-400">Ranking</div>
          <div className="mt-1 font-semibold">{rank}</div>
        </div>
        <div>
          <div className="text-gray-400">Employee Name</div>
          <div className="mt-1 font-semibold">{employeeName}</div>
        </div>
        <div>
          <div className="text-gray-400">Total Project</div>
          <div className="mt-1 font-semibold">{totalProject} Project</div>
        </div>
        <div>
          <div className="text-gray-400">Total Point</div>
          <div className="mt-1 font-semibold">{isNaN(totalPoint) ? 0 : totalPoint} Point</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-medium">Evaluasi per Proyek</h3>
          {selectedProjectTitle && (
            <span className="text-sm text-gray-600">
              Terpilih: <strong>{selectedProjectTitle}</strong>
            </span>
          )}
        </div>
        <div className="h-72 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">
              Memuat detail evaluasi…
            </div>
          ) : labels.length ? (
            <Bar
              data={barData}
              options={barOptions}
              /* Pastikan klik bar tertangkap di semua versi react-chartjs-2 */
              getElementAtEvent={(elements) => {
                if (elements && elements.length > 0) {
                  fetchProjectDetailInline(elements[0].index);
                }
              }}
            />
          ) : (
            <p className="text-sm text-gray-500">Tidak ada data proyek.</p>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Klik batang bar untuk melihat Aspek Penilaian setiap proyek.
        </p>
      </div>

      {/* INLINE panel aspek */}
      <div className="mt-6">
        {loadingProjectDetail ? (
          <div className="p-4 border rounded text-sm text-gray-600">Memuat detail proyek…</div>
        ) : selectedProjectDetail ? (
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-xl font-semibold mb-1">{selectedProjectDetail.title}</h3>
            <p className="text-gray-500 mb-4">
              Client: {selectedProjectDetail.client_name} • Tanggal:{" "}
              {selectedProjectDetail.created_at
                ? new Date(selectedProjectDetail.created_at).toLocaleDateString("id-ID")
                : "-"}
            </p>

            <h4 className="font-bold mb-3">Assessment Aspect</h4>
            <ul className="space-y-1">
              {safeResults(selectedProjectDetail).map((r, idx) => (
                <AspectRow
                  key={r?._id || idx}
                  idx={idx + 1}
                  name={r?.aspect_id?.aspect_name}
                  value={r?.selected_criteria?.value}
                  description={r?.selected_criteria?.description}
                />
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                <div className="p-3 border rounded text-sm text-gray-700 bg-gray-50">
                  {selectedProjectDetail.additional_notes}
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="p-4 border rounded bg-gray-50">
                  <div className="text-sm text-gray-600">Total Nilai</div>
                  <div className="text-2xl font-bold">
                    {selectedProjectDetail.final_score}/100
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedProjectTitle ? (
          <div className="p-4 border rounded text-sm text-gray-500">
            Detail untuk proyek <strong>{selectedProjectTitle}</strong> tidak ditemukan.
          </div>
        ) : (
          <div className="p-4 border rounded text-sm text-gray-500">
            Klik salah satu batang bar di atas untuk melihat detail aspek penilaian.
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================== Halaman Utama ===================== */

const EmployeeEvaluation = () => {
  const token = localStorage.getItem("token");

  // Data list
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paging (dipakai untuk menghitung ranking global)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "totalScore",
    direction: "descending",
  });

  // Detail
  const [viewMode, setViewMode] = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch list karyawan + ringkasan
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const { page, limit } = pagination;

        const res = await axios.get(
          `http://be.bytelogic.orenjus.com/api/evaluations/karyawan/evaluasi-detailed?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const responseData = res.data?.data || res.data;
        if (!Array.isArray(responseData)) {
          throw new Error("Unexpected data format from API");
        }

        const formatted = responseData.map((emp) => ({
          _id: emp.employee_id || emp._id,
          nama_karyawan:
            emp.nama_karyawan || emp.nama_lengkap || "Nama tidak tersedia",
          total_project_dinilai: emp.total_projects || 0,
          rata_rata_point_evaluasi:
            parseFloat(emp.average_final_score) || 0, // skala mengikuti backend
          evaluations: emp.evaluations || [], // utk fallback
        }));

        // simpan juga detail projek di tiap karyawan utk fallback bar
        const withProjects = formatted.map((f) => ({
          ...f,
          evaluasi_projects: Array.isArray(f.evaluations) ? f.evaluations : [],
        }));

        setEmployees(withProjects);
        setPagination((prev) => ({
          ...prev,
          total: res.data?.total || responseData.length,
        }));
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load evaluation data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pagination.page, pagination.limit]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  // Transformasi untuk tabel list
  const filteredEmployees = useMemo(() => {
    return employees
      .map((emp) => ({
        id: emp._id,
        name: emp.nama_karyawan,
        projects: Number(emp.total_project_dinilai || 0),
        rating: emp.rata_rata_point_evaluasi
          ? Number(emp.rata_rata_point_evaluasi)
          : 0, // skala mengikuti backend
      }))
      .filter(
        (emp) =>
          emp.name &&
          typeof emp.name === "string" &&
          emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((emp) => ({
        ...emp,
        // Total Point di list — mengikuti skala backend (jika 0..100 maka rating * projects sudah benar)
        totalScore: Number((emp.rating * emp.projects).toFixed(2)),
      }));
  }, [employees, searchTerm]);

  const sortedEmployees = useMemo(() => {
    const items = [...filteredEmployees];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const va = a[sortConfig.key];
        const vb = b[sortConfig.key];
        if (va < vb) return sortConfig.direction === "ascending" ? -1 : 1;
        if (va > vb) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredEmployees, sortConfig]);

  // klik "View Detail" —> ambil detail, oper totalPoint & rank dari list agar SAMA persis, plus evaluasi_projects untuk fallback bar
  const handleViewEmployeeDetail = async (employeeId, listTotalPoint, rankFromList) => {
    const employeeDetail = employees.find((emp) => emp._id === employeeId);

    setSelectedEmployee({
      ...employeeDetail,
      listTotalPoint: listTotalPoint != null ? Number(listTotalPoint) : null, // nilai dari list
      rank: rankFromList, // ranking dari list (mengikuti sort + pagination)
      rating: employeeDetail?.rata_rata_point_evaluasi || 0,
      evaluasi_projects: employeeDetail?.evaluasi_projects || [],
    });

    setDetailLoading(true);
    setViewMode("detail");

    try {
      const res = await axios.get(
        `http://be.bytelogic.orenjus.com/api/evaluations/karyawan/evaluasi-detailed/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluationDetails(res.data?.data || res.data || null);
    } catch (err) {
      console.error("Gagal mengambil detail evaluasi:", err);
      setEvaluationDetails(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedEmployee(null);
    setEvaluationDetails(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <TopbarProfile />
        <h1 className="text-2xl font-bold mb-6">Evaluation</h1>

        {viewMode === "list" && (
          <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
        )}

        {viewMode === "list" ? (
          <>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <i className="fas fa-spinner fa-spin mr-2" />
                Loading employee data...
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center p-4 text-red-500">
                <i className="fas fa-exclamation-circle mr-2" />
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        Ranking
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("name")}
                      >
                        Employee Name
                        {sortConfig.key === "name" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("projects")}
                      >
                        Total Project
                        {sortConfig.key === "projects" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("totalScore")}
                      >
                        Total Point
                        {sortConfig.key === "totalScore" && (
                          <span className="ml-1">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEmployees.length > 0 ? (
                      sortedEmployees.map((emp, index) => {
                        // Ranking global (ikut pagination). Jika mau hanya per halaman: pakai `index + 1`.
                        const rank =
                          (pagination.page - 1) * pagination.limit + index + 1;

                        return (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {emp.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {emp.projects} Project
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {emp.totalScore} Point
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() =>
                                  handleViewEmployeeDetail(
                                    emp.id,
                                    emp.totalScore,
                                    rank
                                  )
                                }
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          {employees.length === 0
                            ? "No employee evaluation data available"
                            : "No employees match your search"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <DetailView
            employee={selectedEmployee}
            onBack={handleBackToList}
            evaluationDetails={evaluationDetails}
            loading={detailLoading}
            employeeIdForDetail={selectedEmployee?._id}
          />
        )}
      </main>
    </div>
  );
};

export default EmployeeEvaluation;