import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Login.css";
import loginImg from "../assets/images/register.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // const CLIENT_ROLE = "client";
  // const EMPLOYEE_ROLE = "karyawan";
  // const ADMIN_ROLE = "manager/admin";

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
    <div className="login-container">
      <div className="login-box">
        <img src={loginImg} alt="Login Illustration" className="login-image" />

        <div className="login-form-frame">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Selamat Datang!</h2>

            {error && <p className="error-message">{error}</p>}

            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span onClick={togglePassword} className="toggle-password">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Ingat Saya</label>
            </div>

            <button className="login-button" type="submit">Masuk</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
