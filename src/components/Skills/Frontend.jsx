import React from 'react'

const Frontend = () => {
    const frontendData = [
        {
            id: 1,
            name: "HTML",
            level: "Proficient"
        },
        {
            id: 2,
            name: "CSS",
            level: "Proficient"
        },
        {
            id: 3,
            name: "JavaScript",
            level: "Proficient"
        },
        {
            id: 4,
            name: "MUI",
            level: "Proficient"
        },
        {
            id: 5,
            name: "React.Js",
            level: "Intermediate"
        },
        {
            id: 6,
            name: "Redux Tool Kit (RTK)",
            level: "Intermediate"
        }
    ];

    const mid = Math.ceil(frontendData.length / 2);
    const group1 = frontendData.slice(0, mid);
    const group2 = frontendData.slice(mid);

    const renderSkill = (data) => (
        <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
                <h3 className="skills__name">{data.name}</h3>
                <span className="skills__level">{data.level}</span>
            </div>
        </div>
    )

    return (
        <div className="skills__content">
            <h3 className="skills__title">Frontend Skills</h3>
            <div className="skills__box">
                <div className="skills__group">
                    {group1.map(renderSkill)}
                </div>

                <div className="skills__group">
                    {group2.map(renderSkill)}
                </div>
            </div>
        </div>
    )
}

export default Frontend