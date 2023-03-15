import React from 'react'
import "../Styles/App.css"
import person from '../imgs/group.png'
import vision from '../imgs/vision.png'
import { useLocation, Link } from 'react-router-dom';


const Navbar = () => {

    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary nav-sh ">
            <div className="container py-2">
                <Link className="" to="/" >
                    <img src={vision} alt="" className=' nav-img' />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                    </ul>
                </div>
                <div>
                    {location.pathname !== "/" ? < img src={person} alt="" className='w-50' /> : null}
                </div>
            </div>
        </nav>
    )
}

export default Navbar