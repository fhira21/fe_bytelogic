import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";

  return (
    <nav className="flex items-center px-10 bg-white shadow-sm">
      {/* Logo dan Nama Bytelogic */}
      <div className="flex items-center mr-8 pt-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full font-semibold text-sm flex items-center justify-center text-white">B</div>
          <span className="font-bold text-blue-500 hidden md:block">Bytelogic</span>
        </Link>
      </div>

      {/* Menu navigasi - disembunyikan di halaman login */}
      {!isLoginPage && (
        <>
          <ul className="flex space-x-6 text-lg mr-auto pt-4">
            <li className="relative">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md ${pathname === "/" ? "text-black hover:text-black" : "text-gray-700 hover:text-blue-500"}`}
              >
                Home
                {pathname === "/" && (
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-14 h-0.5 bg-black rounded-full"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md ${pathname === "/about" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className={`px-3 py-2 rounded-md ${pathname === "/services" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className={`px-3 py-2 rounded-md ${pathname === "/projects" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                to="/review"
                className={`px-3 py-2 rounded-md ${pathname === "/review" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
              >
                Review
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-md ${pathname === "/contact" ? "font-bold text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Right side buttons - hanya ditampilkan di homepage */}
          {isHomePage && (
            <div className="w-1/4 flex justify-end mt-4">
              <Link
                to="/login"
                className="px-6 py-1 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;