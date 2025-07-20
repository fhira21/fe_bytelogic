import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaGithub,
  FaFigma,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaChevronLeft,
  FaCircle,
  FaRegCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { FiClock, FiUser } from 'react-icons/fi';

// Import gambar our project dari homepage
import OurProject1Image from "../assets/images/ourprojectsatu.png";
import OurProject2Image from "../assets/images/ourproject2.png";
import OurProject3Image from "../assets/images/ourproject3.png";
import OurProject4Image from "../assets/images/ourproject4.png";
import OurProject5Image from "../assets/images/ourproject5.png";
import OurProject6Image from "../assets/images/ourproject6.png";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Array gambar our project dari homepage
  const ourProjectImages = [
    OurProject1Image,
    OurProject2Image,
    OurProject3Image,
    OurProject4Image,
    OurProject5Image,
    OurProject6Image
  ];

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        let response;

        // Jika ada token, coba endpoint private terlebih dahulu
        if (token) {
          try {
            response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setProject(formatProjectData(response.data));
            return;
          } catch (privateError) {
            // Jika unauthorized, lanjut ke endpoint public
            if (privateError.response?.status !== 401 && privateError.response?.status !== 403) {
              throw privateError;
            }
          }
        }

        // Gunakan endpoint public summary untuk guest
        const publicResponse = await axios.get(`http://localhost:5000/api/projects/summary`);
        const projectFromSummary = publicResponse.data.data.find(p => p._id === id);

        if (!projectFromSummary) {
          throw new Error('Project not found in public data');
        }

        // Format data dengan memastikan gambar utama menggunakan thumbnail jika images kosong
        const formattedProject = formatProjectData({
          ...projectFromSummary,
          images: projectFromSummary.images?.length > 0 
            ? projectFromSummary.images 
            : projectFromSummary.thumbnail 
              ? [projectFromSummary.thumbnail] 
              : []
        });

        setProject(formattedProject);

      } catch (err) {
        console.error("Failed to fetch project:", err);

        // Handle error spesifik
        if (err.response) {
          switch (err.response.status) {
            case 401:
            case 403:
              setError("Session expired. Please login again.");
              localStorage.removeItem('token');
              setIsAuthenticated(false);
              break;
            case 404:
              setError("Project not found");
              break;
            default:
              setError(err.response.data?.message || "Failed to load project");
          }
        } else {
          setError(err.message || "Failed to load project");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const formatProjectData = (data) => {
    return {
      ...data,
      deadline: new Date(data.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      completiondate: data.completiondate
        ? new Date(data.completiondate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : 'On Progress',
      images: data.images || [],
      employees: data.employees || [],
      github_commits: data.github_commits || []
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle };
      case 'On Progress':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiClock };
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Available";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-medium text-red-500 mb-4">
            {error === "Not Found" ? "Project not found" : error}
          </h3>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Back
            </button>
            {(error.includes('Unauthorized') || error.includes('Session expired')) && (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(project.status);
  const StatusIcon = statusColor.icon;

  // Mendapatkan gambar yang akan ditampilkan (utama atau fallback ke ourProjectImages)
  const displayImages = project.images.length > 0 
    ? project.images 
    : project.thumbnail 
      ? [project.thumbnail] 
      : [ourProjectImages[Math.floor(Math.random() * ourProjectImages.length)]];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaChevronLeft className="mr-2" />
          Back to Home
        </button>

        {/* Guest Mode Notice */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You're viewing in guest mode. Some details may be limited.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Project Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Project Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
                <h2 className="text-xl text-blue-600 mt-2">{project.framework}</h2>
              </div>

              <div className={`mt-4 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                <StatusIcon className="mr-2" />
                {project.status}
              </div>
            </div>
          </div>

          {/* Project Image Gallery - Menggunakan gambar dari ourProjectImages jika tidak ada gambar proyek */}
          <div className="px-8 py-6 border-b border-gray-200">
            {displayImages.length > 0 ? (
              <>
                <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '400px' }}>
                  <img
                    src={displayImages[activeImageIndex]}
                    alt={`Project ${project.title}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>

                {displayImages.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {displayImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className="focus:outline-none"
                      >
                        {index === activeImageIndex ? (
                          <FaCircle className="text-blue-500 text-xs" />
                        ) : (
                          <FaRegCircle className="text-gray-400 text-xs" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '300px' }}>
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {project.description || 'No description available'}
                </p>

                {project.github_commits.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {project.github_commits.slice(0, 3).map((commit, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="text-gray-800 font-medium">{commit.message}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(commit.date).toLocaleString()} by {commit.author}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Info Card */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Project Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {new Date(project.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="font-medium">{project.deadline}</p>
                    </div>
                    {project.completiondate && project.completiondate !== 'On Progress' && (
                      <div>
                        <p className="text-sm text-gray-500">Completed On</p>
                        <p className="font-medium">{project.completiondate}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Card */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <FaUsers className="mr-2 text-blue-500" />
                    Project Team
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">
                        {project.client?.nama_lengkap || project.client || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="font-medium">
                        {project.manager?.nama_lengkap || project.manager || 'Not specified'}
                      </p>
                    </div>
                    {project.employees.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Team Members</p>
                        <ul className="space-y-1">
                          {project.employees.map((employee, index) => (
                            <li key={index} className="flex items-center">
                              <FiUser className="mr-2 text-gray-500" />
                              {employee?.nama_lengkap || employee || `Team Member ${index + 1}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links Card */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <FaFigma className="mr-2 text-blue-500" />
                    Project Links
                  </h4>
                  <div className="space-y-3">
                    {project.figma ? (
                      <div className="flex items-center">
                        <FaFigma className="text-gray-500 mr-2" />
                        <a
                          href={project.figma.startsWith('http') ? project.figma : `https://${project.figma}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          Figma Design
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No Figma link available</p>
                    )}
                    {project.github_repo_url ? (
                      <div className="flex items-center">
                        <FaGithub className="text-gray-500 mr-2" />
                        <a
                          href={project.github_repo_url.startsWith('http') ? project.github_repo_url : `https://${project.github_repo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          GitHub Repository
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No GitHub repository available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white-800 text-black p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm opacity-80">CONNECTING YOUR IDEAS</p>
                <p className="text-sm opacity-80">INFO REALITY.<strong>Bytelogi.com@2025</strong></p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium mb-1">Contact us</p>
                <a href="tel:+6287702064017" className="text-sm opacity-80 hover:opacity-100">+6287702064017</a>
                <a href="mailto:hello@bysteige.com" className="text-sm opacity-80 hover:opacity-100">hello@bytelogic.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;