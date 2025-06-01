import React from "react";
import { Link, useLocation } from "react-router-dom";
// import "../style/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Empty div to maintain space balance (replaces logo space) */}
      <div className="w-1/4"></div>

      {/* Center navigation menu */}
      <ul className="flex justify-center space-x-8 text-lg">
        <li>
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-md ${pathname === "/" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
          >
            Beranda
          </Link>
        </li>
        <li>
          <Link 
            to="/project" 
            className={`px-3 py-2 rounded-md ${pathname === "/project" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
          >
            Project
          </Link>
        </li>
        <li>
          <Link 
            to="/evaluasi" 
            className={`px-3 py-2 rounded-md ${pathname === "/evaluasi" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
          >
            Evaluasi
          </Link>
        </li>
      </ul>

      {/* Right side buttons (only for login/home) */}
      {(isLoginPage || isHomePage) && (
        <div className="w-1/4 flex justify-end">
          {isLoginPage ? (
            <Link 
              to="/" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Home
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;