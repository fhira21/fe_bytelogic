import React, { useEffect, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DetailEvaluasi = () => {
  const [dataEvaluasi, setDataEvaluasi] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    axios
      .get("http://be.bytelogic.orenjus.com/api/evaluations/evaluationmykaryawan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setDataEvaluasi(res.data.detail_evaluasi);
        // Auto-select the first project for detailed view
        if (res.data.detail_evaluasi.length > 0) {
          setSelectedDetail(res.data.detail_evaluasi[0]);
        }
      })
      .catch((err) => {
        console.error("Gagal fetch evaluasi", err);
      });
  }, []);

  // Buat chartData dari dataEvaluasi
  const chartData = {
    labels: dataEvaluasi.map((item) => item.project_title),
    datasets: [
      {
        label: "Skor Rata-Rata",
        data: dataEvaluasi.map((item) => {
          const total = item.results.reduce(
            (sum, r) => sum + (r.selected_criteria?.value || 0),
            0
          );
          const avg = item.results.length ? total / item.results.length : 0;
          return avg.toFixed(2);
        }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Rata-Rata Evaluasi per Proyek",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded">
      <h1 className="text-2xl font-bold mb-4">Detail Evaluasi</h1>

      <div className="p-4 border rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Grafik Evaluasi Proyek</h2>
        {dataEvaluasi.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <p className="text-gray-500">Belum ada data evaluasi.</p>
        )}
      </div>

      {selectedDetail && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold mb-2">
            {selectedDetail.project_title}
          </h3>
          <p className="text-gray-500 mb-4">Client: {selectedDetail.client_name}</p>

          <h4 className="font-bold mb-2">Aspek Penilaian:</h4>
          <ul className="space-y-4">
            {selectedDetail.results.map((r, idx) => (
              <li key={r._id} className="border-b pb-2">
                <div className="flex justify-between font-medium">
                  <span>
                    {idx + 1}. {r.aspect_id?.aspect_name || "Aspek tidak tersedia"}
                  </span>
                  <span className="font-bold">
                    {r.selected_criteria?.value || 0}/5
                  </span>
                </div>
                <p className="text-sm text-gray-500 italic">
                  {r.selected_criteria?.description || "-"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetailEvaluasi;
