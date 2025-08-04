// src/pages/klien/ReviewFormPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewForm from "../../components/ReviewForm";
import Header from "../../components/Header";

const ReviewFormPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId, projectName, employeeName } = location.state || {};

    const [review, setReview] = useState({
        rating: 0,
        comment: "",
        submitting: false,
        success: false,
        error: "",
    });

    const [hoverRating, setHoverRating] = useState(0);

    const [profile, setProfile] = useState({
        data: {
            user: { username: "-" },
            client: { nama_lengkap: "-", foto_profile: "" },
        },
    });

    // Fetch data profil klien dengan error handling yang lebih baik
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(
                    "http://be.bytelogic.orenjus.com/api/clients/profile",
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

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        // TODO: kirim data review ke server
        console.log("Submit Review:", review);
    };

    return (
        <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">            <Header />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate("/dashboard-klien")}
                    className="text-blue-600 hover:underline text-sm mb-4"
                >
                    ← Back to Home
                </button>

                <h1 className="text-xl font-bold mb-4">Review untuk {employeeName}</h1>
                <ReviewForm
                    profile={profile}
                    review={review}
                    setReview={setReview}
                    hoverRating={hoverRating}
                    setHoverRating={setHoverRating}
                    handleSubmitReview={handleSubmitReview}
                />
            </div>
        </div>
    );
};

export default ReviewFormPage;