import "../Styles/App.css"
import photo from '../imgs/photo.png'
import React, { useEffect, useState, useRef } from "react";
import Navbar from './Navbar';
import AWS from 'aws-sdk';
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';



const Main = () => {

    // states to organize the rendering of the page
    const [selectedFile, setSelectedFile] = useState(null);
    const [vid, setVid] = useState([]);
    const [loading, setLoading] = useState(true);


    const navigate = useNavigate();



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
        let count = 4;
        let arr = [];
        while (count > 0) {
            generatePresignedUrl('cvision-storage', `CamVideos/Video-${count}.mp4`)
                .then(url => {
                    //console.log(url);
                    arr.push(url);
                })
                .catch(error => {
                    console.log(error);
                    // Handle any errors
                });
            count--;
        }
        setVid(arr)


        setTimeout(() => {
            setLoading(false)
        }, 500);


    }, [])



    // getting the img from user
    const handleFileInputChange = (e) => {
        setSelectedFile(e.target.files[0]);
    }



    // hanlding the submit after user upload the img 
    // send img to S3 bucket, and process img using rekogintion in AWS
    const handleSubmit = (event) => {
        event.preventDefault();

        const s3 = new AWS.S3({
            accessKeyId: 'AKIA4P7XHQO377KKJWSH',
            secretAccessKey: '',
            region: 'me-south-1',
            bucket: 'cvision-storage'
        });

        const params = {
            Bucket: 'cvision-storage',
            Key: "searchArea/" + selectedFile.name,
            Body: selectedFile
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                toast.error("Somthing went wrong")

            } else {
                console.log(data);
                toast.success("Succsess")
            }
        });
        navigate('/search');
    }


    return (
        <>
            <Navbar />
            <Toaster />
            <main className='containe-fluid'>
                <div className="row d-flex  flex-row ms-3">
                    <div className="col-lg-3 mt-4 flex-column justify-content-center text-center first-side ">
                        <h2 className="text-muted">Drag and drop</h2>
                        <div className="pic-section">
                            <form onSubmit={handleSubmit} className='d-flex flex-column'>
                                <input type="file" id="my-file-input" className="custom-file-input" onChange={handleFileInputChange} />
                                <label htmlFor="my-file-input" className="custom-file-label">
                                    <img src={photo} alt="" className='w-50' />
                                    <h6 className='mt-3'>Upload your photo</h6>
                                </label>
                                <button type="submit" className='input-submit mt-3 w-100' >Submit</button>
                            </form>
                            {selectedFile ? <h4 className="w-100 f-name mt-3 p-1 px-3 text-start fw-normal text-muted">{selectedFile.name}</h4> : null}
                        </div>
                    </div>
                    <div className="col-lg-9 cam-side">
                        <div className="row container g-3 py-5">
                            {!loading ? vid.map((item, inedx) => {
                                return (
                                    <div className="col-lg-6 " key={inedx}>
                                        <label htmlFor="" className="text-center text-muted fw-bold">Cam {inedx + 1}</label>
                                        <div className="cam" >
                                            <video className="w-100 img-fluid" muted playsInline controls autoPlay="autoplay" loop>
                                                <source src={item} type="video/mp4"></source>
                                            </video>
                                        </div>
                                    </div>
                                )
                            }) : <h1>Loading...</h1>}

                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Main