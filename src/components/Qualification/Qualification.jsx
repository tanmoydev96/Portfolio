import React, { useState } from "react";
import "./Qualification.css";

const Qualification = () => {
    const [activeTab, setActiveTab] = useState("education");

    const education = [
        {
            title: "MTech in Distributed & Mobile Computing",
            subtitle: "Jadavpur University, Kolkata",
            year: "2020 - 2022",
        },
        {
            title: "MSc in Computer Science",
            subtitle: "Visva Bharati University, Santiniketan",
            year: "2017 - 2019",
        },
        {
            title: "BSc in Computer Science",
            subtitle: "Visva Bharati University, Santiniketan",
            year: "2013 - 2016",
        }
    ];

    const experience = [
        {
            title: "Solution Developer",
            subtitle: "Tata Technologies",
            year: "Jan, 2024 - Present",
        },
        {
            title: "Post Graduate Trainee Engineer",
            subtitle: "Tata Technologies",
            year: "Jan, 2023 - Jan, 2024",
        }
    ];

    const data = activeTab === "education" ? education : experience;

    return (
        <section className="qualification" id="qualifications">
            <h2 className="section__title">Qualification</h2>
            <span className="section__subtitle">My personal journey</span>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={activeTab === "education" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("education")}
                >
                    🎓 Education
                </button>
                <button
                    className={activeTab === "experience" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("experience")}
                >
                    💼 Experience
                </button>
            </div>

            {/* Timeline */}
            <div className="timeline">
                {data.map((item, index) => (
                    <div
                        className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
                        key={index}
                    >
                        <div className="content">
                            <h3>{item.title}</h3>
                            <p>{item.subtitle}</p>
                            <span>{item.year}</span>
                        </div>
                        <span className="dot"></span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Qualification;