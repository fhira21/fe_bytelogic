import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loginImg from "../assets/images/register.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
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
      console.log("RESPON DARI BACKEND:", res.data); // 
  
      const { token, role } = res.data;
      console.log("ROLE YANG DITERIMA:", role); // 
  
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
  
      const roleLower = role.toLowerCase();

      console.log("ROLE YANG DITERIMA:", roleLower); //

      if (roleLower === "manager/admin") {
        console.log("Navigating to dashboard-manager");
        navigate("/dashboard-manager");
      } else if (roleLower === "karyawan") {
        navigate("/dashboard-karyawan");
      } else if (roleLower === "client") {
        navigate("/dashboard-klien");
      } else {
        setError("Role tidak dikenali.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login gagal. Periksa username dan password.");
    }
  };  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <img 
          src={loginImg} 
          alt="Login Illustration" 
          className="w-1/2 object-cover hidden md:block" 
        />

        <div className="w-full md:w-1/2 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-center text-gray-800">Selamat Datang!</h2>

            {error && (
              <p className="text-red-500 text-sm text-center py-2 px-4 bg-red-50 rounded">
                {error}
              </p>
            )}

            <div>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <span 
                onClick={togglePassword} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700"
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
                Ingat Saya
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;