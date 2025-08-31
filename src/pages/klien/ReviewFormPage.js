// src/pages/klien/ReviewFormPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReviewForm from "../../components/ReviewForm";
import Header from "../../components/Header";

const ReviewFormPage = () => {
  const navigate = useNavigate();

  const [review, setReview] = useState({
    rating: 0,
    comment: "",
    submitting: false,
    success: false,
    error: "",
  });

  const [hoverRating, setHoverRating] = useState(0);

  const [profile, setProfile] = useState({
    loading: true,
    error: null,
    data: {
      user: { username: "-" },
      client: { nama_lengkap: "-", foto_profile: "" },
    },
  });

  // Ambil profil klien (untuk menampilkan info user pada form bila diperlukan)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(
          "https://be.bytelogic.orenjus.com/api/clients/profile",
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
          error:
            error.response?.data?.message ||
            error.message ||
            "Gagal memuat profil klien",
          data: { client: {}, user: {} },
        });
      }
    };

    fetchProfile();
  }, []);

  // Submit review perusahaan (BUKAN karyawan/proyek)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (review.submitting) return;

    // Validasi sederhana
    if (!review.rating || review.rating < 1) {
      setReview((p) => ({ ...p, error: "Silakan berikan rating." }));
      return;
    }
    if (!review.comment || review.comment.trim().length < 3) {
      setReview((p) => ({ ...p, error: "Komentar terlalu pendek." }));
      return;
    }

    try {
      setReview((p) => ({ ...p, submitting: true, error: "" }));

      const token = localStorage.getItem("token");
      const payload = {
        rating: review.rating,
        review: review.comment, // backend sebelumnya membaca 'review' & 'rating'
        // kalau backend butuh penanda tipe review perusahaan:
        // type: "company",
      };

      await axios.post("https://be.bytelogic.orenjus.com/api/reviews", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
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

      alert("Terima kasih! Review perusahaan Anda sudah terkirim.");
      navigate("/dashboard-klien");
    } catch (error) {
      console.error("Submit company review error:", error);
      setReview((p) => ({
        ...p,
        submitting: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengirim review. Coba lagi.",
      }));
    }
  };

  return (
    <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/dashboard-klien")}
          className="text-blue-600 hover:underline text-sm mb-4"
        >
          ← Back to Home
        </button>

        {/* Judul form khusus review perusahaan */}
        <h1 className="text-xl font-bold mb-2">Company Review</h1>
        <p className="text-sm text-gray-600 mb-6">
          Berikan penilaian dan masukan Anda untuk perusahaan secara umum.
        </p>

        {/* Komponen form — fields rating & comment tetap dipakai */}
        <ReviewForm
          profile={profile}
          review={review}
          setReview={setReview}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          handleSubmitReview={handleSubmitReview}
        />

        {/* Tampilkan error global dari submit jika ada */}
        {review.error ? (
          <div className="mt-4 text-sm text-red-600">{review.error}</div>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewFormPage;