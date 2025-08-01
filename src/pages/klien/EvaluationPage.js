import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import evaluationAspects from "../../data/evaluationAspect.json";
import Header from "../../components/Header";
import axios from "axios";
import StarRating from "../../components/StarRating"; // Pastikan path-nya sesuai
import ReviewForm from "../../components/ReviewForm";

const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";

const EvaluasiPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectName, employeeName, projectId } = location.state || {};

  const [scores, setScores] = useState(Array(evaluationAspects.length).fill(0));
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [review, setReview] = useState({
    rating: 0,
    comment: "",
    submitting: false,
    success: false,
    error: "",
  });
  const [hoverRating, setHoverRating] = useState(0);

  const handleScoreChange = (aspectIndex, value) => {
    const newScores = [...scores];
    newScores[aspectIndex] = parseInt(value);
    setScores(newScores);
  };

  const [profile, setProfile] = useState({
    loading: true,
    error: null,
    data: {
      client: {},
      user: {}
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:5000/api/clients/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setProfile({
          loading: false,
          error: null,
          data: response.data?.data || { client: {}, user: {} },
        });
      } catch (error) {
        console.error("Error fetching client profile:", error);
        setProfile({
          loading: false,
          error: error.response?.data?.message ||
            error.message ||
            "Gagal memuat profil klien",
          data: { client: {}, user: {} }
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setErrorMessage("ID proyek tidak ditemukan.");
      return;
    }

    const payload = {
      project_id: projectId,
      scores,
      comments: comment,
    };

    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      await axios.post("http://localhost:5000/api/evaluations", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMessage("✅ Evaluasi berhasil dikirim.");
      setScores(Array(evaluationAspects.length).fill(0));
      setComment("");

      // ✅ ARAHKAN KE HALAMAN REVIEW SETELAH BERHASIL SUBMIT EVALUASI
      navigate('/review', {
        state: {
          projectId,
          projectName,
          employeeName,
        },
      });

    } catch (error) {
      console.error("Gagal mengirim evaluasi:", error);
      setErrorMessage(
        error.response?.data?.message || "❌ Gagal mengirim evaluasi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!review.rating || !review.comment) {
      setReview((prev) => ({ ...prev, error: "Rating dan komentar wajib diisi" }));
      return;
    }

    try {
      setReview((prev) => ({ ...prev, submitting: true, error: "", success: false }));

      const payload = {
        project_id: projectId,
        rating: review.rating,
        comment: review.comment,
      };

      await axios.post("http://localhost:5000/api/reviews", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setReview({
        rating: 0,
        comment: "",
        submitting: false,
        success: true,
        error: "",
      });
    } catch (error) {
      setReview((prev) => ({
        ...prev,
        submitting: false,
        error: "Gagal mengirim review.",
      }));
    }
  };

  if (!projectId) {
    return (
      <div className="p-10 text-center text-red-600">
        <p>⚠️ Data proyek tidak ditemukan. Silakan kembali dan pilih proyek terlebih dahulu.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <a href="/dashboard-klien" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </a>

        <h1 className="text-3xl font-semibold mt-4 mb-6">Evaluate Project</h1>

        {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}
        {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}

        <div className="p-6 rounded-lg mb-8 space-y-4">
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