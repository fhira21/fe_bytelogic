import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";

const HomePage = () => {
  const navigate = useNavigate(); // <-- Tambahan

  const handleDetailClick = (projectId) => {
    navigate(`/project/${projectId}`); // <-- Navigasi ke halaman detail
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <header className="header-section">
        <h1>
          WELOCOME TO <span className="highlight">BYTELOGIC</span>
        </h1>
        <p>Your Trusted Partner in Website Development — Building Digital Success, Together.</p>

        {/* Tambahkan tombol Get Started di sini */}
        <button className="get-started-btn" onClick={() => navigate("/get-started")}>
          Get Started
        </button>
      </header>


      {/* Riwayat Project */}
      <section className="project-history">
        <h2>
          Riwayat <span className="highlight">Project</span>
        </h2>
        <div className="project-cards">
          <div className="project-card">
            <img src="/project.png" alt="Landing Page Design" />
            <h3>Project A</h3>
            <p>Aplikasi Manajemen Karyawan dan Evaluasi Kinerja Karyawan</p>
            <button className="detail-btn" onClick={() => handleDetailClick("project-a")}>
              Lihat Detail
            </button>
          </div>
          <div className="project-card">
            <img src="/project.png" alt="Landing Page Design" />
            <h3>Project B</h3>
            <p>Aplikasi Manajemen Karyawan dan Evaluasi Kinerja Karyawan</p>
            <button className="detail-btn" onClick={() => handleDetailClick("project-b")}>
              Lihat Detail
            </button>
          </div>
          <div className="project-card">
            <img src="/project.png" alt="Landing Page Design" />
            <h3>Project C</h3>
            <p>Aplikasi Manajemen Karyawan dan Evaluasi Kinerja Karyawan</p>
            <button className="detail-btn" onClick={() => handleDetailClick("project-c")}>
              Lihat Detail
            </button>
          </div>
        </div>
      </section>

      {/* Progres Project */}
      <section className="project-progress">
        <h2>
          Progres <span className="highlight">Project</span>
        </h2>
        <ul className="progress-list">
          <li>
            <strong>Project A</strong>
            <p>Aplikasi Manajemen Karyawan dan Evaluasi Kinerja Karyawan</p>
          </li>
          <li>
            <strong>Project B</strong>
            <p>Aplikasi Manajemen Karyawan dan Evaluasi Kinerja Karyawan</p>
          </li>
          <li>
            <strong>Project C</strong>
            <p>Aplikasi Manajemen Karyawan dan Evaluasi Kinerja Karyawan</p>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <h3>Jangan lewatkan kabar terbaru dari kami</h3>
          <div className="subscription-form">
            <input type="email" placeholder="Masukkan email Anda" />
            <button>Kirim via Whatsapp</button>
          </div>
        </div>
        <div className="footer-right">
          <h4>Contact Person Admin</h4>
          <p>📞 WhatsApp</p>
          <p>📧 Email</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
