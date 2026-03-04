import React from 'react'

function Info() {
    return (
        <div className="about__info grid">
            <div className="about__box">
                <i className='bx bx-award about__icon'></i>
                <h3 className="about__title">Experience</h3>
                <span className="about__subtitle">3+ Years Of Experience</span>
            </div>

            <div className="about__box">
                <i className='bx bx-briefcase-alt about__icon'></i>
                <h3 className="about__title">Worked On</h3>
                <span className="about__subtitle">7+ Applications</span>
            </div>
        </div>
    )
}

export default Info