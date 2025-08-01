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
      .get("http://localhost:5000/api/evaluations/evaluationmykaryawan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setDataEvaluasi(res.data.detail_evaluasi);
      })
      .catch((err) => {
        console.error("Gagal fetch evaluasi", err);
      });
  }, []);

  const chartData = {
    labels: dataEvaluasi.map((e) => e.project_title),
    datasets: [
      {
        label: "Nilai Evaluasi",
        data: dataEvaluasi.map((e) => e.final_score),
        backgroundColor: "rgba(34, 107, 197, 0.6)",  
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };


  const options = {
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedDetail(dataEvaluasi[index]);
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `Nilai: ${ctx.raw} - ${ctx.label}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded">
      <h1 className="text-2xl font-bold mb-4">Detail Evaluasi</h1>

      <div className="p-4 border rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Grafik Evaluasi Proyek</h2>
        <Bar data={chartData} options={options} />
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
                  <span>{idx + 1}. {r.aspect_id?.aspect_name || "Aspek tidak tersedia"}</span>
                  <span className="font-bold">{r.selected_criteria.value}/5</span>
                </div>
                <p className="text-sm text-gray-500 italic">
                  {r.selected_criteria.description}
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
