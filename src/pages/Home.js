// src/pages/Home.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import AboutUsImage from "../assets/images/AboutUs.jpg";
import WelcomeImage from "../assets/images/welcome.png";
import OurProject1Image from "../assets/images/ourprojectsatu.png";
import OurProject2Image from "../assets/images/ourproject2.png";
import OurProject3Image from "../assets/images/ourproject3.png";
import OurProject4Image from "../assets/images/ourproject4.png";
import OurProject5Image from "../assets/images/ourproject5.png";
import OurProject6Image from "../assets/images/ourproject6.png";

const API_BASE = "https://be.bytelogic.orenjus.com";

const toAbsoluteUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
};

const WHATSAPP_NUMBER = "6283121596554";
function buildWhatsAppLink({ email, phone, message }) {
  const template = [
    "Halo Bytelogic, saya ingin diskusi tentang project.",
    "",
    "Kontak:",
    `• Email: ${email}`,
    `• Phone: ${phone}`,
    "",
    "Pesan:",
    message,
    "",
    "(Dikirim dari website Bytelogic)",
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(template)}`;
}

/* Animations */
const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.15, when: "beforeChildren", staggerChildren: 0.12 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const zoomIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const sectionStagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

/** urutan section untuk scroll-spy */
const SECTION_IDS = ["home", "about", "services", "projects", "review", "contact"];

function Home() {
  const [, setShowLoginForm] = useState(false);

  // -------- Scroll-Spy (highlight tab) --------
  const [activeSection, setActiveSection] = useState("home");

  // -------- Reviews --------
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  // -------- Contact --------
  const [contactForm, setContactForm] = useState({ email: "", phone: "", message: "" });

  // -------- Projects --------
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const navigate = useNavigate();

  // === Intro animation (tampil sekali saat load/refresh) ===
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const [showIntro, setShowIntro] = useState(!prefersReducedMotion);

  // Kunci scroll saat intro aktif
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = showIntro ? "hidden" : original || "";
    return () => {
      document.body.style.overflow = original || "";
    };
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro) {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (!reduce) {
        window.dispatchEvent(new Event("bytelogic:intro-finished"));
      }
    }
  }, [showIntro]);

  useEffect(() => {
  if (window.location.hash) {
    const el = document.getElementById(window.location.hash.replace("#", ""));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}, []);

  /* Services scroller */
  const servicesRef = useRef(null);
  const scrollServicesBy = (delta) => servicesRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const handleContactChange = (e) => setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const url = buildWhatsAppLink(contactForm);
    window.open(url, "_blank");
    setContactForm({ email: "", phone: "", message: "" });
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      setReviewsError(null);
      const res = await axios.get(`${API_BASE}/api/reviews`);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const formatted = list.map((item) => ({
        clientName: item.client_id?.nama_lengkap || "Anonymous Client",
        comment: item.review,
        rating: item.rating,
        date: item.createdAt,
        clientPhoto: item.client_id?.foto_profile || "https://via.placeholder.com/80",
      }));
      setReviews(formatted);
    } catch (err) {
      setReviewsError(`Gagal memuat review: ${err.message}`);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectsError(null);
      const res = await axios.get(`${API_BASE}/api/projects/summary`);
      const raw = Array.isArray(res.data?.data) ? res.data.data : [];
      const base = raw.map((p) => ({
        id: p._id,
        title: p.title,
        description: p.description,
        framework: p.framework,
        figma: p.figma,
        githubUrl: p.github_repo_url,
        images: (p.images || []).map(toAbsoluteUrl),
        status: p.status || "Waiting List",
      }));

      const needIds = base.slice(0, 6).filter((p) => !p.images || p.images.length === 0).map((p) => p.id);
      if (needIds.length) {
        const idToIndex = new Map();
        base.slice(0, 6).forEach((p, idx) => idToIndex.set(p.id, idx));
        const results = await Promise.allSettled(needIds.map((id) => axios.get(`${API_BASE}/api/projects/${id}`)));
        results.forEach((r, i) => {
          const id = needIds[i];
          if (r.status === "fulfilled") {
            const data = r.value?.data?.data || {};
            const imgs = (data.images || []).map(toAbsoluteUrl);
            const idx = idToIndex.get(id);
            if (idx != null && imgs.length) {
              base[idx] = { ...base[idx], images: imgs, status: data.status || base[idx].status };
            }
          }
        });
      }
      setProjects(base);
    } catch (err) {
      let errorMessage = "Gagal memuat proyek";
      if (err.response) errorMessage += `: ${err.response.data?.message || err.response.statusText}`;
      else if (err.request) errorMessage += ": Tidak ada response dari server";
      else errorMessage += `: ${err.message}`;
      setProjectsError(errorMessage);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleViewDetail = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    navigate(`/projects/${projectId}`, { state: { project: project || null } });
  };

  // ====== SCROLL-SPY GLUE (tanpa mengubah UI top bar kamu) ======

  // Smooth scroll jika user klik link di topbar yang punya data-spy-link
  useEffect(() => {
    const clickHandler = (e) => {
      const btn = e.target.closest("[data-spy-link]");
      if (!btn) return;
      const id = btn.getAttribute("data-spy-link");
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, []);

  // IntersectionObserver untuk menentukan section aktif
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -50% 0px", // fokus tengah viewport
        threshold: 0,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  // Toggle highlight navbar berdasarkan section aktif (scroll-spy)
  useEffect(() => {
    // kelas aktif
    const ADD_ACTIVE = ["text-blue-700", "border-blue-600"];
    // kelas default (non-aktif di Home)
    const ADD_INACTIVE = ["text-gray-700", "border-transparent"];
    const REMOVE_INACTIVE = ["text-gray-700", "border-transparent"];
    const REMOVE_ACTIVE = ["text-blue-700", "border-blue-600"];

    // target hanya <a data-spy-link>
    const links = document.querySelectorAll("a[data-spy-link]");
    links.forEach((el) => {
      const id = el.getAttribute("data-spy-link");
      if (id === activeSection) {
        // jadikan aktif: biru + underline biru
        REMOVE_INACTIVE.forEach((c) => el.classList.remove(c));
        ADD_ACTIVE.forEach((c) => el.classList.add(c));
        el.setAttribute("aria-current", "page");
      } else {
        // non-aktif: abu-abu + underline transparan
        REMOVE_ACTIVE.forEach((c) => el.classList.remove(c));
        ADD_INACTIVE.forEach((c) => el.classList.add(c));
        el.removeAttribute("aria-current");
      }
    });
  }, [activeSection]);

  // ====== fetch data ======
  useEffect(() => {
    fetchProjects();
    fetchReviews();
  }, []);

  return (
    <>
      {/* Intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[70] bg-blue-600 flex items-center justify-center"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
            onAnimationComplete={() => setShowIntro(false)}
          >
            <div className="flex flex-col items-center text-white">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center mb-4"
              >
                <span className="text-2xl font-bold">B</span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-xl font-semibold tracking-wide"
              >
                Bytelogic
              </motion.p>
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 96, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                className="mt-3 h-0.5 bg-white/80 rounded-full"
                style={{ width: 96 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konten halaman */}
      <motion.div className="flex flex-col h-screen w-full overflow-hidden" variants={pageVariants} initial="hidden" animate="show">
        {/* NOTE: Tidak ada header/nav baru di sini. Top bar kamu tetap dipakai di luar Home.js */}

        <div className="flex-1 overflow-y-auto w-full overflow-x-hidden scrollbar-hide">
          {/* Welcome Section */}
          <section id="home" className="scroll-mt-24 w-full bg-white-100 py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8"
              variants={sectionStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div className="md:w-3/3" variants={fadeUp}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 mt-10 sm:mt-16">
                  WELCOME TO BYTELOGIC
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
                  Your Trusted Partner in Website Development - Building Digital Success, Together.
                </p>
                <motion.button
                  onClick={() => {
                    const el = document.getElementById("contact");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
                  variants={zoomIn}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </motion.div>

              <motion.div className="md:w-1/3 w-full" variants={zoomIn}>
                <div className="w-full aspect-[16/10] md:aspect-[4/3] rounded-lg shadow-md overflow-hidden">
                  <img src={WelcomeImage} alt="Welcome" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* About Us Section */}
          <section id="about" className="scroll-mt-24 w-full bg-gray-100 py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 sm:gap-8"
              variants={sectionStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
            >
              <motion.div className="md:w-2/3" variants={fadeUp}>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">About Us</h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Bytelogic</h2>
                <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                  Bytelogic specialize in crafting innovative, high-performance websites tailored to meet the unique needs of businesses across various industries. As a leading IT agency, our mission is to empower brands by delivering cutting-edge digital solutions that drive growth, enhance user experience, and maximize online presence.
                </p>
                <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                  Our team of skilled developers, designers, and strategists work collaboratively to create responsive, SEO-friendly websites using the latest technologies and best practices. Whether you need a sleek corporate site, an engaging e-commerce platform, or a custom web application, Bytelogic is committed to turning your vision into reality with precision and creativity.
                </p>
                <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                  Choose Bytelogic for reliable service, transparent communication, and results-driven solutions that elevate your business in the digital world.
                </p>
              </motion.div>

              <motion.div className="md:w-1/3 flex items-center justify-center" variants={zoomIn}>
                <div className="w-full max-w-md aspect-[16/10] md:aspect-[4/3] rounded-lg shadow-md overflow-hidden">
                  <img src={AboutUsImage} alt="About Us" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Services Section (horizontal + panah) */}
          <section id="services" className="scroll-mt-24 w-full bg-blue-100 py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                Our Services
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 sm:mb-12 text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                We help turn your ideas into impactful digital solutions — from intuitive interface design, SEO optimization, website and mobile app development, to virtualization services for greater system efficiency.
              </motion.p>

              <div className="relative w-full">
                {/* Panah kiri */}
                <button
                  aria-label="Scroll Left"
                  onClick={() => scrollServicesBy(-360)}
                  className="hidden sm:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Panah kanan */}
                <button
                  aria-label="Scroll Right"
                  onClick={() => scrollServicesBy(360)}
                  className="hidden sm:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <div
                  ref={servicesRef}
                  className="flex overflow-x-auto pb-6 px-4 sm:px-8 md:px-10 gap-4 sm:gap-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                >
                  {[
                    { title: "UI/UX Design", desc: "At the heart of every great product is a seamless user experience..." },
                    { title: "Website Development", desc: "We create high-performance, user-friendly, and scalable websites..." },
                    { title: "Mobile App", desc: "Whether you're looking to build a new app or improve an existing one..." },
                    { title: "Virtualization", desc: "Modernize operations, optimize efficiency, and reduce costs..." },
                  ].map((card, idx) => (
                    <motion.div
                      key={idx}
                      className="snap-start flex-none w-72 sm:w-80 md:w-96 min-h-[220px] sm:min-h-[240px] bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.2 }}
                      whileHover={{ y: -4 }}
                    >
                      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 text-center">{card.title}</h2>
                      <p className="text-white/90 text-center text-sm sm:text-base">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Our Projects Section (grid) */}
          <section
            id="projects"
            className="scroll-mt-24 w-full bg-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
                Our Projects
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 text-center">
                Explore our completed projects – each one reflects our dedication to
                delivering comprehensive digital solutions.
              </p>

              {loadingProjects ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : projectsError ? (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">{projectsError}</div>
                  <button
                    onClick={fetchProjects}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
                  {projects.slice(0, 6).map((project, index) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col"
                    >
                      {/* Gambar */}
                      <div className="overflow-hidden">
                        <div className="w-full aspect-[16/10]">
                          <img
                            src={
                              project.images?.[0] ||
                              [
                                OurProject1Image,
                                OurProject2Image,
                                OurProject3Image,
                                OurProject4Image,
                                OurProject5Image,
                                OurProject6Image,
                              ][index] ||
                              OurProject6Image
                            }
                            alt={project.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Konten */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-2">
                          <strong>Framework:</strong> {project.framework}
                        </p>
                        <p className="text-gray-600 line-clamp-3 flex-1">
                          {project.description}
                        </p>

                        {/* Tombol pojok kanan bawah */}
                        <div className="mt-auto flex justify-end">
                          <button
                            onClick={() => handleViewDetail(project.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            View Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No projects available</div>
              )}

              {projects.length > 6 && (
                <div className="mt-12 flex justify-end">
                  <button
                    onClick={() => navigate("/projects")}
                    className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
                  >
                    See More
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Reviews */}
          <section id="review" className="scroll-mt-24 w-full bg-blue-100 py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                Reviews
              </motion.h1>

              {loadingReviews && reviews.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : reviewsError ? (
                <motion.div className="text-center text-red-500 py-8" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                  {reviewsError}
                </motion.div>
              ) : (
                <motion.div className="mt-8 space-y-8" variants={sectionStagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                  {reviews.map((review, index) => (
                    <motion.div key={index} className="space-y-2" variants={fadeUp}>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{review.clientName}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 sm:w-5 h-4 sm:h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                      {index !== reviews.length - 1 && <hr className="mt-6 border-gray-300" />}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="scroll-mt-24 w-full bg-[#3B82F6] py-16 pl-0 pr-0 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="relative">
                <motion.div
                  className="bg-white rounded-2xl sm:rounded-r-3xl sm:rounded-l-none p-6 sm:p-8 md:p-12 shadow-lg -ml-0 sm:-ml-4 md:-ml-8 lg:-ml-16 xl:-ml-60"
                  variants={zoomIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div className="flex flex-col justify-center" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#3B82F6] mb-6 text-left">
                          Let's talk
                          <br /> about your <br /> project
                        </h2>
                      </motion.div>

                      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <form className="space-y-6" onSubmit={handleContactSubmit}>
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                name="email"
                                value={contactForm.email}
                                onChange={handleContactChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your email"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <input
                                type="tel"
                                name="phone"
                                value={contactForm.phone}
                                onChange={handleContactChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your phone"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                              <input
                                type="text"
                                name="message"
                                value={contactForm.message}
                                onChange={handleContactChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your message"
                                required
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
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full bg-white-900 text-black-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm opacity-70">CONNECTING YOUR IDEAS</p>
                  <p className="text-sm opacity-70">
                    INTO REALITY.<b>Bytelogi.com@2025</b>
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <p className="text-sm opacity-70">
                    <b>Contact Us</b>
                  </p>
                  <span className="h-12 w-px bg-blue-400"></span>
                  <div className="flex flex-col">
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <b>+{WHATSAPP_NUMBER}</b>
                    </a>
                    <a href="mailto:hello@bytelogic.com" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                      hello@bytelogic.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </motion.div>
    </>
  );
}

export default Home;
