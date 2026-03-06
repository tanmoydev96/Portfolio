import React, { useState } from "react";
import "./Project.css";

const projectData = [
    {
        id: 1,
        title: "Unified Aerothermal Application",
        description:
            "Modernized four legacy WinForms automotive engineering tools into a unified React + .NET 8 platform used by Fiat Chrysler Automobiles to analyze engine component durability. The system processes telemetry data (.dat / .sol) from vehicle road tests, performs aerothermal stress simulations, and generates 25-sheet Excel reports with charts and performance metrics. Replaced COM-based Excel automation with OpenXML to significantly improve report generation speed.",
        tech: [
            "C#",
            ".NET 8",
            "ASP.NET Core",
            "React",
            "Redux Toolkit",
            "IBM DB2",
            "Entity Framework Core",
            "ADO.NET",
            "AG Grid",
            "Material UI",
            "OpenXML"
        ]
    },
    {
        id: 2,
        title: "ACWA (Altitude Chart Web Application II)",
        description:
            "Developed and maintained scalable REST APIs for an engineering analytics platform used to generate altitude-based performance charts for automotive components. Implemented JWT authentication and applied Repository and Unit of Work patterns to improve maintainability and code structure.",
        tech: [
            "C#",
            ".NET 8",
            "ASP.NET Core Web API",
            "JWT Authentication",
            "Entity Framework Core",
            "Repository Pattern",
            "Unit of Work"
        ]
    },
    {
        id: 3,
        title: "PowerGrid Announcement System",
        description:
            "Built a full-stack announcement broadcasting platform for manufacturing floor display systems to show live and historical announcements with secure authentication. Developed backend services using .NET 8 Web API and implemented a responsive frontend using React.",
        tech: [
            "C#",
            ".NET 8",
            "ASP.NET Core Web API",
            "React",
            "REST API",
            "Authentication"
        ]
    },
    {
        id: 4,
        title: "Server Monitoring Automation Tools",
        description:
            "Developed 10+ automated console applications scheduled via Windows Task Scheduler to monitor servers, track disk usage, and manage software versions across systems, improving operational visibility and reducing manual monitoring effort.",
        tech: [
            "C#",
            ".NET",
            "Console Applications",
            "Windows Task Scheduler",
            "Automation",
            "Server Monitoring"
        ]
    }
]

const Projects = () => {
    const [selectedProject, setSelectedProject] = useState(null);

    return (
        <section className="projects section" id="projects">
            <h2 className="section__title">Projects</h2>
            <span className="section__subtitle">My Recent Work</span>

            <div className="projects__container container grid">
                {projectData.map((project) => (
                    <div
                        key={project.id}
                        className="project__card"
                        onClick={() => setSelectedProject(project)}
                    >
                        <h3 className="project__title">{project.title}</h3>
                        <span className="project__view">View Details →</span>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedProject && (
                <div className="project__modal">
                    <div className="project__modal-content">
                        <span
                            className="project__modal-close"
                            onClick={() => setSelectedProject(null)}
                        >
                            ×
                        </span>

                        <h3 className="project__modal-title">
                            {selectedProject.title}
                        </h3>

                        <p className="project__modal-description">
                            {selectedProject.description}
                        </p>

                        <div className="project__modal-tech">
                            <h4>Tech Stack:</h4>
                            <ul>
                                {selectedProject.tech.map((tech, index) => (
                                    <li key={index}>{tech}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Projects;