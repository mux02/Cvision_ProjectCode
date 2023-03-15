import React, { useState } from 'react'
import "../Styles/App.css"
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";


const Login = () => {

    // getting the form data from user
    const [formInfo, setFormInfo] = useState(
        {
            uid: "",
            pwd: ""
        }
    );

    // used to navigate through components
    const navigate = useNavigate();

    // setting the user data to states 
    const hanldeChange = (event) => {
        setFormInfo(prevForm => {
            return {
                ...prevForm,
                [event.target.name]: event.target.value
            }
        })
    }

    // handling the login data to be succeed or not 
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', formInfo.uid);
        formData.append('pass', formInfo.pwd);
        formData.append('submit', 'submit');


        const response = await fetch('http://localhost/hackathon/login.php', {
            method: 'POST',
            body: formData
        });


        const data = await response.json();

        if (data.error) {
            console.log((data));
            toast.error(data.error)
        } else if (data.sendAuth == 1) {
            console.log((data.sendAuth));
            toast.success("Succsess")
            setTimeout(() => {
                navigate('/main');
            }, 500);
        } else {
            console.log((data));
            toast.error("Wrong username or password")


        }
    };



    return (
        <>
            <Toaster />
            <Navbar />
            <section className="container text-white my-5 p-5 f-width bg-form rounded input-block" >
                <h2 className='text-black'>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating my-3 text-black">
                        <input type="text" className="form-control" id="floatingInput" name="uid"
                            value={formInfo.uid} onChange={hanldeChange}
                            placeholder='Username' />
                        <label htmlFor="floatingInput">Username</label>
                    </div>
                    <div className="form-floating mb-3 text-black">
                        <input type="password" className="form-control" id="floatingPassword" name="pwd"
                            value={formInfo.pwd} onChange={hanldeChange}
                            placeholder='Password' />
                        <label htmlFor="floatingPassword">Password</label>


                    </div>
                    <div className='text-center d-flex flex-column justify-content-center align-items-center'>
                        <button type="submit" className="btn text-black btn-success text-center w-75 b-color my-3" name="submit">Login</button>
                        <a href="#" className='a-pass'>Forgot Password?</a>
                    </div>
                </form>
            </section>
        </>
    )
}

export default Login