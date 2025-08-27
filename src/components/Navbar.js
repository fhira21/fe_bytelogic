// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";

  const [playWave, setPlayWave] = useState(false);

  // Mainkan gelombang setiap kali berada di Home (masuk ke / atau refresh).
  // Jika Home.js mem-broadcast "bytelogic:intro-finished", kita tunggu event itu.
  // Kalau tidak ada event, fallback otomatis setelah 300ms.
  useEffect(() => {
    if (!isHomePage) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    let played = false;

    const triggerWave = () => {
      if (played) return;
      played = true;
      setPlayWave(true);
      const stop = setTimeout(() => setPlayWave(false), 1600); // 6*100ms + 700ms + buffer
      // cleanup untuk timer stop
      return () => clearTimeout(stop);
    };

    // Dengarkan sinyal dari intro (kalau ada)
    const onIntroDone = () => triggerWave();
    window.addEventListener("bytelogic:intro-finished", onIntroDone);

    // Fallback: kalau tidak ada event dalam 300ms, jalankan saja
    const fallback = setTimeout(() => {
      onIntroDone();
    }, 300);

    return () => {
      window.removeEventListener("bytelogic:intro-finished", onIntroDone);
      clearTimeout(fallback);
    };
  }, [isHomePage]);

  const scrollToSection = (id) => {
    if (!isHomePage) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Base tanpa warna: tinggi stabil + underline stabil
  const baseLink =
    "inline-flex items-center h-10 sm:h-11 px-2 leading-none " +
    "border-b-2 box-content transition-colors text-sm sm:text-base";

  // Kelas default (non-aktif)
  const defaultLink = "text-gray-700 hover:text-blue-600 border-transparent";

  // Saat BUKAN di Home, aktifkan berdasarkan route
  const routeActive = (path) =>
    !isHomePage && pathname === path ? "text-blue-700 border-blue-600" : defaultLink;

  const items = [
    { label: "Home", id: "home", path: "/" },
    { label: "About", id: "about", path: "/about" },
    { label: "Services", id: "services", path: "/services" },
    { label: "Projects", id: "projects", path: "/projects" },
    { label: "Review", id: "review", path: "/review" },
    { label: "Contact", id: "contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto h-14 sm:h-16 flex items-center px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center mr-4 sm:mr-8">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={(e) => {
              if (isHomePage) { e.preventDefault(); scrollToSection("home"); }
            }}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full font-semibold text-sm flex items-center justify-center text-white">B</div>
            <span className="font-bold text-blue-500 hidden md:block">Bytelogic</span>
          </Link>
        </div>

        {!isLoginPage && (
          <>
            <ul className="flex items-center gap-3 sm:gap-5 mr-auto">
              {items.map(({ label, id, path }, idx) => (
                <li
                  key={id}
                  className={playWave ? "animate-nav-wave" : ""}
                  style={playWave ? { animationDelay: `${idx * 100}ms` } : undefined}
                >
                  <Link
                    to={path}
                    data-spy-link={id}
                    className={`${baseLink} ${routeActive(path)}`}
                    onClick={(e) => {
                      if (isHomePage) { e.preventDefault(); scrollToSection(id); }
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {isHomePage && (
              <div
                className={`flex ${playWave ? "animate-nav-wave" : ""}`}
                style={playWave ? { animationDelay: `${items.length * 100}ms` } : undefined}
              >
                <Link
                  to="/login"
                  className="px-5 sm:px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
