// src/pages/EvaluateProject.js

import React, { useState } from "react";
import evaluationAspects from "../../data/evaluationAspect.json";
import Header from "../../components/Header";

const EvaluasiPage = ({ projectName, employeeName }) => {
  const [scores, setScores] = useState(Array(evaluationAspects.length).fill(0));

  const handleScoreChange = (aspectIndex, value) => {
    const newScores = [...scores];
    newScores[aspectIndex] = parseInt(value);
    setScores(newScores);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      project_id: "ID_PROYEK", // Ganti sesuai kebutuhan
      scores,
      comments: "", // Tambah jika perlu input komentar
    };

    console.log("Submit Payload:", payload);
    // axios.post("/api/evaluations", payload)
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <a href="/dashboard-klien" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </a>

        <h1 className="text-3xl font-semibold mt-4 mb-6">Evaluate Project</h1>

        {/* Project Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              value={employeeName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
            />
          </div>
        </div>

        {/* Evaluation Table */}
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

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition"
            >
              Submit Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluasiPage;
