import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AboutUsImage from "../assets/images/AboutUs.jpg"; // Make sure this path is correct

function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
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

  return (
    <div className="flex flex-col h-screen">
      {/* Header without Login Button */}
      <header className="bg-white shadow-sm py-4 px-6">
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">WELCOME TO BYTELOGIC</h1>
          <p className="text-xl text-gray-600 italic mb-8">
            Your Trusted Partner in Website Development - Building Digital Success, Together.
          </p>

          {/* Get Started Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowLoginForm(true)}
              className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
            >
              Get Started
            </button>
          </div>

          <div className="border-t border-gray-300 my-8"></div>

          {/* Bytelogic Section with Image */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="md:w-2/3">
             <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">About Us</h1>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Bytelogic</h2>

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
    </div>
    </div >
  );
}

export default Home;