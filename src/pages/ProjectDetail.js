// src/pages/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaGithub,
  FaFigma,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaChevronLeft,
  FaCircle,
  FaRegCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { FiClock, FiUser } from "react-icons/fi";

// Import gambar our project dari homepage
import OurProject1Image from "../assets/images/ourprojectsatu.png";
import OurProject2Image from "../assets/images/ourproject2.png";
import OurProject3Image from "../assets/images/ourproject3.png";
import OurProject4Image from "../assets/images/ourproject4.png";
import OurProject5Image from "../assets/images/ourproject5.png";
import OurProject6Image from "../assets/images/ourproject6.png";

const API_BASE = "http://be.bytelogic.orenjus.com";

/* Helpers */
const toAbsoluteUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
};

const safeDate = (v, fallback = "") => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : fallback;
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { bg: "bg-green-100", text: "text-green-800", icon: FaCheckCircle };
    case "On Progress":
      return { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", icon: FiClock };
  }
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Array gambar our project dari homepage (fallback)
  const ourProjectImages = [
    OurProject1Image,
    OurProject2Image,
    OurProject3Image,
    OurProject4Image,
    OurProject5Image,
    OurProject6Image,
  ];

  // Cek auth di mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Normalisasi payload proyek (samakan field & siapkan fallback)
  const formatProjectData = (raw) => {
    const description =
      raw?.description ??
      raw?.desc ??
      raw?.deskripsi ??
      raw?.short_description ??
      "";

    const imgs = Array.isArray(raw?.images) ? raw.images : [];
    const thumb = raw?.thumbnail ? [raw.thumbnail] : [];

    return {
      ...raw,
      // tanggal
      created_at: raw?.created_at ?? raw?.createdAt ?? raw?.createddate,
      createdAt: raw?.createdAt ?? raw?.created_at,
      deadline: safeDate(raw?.deadline, "-"),
      completiondate: raw?.completiondate ? safeDate(raw.completiondate, "On Progress") : "On Progress",
      // deskripsi aman
      description,
      // gambar absolute + fallback thumbnail
      images: (imgs.length ? imgs : thumb).map(toAbsoluteUrl),
      // koleksi default
      employees: Array.isArray(raw?.employees) ? raw.employees : [],
      github_commits: Array.isArray(raw?.github_commits) ? raw.github_commits : [],
      // link
      github_repo_url: raw?.github_repo_url ?? raw?.githubUrl ?? "",
      figma: raw?.figma ?? "",
      // status
      status: raw?.status || "Waiting List",
      title: raw?.title || raw?.name || "",
      framework: raw?.framework || "",
      client: raw?.client,
      manager: raw?.manager,
    };
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        let response;

        // 1) Coba endpoint private jika ada token
        if (token) {
          try {
            response = await axios.get(`${API_BASE}/api/projects/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const payload = response?.data?.data ?? response?.data ?? {};
            setProject(formatProjectData(payload));
            return;
          } catch (privateError) {
            // Jika bukan 401/403, lempar error
            if (
              privateError?.response?.status !== 401 &&
              privateError?.response?.status !== 403
            ) {
              throw privateError;
            }
            // Kalau 401/403, turun ke public
            localStorage.removeItem("token");
            setIsAuthenticated(false);
          }
        }

        // 2) Fallback: endpoint public summary untuk guest
        const publicResponse = await axios.get(`${API_BASE}/api/projects/summary`);
        const list = Array.isArray(publicResponse?.data?.data) ? publicResponse.data.data : [];
        const projectFromSummary = list.find((p) => String(p._id) === String(id));

        if (!projectFromSummary) {
          throw new Error("Project not found in public data");
        }

        // Pastikan ada gambar minimal (pakai thumbnail bila images kosong)
        const formattedProject = formatProjectData({
          ...projectFromSummary,
          images:
            Array.isArray(projectFromSummary.images) && projectFromSummary.images.length > 0
              ? projectFromSummary.images
              : projectFromSummary.thumbnail
                ? [projectFromSummary.thumbnail]
                : [],
        });

        setProject(formattedProject);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        if (err.response) {
          switch (err.response.status) {
            case 401:
            case 403:
              setError("Session expired. Please login again.");
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
            {(String(error).includes("Unauthorized") ||
              String(error).includes("Session expired")) && (
                <button
                  onClick={() => navigate("/login")}
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

  // Gambar yang dipakai (prioritas: images -> thumbnail -> fallback random)
  const displayImages =
    project.images && project.images.length > 0
      ? project.images
      : project.thumbnail
        ? [toAbsoluteUrl(project.thumbnail)]
        : [ourProjectImages[Math.floor(Math.random() * ourProjectImages.length)]];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/#projects")}
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
                <h1 className="text-3xl font-bold text-gray-800">
                  {project.title}
                </h1>
                <h2 className="text-xl text-blue-600 mt-2">
                  {project.framework}
                </h2>
              </div>

              <div
                className={`mt-4 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}
              >
                <StatusIcon className="mr-2" />
                {project.status}
              </div>
            </div>
          </div>

          {/* Project Image Gallery */}
          <div className="px-8 py-6 border-b border-gray-200">
            {displayImages.length > 0 ? (
              <>
                <div
                  className="relative rounded-lg overflow-hidden bg-gray-100"
                  style={{ height: "400px" }}
                >
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
              <div
                className="flex items-center justify-center bg-gray-100 rounded-lg"
                style={{ height: "300px" }}
              >
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Project Description
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {project.description || "No description available"}
                </p>
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
                        {safeDate(project.created_at || project.createdAt, "-")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="font-medium">{project.deadline}</p>
                    </div>
                    {project.completiondate &&
                      project.completiondate !== "On Progress" && (
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
                        {project.client?.nama_lengkap ||
                          project.client ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="font-medium">
                        {project.manager?.nama_lengkap ||
                          project.manager ||
                          "Not specified"}
                      </p>
                    </div>
                    {project.employees.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Team Members</p>
                        <ul className="space-y-1">
                          {project.employees.map((employee, index) => (
                            <li key={index} className="flex items-center">
                              <FiUser className="mr-2 text-gray-500" />
                              {employee?.nama_lengkap ||
                                employee ||
                                `Team Member ${index + 1}`}
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
                          href={
                            project.figma.startsWith("http")
                              ? project.figma
                              : `https://${project.figma}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          Figma Design
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No Figma link available
                      </p>
                    )}
                    {project.github_repo_url ? (
                      <div className="flex items-center">
                        <FaGithub className="text-gray-500 mr-2" />
                        <a
                          href={
                            project.github_repo_url.startsWith("http")
                              ? project.github_repo_url
                              : `https://${project.github_repo_url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          GitHub Repository
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No GitHub repository available
                      </p>
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
                <p className="text-sm opacity-80">
                  INFO REALITY.<strong>Bytelogi.com@2025</strong>
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium mb-1">Contact us</p>
                <a
                  href="tel:+6287702064017"
                  className="text-sm opacity-80 hover:opacity-100"
                >
                  +6287702064017
                </a>
                <a
                  href="mailto:hello@bysteige.com"
                  className="text-sm opacity-80 hover:opacity-100"
                >
                  hello@bytelogic.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;