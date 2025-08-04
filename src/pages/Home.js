import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AboutUsImage from "../assets/images/AboutUs.jpg";
import WelcomeImage from "../assets/images/welcome.png";
import OurProject1Image from "../assets/images/ourprojectsatu.png";
import OurProject2Image from "../assets/images/ourproject2.png";
import OurProject3Image from "../assets/images/ourproject3.png";
import OurProject4Image from "../assets/images/ourproject4.png";
import OurProject5Image from "../assets/images/ourproject5.png";
import OurProject6Image from "../assets/images/ourproject6.png";

const styles = {
  hideScrollbar: {
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
};

function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
    message: ""
  });
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    alert("Thank you for your message! We'll get back to you soon.");
    setContactForm({ email: "", phone: "", message: "" });
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      setReviewsError(null);
      const res = await axios.get("http://be.bytelogic.orenjus.com/api/reviews");

      if (!res.data || !Array.isArray(res.data.data)) {
        throw new Error("Format data tidak valid dari server");
      }

      const formattedReviews = res.data.data.map(item => ({
        clientName: item.client_id?.nama_lengkap || "Anonymous Client",
        comment: item.review,
        rating: item.rating,
        date: item.createdAt,
        clientPhoto: item.client_id?.foto_profile || "https://via.placeholder.com/80"
      }));

      setReviews(formattedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviewsError(`Gagal memuat review: ${err.message}`);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectsError(null);

      const res = await axios.get("http://be.bytelogic.orenjus.com/api/projects/summary");

      if (!res.data || !Array.isArray(res.data.data)) {
        throw new Error("Format data proyek tidak valid");
      }

      const formattedProjects = res.data.data.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        framework: project.framework,
        figma: project.figma,
        githubUrl: project.github_repo_url,
        images: project.images || [],
        status: project.status
      }));

      setProjects(formattedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      let errorMessage = "Gagal memuat proyek";

      if (err.response) {
        errorMessage += `: ${err.response.data.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += ": Tidak ada response dari server";
      } else {
        errorMessage += `: ${err.message}`;
      }

      setProjectsError(errorMessage);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleViewDetail = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    navigate(`/projects/${projectId}`, {
      state: {
        project: project || null
      }
    });
  };

  useEffect(() => {
    fetchProjects();
    fetchReviews();
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header without Login Button */}
      <header className="bg-white shadow-sm py-4 w-full">
        {/* Empty header without login button */}
      </header>

      <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
        {/* Welcome Section */}
        <div id="home" className="w-full bg-white-100 py-12 px-4 sm:px-6 lg:px-8">          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="md:w-3/3">
            <h1 className="text-5xl font-bold text-gray-800 mb-6 mt-20">WELCOME TO BYTELOGIC</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your Trusted Partner in Website Development - Building Digital Success, Together.
            </p>
            <button
              onClick={() => setShowLoginForm(true)}
              className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
            >
              Get Started
            </button>
          </div>
          <div className="md:w-1/3 w-full">
            <img
              src={WelcomeImage}
              alt="Welcome"
              className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
            />
          </div>
        </div>
        </div>

        {/* About Us Section */}
        <div id="about" className="w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">About Us</h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Bytelogic</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Bytelogic specialize in crafting innovative, high-performance websites tailored to meet the unique needs of businesses across various industries. As a leading IT agency, our mission is to empower brands by delivering cutting-edge digital solutions that drive growth, enhance user experience, and maximize online presence.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Our team of skilled developers, designers, and strategists work collaboratively to create responsive, SEO-friendly websites using the latest technologies and best practices. Whether you need a sleek corporate site, an engaging e-commerce platform, or a custom web application, Bytelogic is committed to turning your vision into reality with precision and creativity.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Choose Bytelogic for reliable service, transparent communication, and results-driven solutions that elevate your business in the digital world.
            </p>
          </div>
          <div className="md:w-1/3 flex items-center justify-center">
            <img
              src={AboutUsImage}
              alt="About Us"
              className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
            />
          </div>
        </div>
        </div>

        {/* Services Section */}
        <div id="services" className="w-full bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Our Services</h1>
            <p className="text-xl text-gray-700 mb-12 text-center">
              We help turn your ideas into impactful digital solutions — from intuitive interface design, SEO optimization, website and mobile app development, to virtualization services for greater system efficiency.
            </p>

            <div className="relative w-full">
              <div className="flex overflow-x-auto pb-6 px-4 scrollbar-hide">
                <div className="flex flex-nowrap gap-8 min-w-max">
                  {/* UI/UX Design Card */}
                  <div className="w-96 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-center mb-4">
                      <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-3 text-center">UI/UX Design</h2>
                    <p className="text-gray-100 text-center">
                      At the heart of every great product is a seamless user experience, and we specialize in designing interfaces that are both visually stunning and highly structured. Our UI/UX design projects combine creativity with user-centered design principles to craft experiences that not only meet but exceed user expectations.
                    </p>
                  </div>

                  {/* Website Development Card */}
                  <div className="w-96 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-center mb-4">
                      <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-3 text-center">Website Development</h2>
                    <p className="text-gray-100 text-center">
                      We create high-performance, user-friendly, and scalable websites tailored to your business needs. Our expert team ensures this through engineering excellence, seamless functionality, expressive design, and optimized performance work in harmony. The result is a powerful digital asset built to deliver the best, most consistent user experience across all devices.
                    </p>
                  </div>

                  {/* Mobile App Card */}
                  <div className="w-96 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-center mb-4">
                      <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-3 text-center">Mobile App</h2>
                    <p className="text-gray-100 text-center">
                      Whether you're looking to build a new app from the ground up or improve on an existing one, we offer comprehensive solutions tailored to your unique needs. As your strategic partner, we help you forge a closer, more personal relationship with your customers. We provide these comprehensive, tailored solutions to meet your unique business objectives, right in the palm of their hands.
                    </p>
                  </div>

                  {/* Virtualization Card */}
                  <div className="w-96 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-center mb-4">
                      <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-3 text-center">Virtualization</h2>
                    <p className="text-gray-100 text-center">
                      Transform your traditional business processes with cutting-edge virtualization technology. Our virtualization services empower businesses to modernize their operations, optimize efficiency, and reduce costs by creating virtualized systems that mimic the functionality of physical infrastructure, all while maintaining full scalability and flexibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Projects Section */}
        <div id="projects" className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Our Projects</h1>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Explore our completed projects – each one reflects our dedication to delivering
              comprehensive digital solutions.
            </p>

            {loadingProjects ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : projectsError ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">{projectsError}</div>
                <button
                  onClick={fetchProjects}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {projects.slice(0, 6).map((project, index) => ( // Hanya menampilkan 6 project pertama
                    <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="h-54 overflow-hidden">
                        {project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-64 object-cover"
                          />
                        ) : (
                          <img
                            src={
                              index === 0 ? OurProject1Image :
                                index === 1 ? OurProject2Image :
                                  index === 2 ? OurProject3Image :
                                    index === 3 ? OurProject4Image :
                                      index === 4 ? OurProject5Image : OurProject6Image
                            }
                            alt={project.title}
                            className="w-full h-64 object-cover"
                          />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-2">
                          <strong>Framework:</strong> {project.framework}
                        </p>
                        <p className="text-gray-600 line-clamp-3">{project.description}</p>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${project.status === "Completed" ? "bg-green-100 text-green-800" :
                          project.status === "On Progress" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                          {project.status}
                        </span>
                        <button
                          onClick={() => handleViewDetail(project.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          View Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No projects available
              </div>
            )}

            {projects.length > 6 && ( // Hanya tampilkan tombol See More jika ada lebih dari 6 project
              <div className="mt-12 flex justify-end">
                <button
                  onClick={() => navigate("/projects")}
                  className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
                >
                  See More
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Client Reviews Section */}
      <div id="review" className="w-full bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Reviews</h1>

          {loadingReviews && reviews.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : reviewsError ? (
            <div className="text-center text-red-500 py-8">{reviewsError}</div>
          ) : (
            <div className="mt-8 space-y-8">
              {reviews.map((review, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">{review.clientName}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-700 mt-2">{review.comment}</p>

                  {index !== reviews.length - 1 && (
                    <hr className="mt-6 border-gray-300" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="w-full bg-[#3B82F6] py-16 pl-0 pr-0 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <div className="bg-white rounded-r-3xl rounded-l-none p-8 md:p-12 shadow-lg -ml-4 md:-ml-8 lg:-ml-16 xl:-ml-60">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-[#3B82F6] mb-6 text-left">
                      Let's talk<br />
                      about your<br />
                      project
                    </h2>
                  </div>

                  <div>
                    <form className="space-y-6" onSubmit={handleContactSubmit}>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={contactForm.email}
                            onChange={handleContactChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your email"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={contactForm.phone}
                            onChange={handleContactChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your phone"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                          <input
                            type="text"
                            name="message"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your message"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#3B82F6] text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-white-900 text-black-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm opacity-70">CONNECTING YOUR IDEAS</p>
              <p className="text-sm opacity-70">INTO REALITY.<b>Bytelogi.com@2025</b></p>
            </div>
            <div className="flex items-center space-x-6">
              <p className="text-sm opacity-70"><b>Contact Us</b></p>
              <span className="h-12 w-px bg-blue-400"></span>
              <div className="flex flex-col">
                <a
                  href="https://wa.me/6283121596554"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <b>+6283121596554</b>
                </a>
                <a
                  href="mailto:hello@bytelogic.com"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  hello@bytelogic.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </div >
  );
}

export default Home;