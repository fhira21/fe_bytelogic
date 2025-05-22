import React from 'react';
import { useParams } from 'react-router-dom';
import '../style/ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();

  const dummyProject = {
    name: 'Sistem Evaluasi Kinerja Pegawai',
    description: 'Aplikasi untuk mengevaluasi kinerja pegawai dengan 3 role utama.',
    status: 'Sedang Berjalan',
    startDate: '2025-01-15',
    deadline: '2025-04-30',
    progress: 60,
    client: {
      name: 'Andi Wijaya',
      email: 'andi@bytelogic.co.id',
      company: 'PT ByteLogic Teknologi',
    },
  };

  return (
    <div className="project-detail-container">
      <div className="project-info">
        <h2 className="project-title">{dummyProject.name} (ID: {id})</h2>
        <p><strong>Deskripsi:</strong> {dummyProject.description}</p>
        <p><strong>Status:</strong> <span className="status-badge">{dummyProject.status}</span></p>
        <p><strong>Tanggal Mulai:</strong> {dummyProject.startDate}</p>
        <p><strong>Deadline:</strong> {dummyProject.deadline}</p>
        <p><strong>Progress:</strong> {dummyProject.progress}%</p>
      </div>

      <div className="client-info">
        <h3>Client Info</h3>
        <p><strong>Nama:</strong> {dummyProject.client.name}</p>
        <p><strong>Email:</strong> {dummyProject.client.email}</p>
        <p><strong>Perusahaan:</strong> {dummyProject.client.company}</p>
      </div>
    </div>
  );
}

export default ProjectDetail;
