import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";
import loginImg from "../assets/images/register.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // ✅ Pakai hook useNavigate

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // validasi atau login bisa ditambahkan di sini
    navigate("/dashboard-manager"); // ✅ Navigasi setelah login sukses
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={loginImg} alt="Login Illustration" className="login-image" />

        <div className="login-form-frame">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Selamat Datang!</h2>

            <input type="text" placeholder="Username" name="username" />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
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
