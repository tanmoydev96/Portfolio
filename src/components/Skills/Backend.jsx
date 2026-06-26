import React from 'react'

const Backend = () => {

    const backendData = [
        {
            id: 1,
            name: ".NET Core",
            level: "Intermediate"
        },
        {
            id: 2,
            name: "C#",
            level: "Intermediate"
        },
        {
            id: 3,
            name: "Web API",
            level: "Intermediate"
        },
        {
            id: 4,
            name: "ADO.NET",
            level: "Intermediate"
        },
        {
            id: 5,
            name: "Entity Framework Core",
            level: "Intermediate"
        },
        {
            id: 6,
            name: "WPF",
            level: "Intermediate"
        },
        {
            id: 7,
            name: "SQL Server",
            level: "Intermediate"
        }
    ];
    const mid = Math.ceil(backendData.length / 2);
    const group1 = backendData.slice(0, mid);
    const group2 = backendData.slice(mid);

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
            <h3 className="skills__title">Backend Skills</h3>
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

export default Backend