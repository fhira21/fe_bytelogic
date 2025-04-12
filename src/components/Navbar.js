import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../style/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Cek apakah halaman saat ini adalah login atau home
  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="ByteLogic Logo" className="logo" />
      </div>

      {(isLoginPage || isHomePage) && (
        <div className="navbar-right">
          {isLoginPage ? (
            <Link to="/" className="home-button">Home</Link>
          ) : (
            <Link to="/login" className="home-button">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
