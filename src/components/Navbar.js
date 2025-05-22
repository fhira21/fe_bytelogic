import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
// import "../style/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="ByteLogic Logo" className="w-1/2" />
      </div>

      {/* Menu navigasi tengah */}
      <ul className="flex justify-center content-center text-xl space-x-4">
        <li><Link to="/">Beranda</Link></li>
        <li><Link to="/project">Project</Link></li>
        <li><Link to="/evaluasi">Evaluasi</Link></li>
      </ul>

      {/* Tombol kanan hanya untuk login/home */}
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
