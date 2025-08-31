// src/pages/manager/EmployeeEvaluation.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

import Sidebar from "../../components/Sidebar";
import TopbarProfile from "../../components/TopbarProfile";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const API_BASE = "http://be.bytelogic.orenjus.com";

/* ===================== Helpers ===================== */

function formatDateTimeID(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return "-";
  return dt.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
}

function getAspectValue(r) {
  return Number(
    r?.selected_criteria?.value ??
    r?.selectedCriteria?.value ??
    r?.value ??
    r?.nilai ??
    r?.score ??
    r?.point ??
    0
  );
}

function getAspectName(r) {
  return (
    r?.aspect_id?.aspect_name ??
    r?.aspect?.aspect_name ??
    r?.aspect_name ??
    r?.aspect?.name ??
    r?.name ??
    null
  );
}

function getAspectDesc(r) {
  return (
    r?.selected_criteria?.description ??
    r?.selectedCriteria?.description ??
    r?.description ??
    r?.desc ??
    null
  );
}

function avgScore5(results = []) {
  if (!Array.isArray(results) || results.length === 0) return 0;
  const total = results.reduce((s, r) => s + getAspectValue(r), 0);
  return total / results.length;
}

// detail proyek → 0..100
function score100(detail) {
  if (typeof detail?.final_score === "number") return Math.round(detail.final_score);
  return Math.round(avgScore5(detail?.results) * 20);
}

function extractProjectsArray(detail) {
  if (!detail) return [];
  const d = detail?.data && typeof detail.data === "object" ? detail.data : detail;
  const candidates = [d?.detail_evaluasi, d?.evaluations, d?.projects, d?.project_list];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
}

function safeResults(payload) {
  const candidates = [
    payload?.results,
    payload?.data?.results,
    payload?.detail?.results,
    payload?.detail_evaluasi?.results,
    payload?.evaluation?.results,
  ];
  for (const r of candidates) if (Array.isArray(r)) return r;
  return [];
}

function pickTitle(p) {
  return (p?.project_title || p?.title || p?.project?.title || "(Tanpa Nama)").trim();
}

/* ===================== UI Kecil ===================== */

const AspectRow = ({ idx, item }) => {
  const name = getAspectName(item) || `Aspek ${idx}`;
  const val = Math.max(0, Math.min(5, getAspectValue(item) || 0));
  const pct = (val / 5) * 100;
  const description = getAspectDesc(item);

  return (
    <li className="py-3 border-b">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">
          {idx}. {name}
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

/* ===================== Detail View (inline) ===================== */

const DetailView = ({
  employee,
  onBack,
  evaluationDetails,
  loading,
  employeeIdForDetail,
}) => {
  const { sourceProjects, projectsForChart } = useMemo(() => {
    const fromDetail = extractProjectsArray(evaluationDetails);
    const src =
      Array.isArray(fromDetail) && fromDetail.length
        ? fromDetail
        : Array.isArray(employee?.evaluasi_projects)
          ? employee.evaluasi_projects
          : [];

    const mapped = src.map((p) => ({
      id:
        p?.project_id ||
        p?.project?._id ||
        p?._id ||
        p?.project ||
        p?.projectId ||
        undefined,
      title: pickTitle(p),
      score:
        typeof p?.final_score === "number"
          ? Math.round(p.final_score) // sudah /100 dari BE
          : Math.round(avgScore5(safeResults(p)) * 20),
      // ⬇️ tambahkan 'tanggal' sebagai fallback
      date: p?.created_at || p?.tanggal || p?.date || null,
    }));

    return { sourceProjects: src, projectsForChart: mapped };
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

  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

  const openProjectByIndex = async (index) => {
    const meta = projectsForChart[index];
    const raw = sourceProjects[index];

    if (!meta) return;

    const token = localStorage.getItem("token");
    setSelectedProjectTitle(meta.title);
    setLoadingProjectDetail(true);
    setSelectedProjectDetail(null);

    // 1) Data lokal (sudah ada aspect_name)
    if (raw && (safeResults(raw).length > 0 || typeof raw?.final_score === "number")) {
      setSelectedProjectDetail({
        title: pickTitle(raw),
        client_name: raw?.client_name || raw?.client?.nama_lengkap || "-",
        // ⬇️ tambahkan 'tanggal'
        created_at: raw?.created_at || raw?.tanggal || raw?.date || null,
        results: safeResults(raw),
        additional_notes: raw?.additional_notes || raw?.comment || raw?.comments || "-",
        final_score: score100(raw),
      });
      setLoadingProjectDetail(false);
      return;
    }

    // 2) Fallback HTTP ke localhost:5000
    const projectName = meta.title;
    const projectId = meta.id ? String(meta.id) : null;
    const urls = [
      `${API_BASE}/api/evaluations/karyawan/detail-by-project/${encodeURIComponent(
        employeeIdForDetail
      )}?title=${encodeURIComponent(projectName)}`,
      `${API_BASE}/api/evaluations/detail-by-project?title=${encodeURIComponent(
        projectName
      )}&employeeId=${encodeURIComponent(employeeIdForDetail)}`,
      projectId
        ? `${API_BASE}/api/evaluations/detail-by-project?projectId=${encodeURIComponent(
          projectId
        )}`
        : null,
      `${API_BASE}/api/evaluations/detail-by-project?title=${encodeURIComponent(
        projectName
      )}`,
    ].filter(Boolean);

    let found = null;
    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = res.data?.data || res.data || {};
        const resultsArr = safeResults(payload);

        if (
          payload &&
          (resultsArr.length > 0 ||
            typeof payload?.final_score === "number" ||
            pickTitle(payload) !== "(Tanpa Nama)")
        ) {
          found = {
            title: pickTitle(payload),
            client_name:
              payload?.client_name || payload?.client?.nama_lengkap || "-",
            // ⬇️ tambahkan 'tanggal'
            created_at: payload?.created_at || payload?.tanggal || payload?.date || null,
            results: resultsArr,
            additional_notes:
              payload?.additional_notes || payload?.comment || payload?.comments || "-",
            final_score: score100(payload),
          };
          break;
        }
      } catch {
        // lanjut URL berikutnya
      }
    }

    setSelectedProjectDetail(found);
    setLoadingProjectDetail(false);
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_evt, elements) => {
      if (elements && elements.length > 0) openProjectByIndex(elements[0].index);
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

  // Header ringkas
  const employeeName = employee?.nama_karyawan || employee?.name || "-";
  const rank = typeof employee?.rank === "number" ? employee.rank : 1;
  const totalProject =
    projectsForChart.length || Number(employee?.total_project_dinilai || 0);
  const totalPoint =
    employee?.listTotalPoint != null
      ? Number(employee.listTotalPoint)
      : projectsForChart.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / projectsForChart.length)
        : Math.round(Number(employee?.rating || 0));

  return (
    <div className="rounded-lg p-6">
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
          <div className="text-gray-400">Total Evaluations</div>
          <div className="mt-1 font-semibold">{totalProject} Evaluations</div>
        </div>
        <div>
          <div className="text-gray-400">Total Point</div>
          <div className="mt-1 font-semibold">{isNaN(totalPoint) ? 0 : totalPoint} Point</div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg p-4">
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
              getElementAtEvent={(elements) => {
                if (elements && elements.length > 0) openProjectByIndex(elements[0].index);
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

      {/* Panel aspek inline */}
      <div className="mt-6">
        {loadingProjectDetail ? (
          <div className="p-4 border rounded text-sm text-gray-600">Memuat detail proyek…</div>
        ) : selectedProjectDetail ? (
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-xl font-semibold mb-1">{selectedProjectDetail.title}</h3>
            <p className="text-gray-500 mb-4">
              Client: {selectedProjectDetail.client_name} • Tanggal:{" "}
              {formatDateTimeID(selectedProjectDetail.created_at)}
            </p>


            <h4 className="font-bold mb-3">Assessment Aspect</h4>
            <ul className="space-y-1">
              {safeResults(selectedProjectDetail).map((r, idx) => (
                <AspectRow
                  key={r?._id || `${idx}-${r?.aspect_id?._id || "x"}`}
                  idx={idx + 1}
                  item={r}
                />
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                <div className="p-3 border rounded text-sm text-gray-700 bg-gray-50">
                  {selectedProjectDetail.additional_notes || "-"}
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
          <div className="p-4 rounded text-sm text-gray-500">
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

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [sortConfig, setSortConfig] = useState({
    key: "totalScore",
    direction: "descending",
  });

  const [viewMode, setViewMode] = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const { page, limit } = pagination;

        const res = await axios.get(
          `${API_BASE}/api/evaluations/karyawan/evaluasi-detailed?page=${page}&limit=${limit}`,
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
          total_project_dinilai: emp.total_evaluations || 0,
          rata_rata_point_evaluasi: parseFloat(emp.average_final_score) || 0, // sudah /100
          evaluations: emp.evaluations || [],
        }));

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

  const filteredEmployees = useMemo(() => {
    return employees
      .map((emp) => ({
        id: emp._id,
        name: emp.nama_karyawan,
        projects: Number(emp.total_project_dinilai || 0),
        rating: emp.rata_rata_point_evaluasi
          ? Number(emp.rata_rata_point_evaluasi)
          : 0, // sudah /100
      }))
      .filter(
        (emp) =>
          emp.name &&
          typeof emp.name === "string" &&
          emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((emp) => ({
        ...emp,
        totalScore: Number(emp.rating.toFixed(2)), // tampilkan average /100
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

  const handleViewEmployeeDetail = async (employeeId, listTotalPoint, rankFromList) => {
    const employeeDetail = employees.find((emp) => emp._id === employeeId);

    setSelectedEmployee({
      ...employeeDetail,
      listTotalPoint: listTotalPoint != null ? Number(listTotalPoint) : null,
      rank: rankFromList,
      rating: employeeDetail?.rata_rata_point_evaluasi || 0, // /100
      evaluasi_projects: employeeDetail?.evaluasi_projects || [],
    });

    setDetailLoading(true);
    setViewMode("detail");

    try {
      const res = await axios.get(
        `${API_BASE}/api/evaluations/karyawan/evaluasi-detailed/${employeeId}`,
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
      <main className="flex-1 p-6 overflow-auto bg-white">
        <TopbarProfile />
        <h1 className="text-2xl font-bold mb-6">Evaluation</h1>

        {viewMode === "list" && (
          <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-center"
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
              <div className="rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white border-b border-gray-300">
                      <tr>
                        <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                          Ranking
                        </th>

                        <th
                          className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider cursor-pointer hover:bg-gray-50"
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
                          className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider cursor-pointer hover:bg-gray-50"
                          onClick={() => requestSort("projects")}
                        >
                          Total Evaluations
                          {sortConfig.key === "projects" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </th>

                        <th
                          className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider cursor-pointer hover:bg-gray-50"
                          onClick={() => requestSort("totalScore")}
                        >
                          Total Point
                          {sortConfig.key === "totalScore" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending"}
                            </span>
                          )}
                        </th>

                        <th className="pr-4 md:pr-6 py-3 text-left text-sm font-normal text-black tracking-wider w-[1%] whitespace-nowrap">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {sortedEmployees.length > 0 ? (
                        sortedEmployees.map((emp, index) => {
                          const rank =
                            (pagination.page - 1) * pagination.limit + index + 1;

                          return (
                            <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {rank}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-900">
                                {emp.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {emp.projects} Evaluations
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {emp.totalScore} Point
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() =>
                                    handleViewEmployeeDetail(
                                      emp.id,
                                      emp.totalScore, // average /100
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
