import React, { useEffect, useState } from 'react'
import "../Styles/App.css"
import Navbar from './Navbar';
import perons from '../imgs/group.png'
import { MdLocationPin } from 'react-icons/md';
import AWS from 'aws-sdk';


const Search = () => {


    // states to organize the rendering of the page
    const [vid, setVid] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);



    // configure AWS SDK data
    const s33 = new AWS.S3({
        accessKeyId: 'AKIA4P7XHQO377KKJWSH',
        secretAccessKey: '',
        region: 'me-south-1',
    });


    // creating a presignedURL for the video we want
    const generatePresignedUrl = async (bucket, key) => {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
                Expires: 3600 // URL will expire in 1 hour
            };
            const url = await s33.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.log(error);
        }
    };


    // getting the video from S3 bucket and getting location from RDS database
    useEffect(() => {
        let temp = "";
        generatePresignedUrl('cvision-storage', 'CamVideos/Video_cut.mp4')
            .then(url => {
                console.log(url);
                temp = url
            })
            .catch(error => {
                console.log(error);
                // Handle any errors
            });

        setTimeout(() => {
            setVid(temp)
            setLoading(false)
        }, 500);

        // fetching the location data from RDS
        fetch('http://localhost/hackathon/getLog.php')
            .then(response => response.json())
            .then(data => setLocation(data));
    }, [])




    return (
        <>
            <Navbar />
            <div className="container py-5">
                <div className="row">
                    <div className="col-lg-4 my-1">
                        <div class="card card-shd" >

                            {!loading ? <video className="w-100 img-fluid" muted playsInline controls autoPlay="autoplay" loop>
                                <source src={vid} type="video/mp4"></source>
                            </video> : <img src={perons} class="p-3 card-img-top w-25" alt="..." />}

                            <div class="card-body">
                                <h5 class="card-title">Nawaf</h5>
                                <p class="card-text">Cam1  March 4 | 1:00 PM</p>
                                <a target="_blank" href={location ? `https://www.google.com/maps?q=@${location.body[0].Camera_Latitude},${location.body[0].Camera_Longitude}` : ""} class="btn btn-warning"><MdLocationPin className='fs-5' />Direction</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Search