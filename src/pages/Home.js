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
    // Here you would typically send the contact form data to your backend
    console.log("Contact form submitted:", contactForm);
    alert("Thank you for your message! We'll get back to you soon.");
    setContactForm({ email: "", phone: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", formData);
      console.log("RESPONSE FROM BACKEND:", res.data);

      const { token, role } = res.data;
      console.log("RECEIVED ROLE:", role);

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      const roleLower = role.toLowerCase();
      if (roleLower === "manager/admin") {
        navigate("/dashboard-manager");
      } else if (roleLower === "karyawan") {
        navigate("/dashboard-karyawan");
      } else if (roleLower === "client") {
        navigate("/dashboard-klien");
      } else {
        setError("Role not recognized.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Check username and password.");
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      setReviewsError(null);

      const res = await axios.get("http://localhost:5000/api/reviews");

      console.log("Full API response:", res.data); // Untuk debugging

      // Pastikan response memiliki struktur yang benar
      if (!res.data || !Array.isArray(res.data.data)) {
        throw new Error("Format data tidak valid dari server");
      }

      // Transformasi data dari backend ke format yang diharapkan frontend
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

  const loadMoreReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`http://localhost:5000/api/reviews?offset=${reviews.length}`);

      if (Array.isArray(res?.data)) {
        setReviews([...reviews, ...res.data]);
      }
    } catch (err) {
      setReviewsError("Failed to load more reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header without Login Button */}
      <header className="bg-white shadow-sm py-4 w-full">
        {/* Empty header without login button */}
      </header>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <span
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
        {/* Welcome Section */}
        <div className="w-full bg-white-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
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
        <div className="w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
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
        <div className="w-full bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Our Projects</h1>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Explore our completed projects – each one reflects our dedication to delivering comprehensive digital solutions through thoughtful design, strategic development, and seamless, inclusive user experiences.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Project 1 Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-54 overflow-hidden">
                  <img
                    src={OurProject1Image}
                    alt="ourproject1"
                    className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    <strong>Website Digital Marketing</strong> <h2>BoldHive is a digital marketing agency that helps businesses grow through services such as market research, content marketing, SEO, and media distribution — all powered by creative approaches and data-driven strategies.</h2>
                  </p>
                </div>
                <div className="p-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>

              {/* Project 2 Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-54 overflow-hidden">
                  <img
                    src={OurProject2Image}
                    alt="ourproject2"
                    className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    <strong>Website Packaging Company</strong> <h2>Packify provides smart, eco-friendly packaging solutions tailored to your brand's needs. From material sourcing to logistics, we ensure quality, innovation, and customer satisfaction at every step.</h2>
                  </p>
                </div>
                <div className="p-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>

              {/* Project 3 Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-54 overflow-hidden">
                  <img
                    src={OurProject3Image}
                    alt="ourproject3"
                    className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    <strong>Website Coffee Store</strong> <h2>Madcap Coffee offers a curated selection of premium coffee blends with a focus on quality, taste, and exceptional café hospitality. From single-origin beans to monthly subscriptions, enjoy a coffee experience crafted with care.</h2>
                  </p>
                </div>
                <div className="p-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Project 4 Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-54 overflow-hidden">
                  <img
                    src={OurProject4Image}
                    alt="ourproject4"
                    className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    <strong>Website Anemia Prediction</strong> <h2>A health-tech web app that uses deep learning and palm scan technology to detect anemia risk through your smartphone. Fast, accessible, and designed for early screening anywhere.</h2>
                  </p>
                </div>
                <div className="p-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>

              {/* Project 5 Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-54 overflow-hidden">
                  <img
                    src={OurProject5Image}
                    alt="ourproject5"
                    className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    <strong>Website Profile</strong> <h2>Faeznz Creative is a company profile website designed to showcase the identity and services of a creative tech studio. The website presents comprehensive information about its expertise in AI, website, and mobile application development.</h2>
                  </p>
                </div>
                <div className="p-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>

              {/* Project 6 Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="h-54 overflow-hidden">
                  <img
                    src={OurProject6Image}
                    alt="ourproject6"
                    className="rounded-lg shadow-md object-cover w-full h-auto max-h-64 md:max-h-80"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    <strong>Website E-commerce Tanaman Hias</strong><h2>A clean and modern e-commerce website for houseplants, offering a curated collection of plants to beautify your living space. Equipped with decor inspiration features and user-friendly navigation.</h2>
                  </p>
                </div>
                <div className="p-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 pr-12 sm:pr-2 lg:pr flex justify-end">
              <button
                onClick={() => setShowLoginForm(true)}
                className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
              >
                See More
              </button>
            </div>
          </div>
        </div>

        {/* Client Reviews Section */}
        <div className="w-full bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
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

        {/* New Contact Section - Exactly like the image */}
        <div className="w-full bg-[#3B82F6] py-16 pl-0 pr-0 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              {/* White rounded rectangle */}
              <div className="bg-white rounded-r-3xl rounded-l-none p-8 md:p-12 shadow-lg -ml-4 md:-ml-8 lg:-ml-16 xl:-ml-60">
                <div className="max-w-3xl mx-auto">
                  {/* Grid container untuk teks dan form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bagian teks di sebelah kiri */}
                    <div className="flex flex-col justify-center">
                      <h2 className="text-3xl font-bold text-[#3B82F6] mb-6 text-left">
                        Let's talk<br />
                        about your<br />
                        project
                      </h2>
                    </div>

                    {/* Bagian form di sebelah kanan */}
                    <div>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Your email"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Your phone"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Your message"
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

        {/* Footer Section - Matching the image */}
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
                {/* Container untuk nomor telepon dan email (disusun vertikal) */}
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
    </div>
  );
}

export default Home;