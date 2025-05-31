import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/pp.png';
import {
  Home,
  Folder,
  Briefcase,
  ChartBar,
  FileText,
  Search,
  Trash2,
  Plus,
  X,
  Star
} from 'lucide-react';

const CustomerReviews = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState({
    review: '',
    rating: 0
  });

  // Fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          'http://localhost:5000/api/reviews',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Normalize data to match frontend structure
        const normalizedReviews = response.data.data.map(review => ({
          _id: review._id,
          clientName: review.client_id?.nama_lengkap || 'Unknown Client',
          date: review.createdAt || new Date().toISOString(),
          review: review.review,
          rating: review.rating
        }));

        setReviews(normalizedReviews);

      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.response?.data?.message ||
          error.message ||
          'Failed to load review data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token]);

  const openAddModal = () => {
    setNewReview({
      review: '',
      rating: 0
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const addReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        {
          review: newReview.review,
          rating: newReview.rating
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new review to state with normalized data
      setReviews(prev => [...prev, {
        _id: response.data.data._id,
        clientName: 'You', // Since the review was just added by the current user
        date: new Date().toISOString(),
        review: response.data.data.review,
        rating: response.data.data.rating
      }]);

      closeAddModal();
    } catch (error) {
      console.error("Add Review Error:", error);
      if (error.response?.status === 403) {
        setError("Only clients can add reviews");
      } else {
        setError(error.response?.data?.message || 'Failed to add review');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/reviews/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews(reviews.filter(r => r._id !== id));
    } catch (error) {
      console.error("Delete Review Error:", error);
      setError(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const clientName = review.clientName || '';
    const reviewText = review.review || '';
    return (
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-500 p-6 flex flex-col text-white select-none">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full font-semibold text-sm flex items-center justify-center text-blue-700">B</div>
          <span className="font-semibold text-sm">Bytelogic</span>
        </div>
        <h1 className="text-xs font mb-6">MENU</h1>
        <button
          onClick={() => navigate('/dashboard-manager')}
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Home size={18} /> Dashboard
        </button>
        <button
          onClick={() => navigate('/admin-list')}
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Admin Data
        </button>
        <button
          onClick={() => navigate('/employee-list')}
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Employee Data
        </button>
        <button
          onClick={() => navigate('/client-data')}
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Folder size={18} /> Client Data
        </button>
        <button
          onClick={() => navigate('/data-project')}
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <Briefcase size={18} /> Project Data
        </button>
        <button
          onClick={() => navigate('/employee-evaluation')}
          className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <ChartBar size={18} /> Evaluation
        </button>
        <button
          onClick={() => navigate('/customer-reviews')}
          className="flex items-center gap-2 bg-blue-600 p-2 rounded mb-2 text-left"
        >
          <FileText size={18} /> Review
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Topbar */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <img src={ProfilePic} alt="Profile" className="w-10 h-10 rounded-full" />
            <span className="font-medium">Manager</span>
          </div>
        </div>

        {/* Title Section */}
        <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <i className="fas fa-spinner fa-spin mr-2"></i> Loading reviews...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center p-4 text-red-500">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {/* Search and Action Section */}
        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-1/3">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <button
                onClick={userRole === 'client' ? openAddModal : () => alert('Only clients can add reviews')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
    > Add Review
              </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReviews.length > 0 ? filteredReviews.map((review, index) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {review.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {review.review}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {reviews.length === 0
                          ? 'No review data available'
                          : 'No reviews match your search'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Review</h3>
                <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addReview}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <select
                      name="rating"
                      value={newReview.rating}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="0">Select rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review</label>
                    <textarea
                      name="review"
                      value={newReview.review}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerReviews;