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
    },
    {
        id: 5,
        title: "CSV Channel Export Tool – DataNav Catalyst Dyno Integration",
        description:
            "Developed a WPF-based desktop utility tightly integrated with DataNav Catalyst Dyno, a specialized automotive test data management platform used in dyno testing workflows. The tool enables engineers to selectively extract only the required measurement channels from 250+ available channels across 1000+ MF4/CSV test files, rather than exporting everything and manually cleaning up the output. Built with a multi-select channel picker, batch file processing, and a progress-tracked export pipeline, the utility eliminated the tedious post-export column removal step entirely — significantly reducing manual data preparation effort and minimizing the risk of human error in test data workflows.",
        tech: [
            "C#",
            ".NET 8",
            "WPF",
            "DataNav Catalyst Dyno",
            "CSV Processing",
            "Automotive Testing"
        ]
    },
    {
        id: 6,
        title: "Vehicle & EV Test Data Auto-Sync Desktop Application",
        description:
            "Architected and developed a WPF desktop application that automates the import and synchronization of vehicle and EV testing data to a central server. The application features a rich configuration UI allowing engineers to select the default vehicle software version, configure various testing parameters, and browse and register local folder paths to watch for incoming test data. Once configured, the application runs silently in the background on user login, monitoring the registered folders for new or updated test files and automatically uploading them to the central server. A system tray icon provides real-time progress tracking and status notifications without interrupting the engineer's workflow. The application also supports configurable automatic deletion of locally imported data after a user-defined retention period to manage disk usage. By replacing a fully manual import process, the solution eliminated 100% of manual data preparation effort, ensured consistent and timely synchronization of test results, and improved overall data availability across the organization.",
        tech: [
            "C#",
            ".NET 8",
            "WPF",
            "MVVM",
            "File System Monitoring",
            "System Tray",
            "Background Processing",
            "Windows Startup Automation",
            "Automotive / EV Testing"
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