import { useState } from "react"
import "./Header.css"
import '../Skills/Skill.jsx'
import '../Qualification/Qualification.jsx'

const Header = () => {
    //#region "Toggle Logic"
    const [Toggle, showMenu] = useState(false);
    //#endregion

    const Headers = [
        { "title": "Home", "ref": "home" },
        { "title": "About", "ref": "about" },
        { "title": "Skills", "ref": "skills" },
        { "title": "Qualifications", "ref": "qualifications" },
        { "title": "Projects", "ref": "projects" },
        { "title": "Contact", "ref": "contact" }
    ];

    return (
        <header className="header" >
            <nav className="nav container">
                <a href="index.html" className="nav__logo">Tanmoy Chowdhury</a>

                <div className={Toggle ? "nav__menu show__menu" : "nav__menu"}>
                    <ul className="nav__list grid">
                        {Headers.map((item) => (
                            <li className="nav__item">
                                <a href={`#${item.ref}`} className="nav__link active-link">
                                    <i className="uil uil-estate nav__icon"></i>{item.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <i className="uil uil-times nav__close" onClick={() => showMenu(!Toggle)}></i>

                </div>
                <div className="nav__toggle" onClick={() => showMenu(!Toggle)}>
                    <i className="uil uil-apps"></i>
                </div>
            </nav >
        </header >
    )
}

export default Header