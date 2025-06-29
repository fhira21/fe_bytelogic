import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePic from '../../assets/images/profile.jpg';
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
  Star,
  User,
  Edit,
  Eye
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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [managerProfile, setManagerProfile] = useState({
    loading: true,
    error: null,
    data: null
  });
  const [deletingReview, setDeletingReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          'http://localhost:5000/api/reviews',
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

      setReviews(prev => [...prev, {
        _id: response.data.data._id,
        clientName: 'You',
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

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/reviews/${deletingReview._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews(reviews.filter(r => r._id !== deletingReview._id));
      setDeletingReview(null);
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
        <button onClick={() => navigate('/data-project')} className="flex items-center justify-center md:justify-start gap-2 hover:bg-blue-600 p-2 rounded mb-2">
          <Folder size={18} />
          <span className="hidden md:inline">Project Data</span>
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
        {/* Topbar*/}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <img
                src={managerProfile.data?.foto_profile || ProfilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="hidden md:block">
                <p className="font-medium text-sm">
                  {managerProfile.loading ? 'Asep Jamaludin Wahid' :
                    managerProfile.data?.nama_lengkap ||
                    'Asep Jamaludin Wahid'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {managerProfile.data?.email || 'jamaludinasep@gmail.com'}
                </p>
              </div>
            </div>

            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-800">{managerProfile.data?.nama_lengkap || 'Asep Jamaludin Wahid'}</p>
                  <p className="text-sm text-gray-500 truncate">{managerProfile.data?.email || 'jamaludinasep@gmail.com'}</p>
                </div>

                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-black-700 hover:bg-black-100"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Title Section */}
        <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>

        {loading && (
          <div className="flex items-center justify-center p-4">
            <i className="fas fa-spinner fa-spin mr-2"></i> Loading reviews...
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-4 text-red-500">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {/* Search and Action Section */}
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.length > 0 ? filteredReviews.map((review, index) => (
                  <tr key={review._id} className="hover:bg-gray-50">
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeletingReview(review)}
                          className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
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
        </div>

        {/* Delete Confirmation Modal */}
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
              <p className="mb-6">Are you sure you want to delete this review from {deletingReview.clientName}?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingReview(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                  <label className="block text-sm font-medium text-gray-500">Client Name</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingReview.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewingReview.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rating</label>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < viewingReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Review</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingReview.review}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingReview(null)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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