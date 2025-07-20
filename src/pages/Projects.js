import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OurProject1Image from "../assets/images/ourprojectsatu.png";
import OurProject2Image from "../assets/images/ourproject2.png";
import OurProject3Image from "../assets/images/ourproject3.png";
import OurProject4Image from "../assets/images/ourproject4.png";
import OurProject5Image from "../assets/images/ourproject5.png";
import OurProject6Image from "../assets/images/ourproject6.png";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get("http://localhost:5000/api/projects/summary");

            if (!res.data || !Array.isArray(res.data.data)) {
                throw new Error("Format data proyek tidak valid");
            }

            const formattedProjects = res.data.data.map(project => ({
                id: project._id,
                title: project.title,
                description: project.description,
                framework: project.framework,
                figma: project.figma,
                githubUrl: project.github_repo_url,
                images: project.images || [],
                status: project.status
            }));

            setProjects(formattedProjects);
        } catch (err) {
            console.error("Error fetching projects:", err);
            let errorMessage = "Gagal memuat proyek";

            if (err.response) {
                errorMessage += `: ${err.response.data.message || err.response.statusText}`;
            } else if (err.request) {
                errorMessage += ": Tidak ada response dari server";
            } else {
                errorMessage += `: ${err.message}`;
            }

            setError(errorMessage);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        navigate(`/projects/${projectId}`, {
            state: {
                project: project || null
            }
        });
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* Header */}
            <header className="bg-white shadow-sm py-4 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">All Projects</h1>
                <p className="text-xl text-gray-600 mb-12 text-center">
                    Explore our complete portfolio of digital solutions and innovations.
                </p>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button
                            onClick={fetchProjects}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="h-54 overflow-hidden">
                                    {project.images.length > 0 ? (
                                        <img
                                            src={project.images[0]}
                                            alt={project.title}
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={
                                                index === 0 ? OurProject1Image :
                                                    index === 1 ? OurProject2Image :
                                                        index === 2 ? OurProject3Image :
                                                            index === 3 ? OurProject4Image :
                                                                index === 4 ? OurProject5Image : OurProject6Image
                                            }
                                            alt={project.title}
                                            className="w-full h-64 object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                                    <p className="text-gray-600 mb-2">
                                        <strong>Framework:</strong> {project.framework}
                                    </p>
                                    <p className="text-gray-600 line-clamp-3">{project.description}</p>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <span className={`px-2 py-1 text-xs rounded-full ${project.status === "Completed" ? "bg-green-100 text-green-800" :
                                        project.status === "On Progress" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-gray-100 text-gray-800"
                                        }`}>
                                        {project.status}
                                    </span>
                                    <button
                                        onClick={() => handleViewDetail(project.id)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        View Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No projects available
                    </div>
                )}
            </main>

            <div className="bg-white text-black shadow-md">
            {/* Footer Section */}
            <footer className="w-full bg-white-900 text-black-900 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-sm opacity-70">CONNECTING YOUR IDEAS</p>
                            <p className="text-sm opacity-70">INTO REALITY.<b>Bytelogi.com@2025</b></p>
                        </div>
                        <div className="flex items-center space-x-6">
                            <p className="text-sm opacity-70"><b>Contact Us</b></p>
                            <span className="h-12 w-px bg-blue-400"></span>
                            <div className="flex flex-col">
                                <a
                                    href="https://wa.me/6283121596554"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <b>+6283121596554</b>
                                </a>
                                <a
                                    href="mailto:hello@bytelogic.com"
                                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    hello@bytelogic.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </div>
    );
}

export default Projects;