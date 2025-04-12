# Employee Evaluation & Project Management System

## 📌 Deskripsi Proyek
Sistem ini adalah platform berbasis web untuk **evaluasi karyawan dan manajemen proyek** di perusahaan Bytelogic. Aplikasi ini membantu **manajer, karyawan, dan klien** dalam mengelola proyek serta melakukan evaluasi kinerja karyawan berdasarkan umpan balik dari klien dan manajer.

## 🎯 Fitur Utama
- **🔐 Authentication & Authorization**
  - Login berbasis peran: Manager, Karyawan, dan Klien
  - Keamanan menggunakan **JWT Authentication**
- **📊 Dashboard**
  - Tampilan proyek yang sedang berjalan dan yang telah selesai
  - Riwayat proyek sebelumnya
- **📂 Manajemen Proyek**
  - **Manager**: CRUD proyek, mengassign klien dan karyawan
  - **Karyawan**: Update progres proyek
  - **Klien**: Melihat progres proyek yang dipesan
- **📑 Evaluasi Kinerja**
  - **Klien & Manajer** dapat memberikan penilaian terhadap karyawan
  - Penilaian menggunakan **Likert scale (1-5)**
  - Hasil evaluasi dapat dilihat oleh **Manager & Karyawan yang dinilai**


### **Backend**
- **Node.js & Express.js**
- **MongoDB** untuk database
- JWT untuk autentikasi
- Swagger untuk dokumentasi API

## 🚀 Cara Menjalankan Proyek
### **1. Clone Repository**
```sh
git clone https://github.com/fhira21/fe_bytelogic.git
cd NAMA-REPO
```

### **2. Install Dependencies**
#### Backend:
```sh
cd be_penilaian
npm install
```

### **3. Konfigurasi Environment**
Buat file `.env` di folder backend dan isi dengan konfigurasi berikut:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### **4. Jalankan Server Backend**
```sh
cd be_penilaian
npm start
```


## 📖 Dokumentasi API (Swagger)
Setelah backend berjalan, buka di browser:
```
http://localhost:5000/api-docs
```

## 📌 Kontributor
- **Fhira Triana Maulani**
- **Nur Wahyu Suci Rahayu**

---
💡 *Feel free to contribute and improve this project!* 🎉
