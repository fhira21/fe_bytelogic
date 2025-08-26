// src/pages/manager/CustomerReviews.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopbarProfile from "../../components/TopbarProfile";
import Sidebar from "../../components/SideBar";
import { X, Star } from "lucide-react";

const CustomerReviews = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingReview, setDeletingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);

  // format tanggal Indonesia
  const formatDateID = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://be.bytelogic.orenjus.com/api/reviews",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const normalizedReviews = (response.data.data || []).map((review) => ({
          _id: review._id,
          clientName: review.client_id?.nama_lengkap || "Unknown Client",
          date: review.createdAt || new Date().toISOString(),
          review: review.review,
          rating: review.rating,
        }));
        setReviews(normalizedReviews);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load reviews"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token]);

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://be.bytelogic.orenjus.com/api/reviews/${deletingReview._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((prev) =>
        prev.filter((r) => r._id !== deletingReview._id)
      );
      setDeletingReview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const clientName = r.clientName || "";
    const reviewText = r.review || "";
    return (
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto bg-white">
        <TopbarProfile />

        <h1 className="text-2xl font-bold mb-6">Review</h1>

        {loading && <p className="p-4">Loading reviews...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}

        {/* Search */}
        <div className="flex justify-end mb-4">
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

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              {/* Atur lebar masing-masing kolom */}
              <colgroup>
                <col className="w-[220px]" />   {/* Client Name */}
                <col className="w-[160px]" />   {/* Date */}
                <col className="w-[420px]" />   {/* Review: dibuat lebih sempit */}
                <col className="w-[140px]" />   {/* Rating */}
                <col className="w-[120px]" />   {/* Action */}
              </colgroup>

              <thead className="bg-white border-b border-gray-300">
                <tr>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider whitespace-nowrap">
                    Client Name
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Date
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Review
                  </th>
                  <th className="pl-4 md:pl-6 py-3 text-left text-sm font-normal text-black tracking-wider">
                    Rating
                  </th>
                  <th className="pr-4 md:pr-6 py-3 text-left text-sm font-normal text-black tracking-wider w-[1%] whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {review.clientName}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDateID(review.date)}
                      </td>

                      {/* Batasi lebar konten + wrap + clamp */}
                      <td className="px-6 py-4 text-sm text-gray-900 align-top">
                        <p
                          className="max-w-[420px] break-words leading-relaxed"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={review.review}
                        >
                          {review.review}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setDeletingReview(review)}
                          className="px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                      {reviews.length === 0
                        ? "No review data available"
                        : "No reviews match your search"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Modal */}
        {deletingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Delete Review</h3>
                <button
                  onClick={() => setDeletingReview(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">
                Are you sure you want to delete this review from{" "}
                {deletingReview.clientName}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingReview(null)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Review Details</h3>
                <button
                  onClick={() => setViewingReview(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500">Client Name</label>
                  <p className="text-sm text-gray-900">{viewingReview.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Date</label>
                  <p className="text-sm text-gray-900">{formatDateID(viewingReview.date)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Rating</label>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < viewingReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Review</label>
                  <p className="text-sm text-gray-900">{viewingReview.review}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingReview(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerReviews;