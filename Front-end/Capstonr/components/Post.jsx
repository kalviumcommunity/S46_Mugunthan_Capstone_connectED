import "../components/Post.css"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import Cookies from "universal-cookie";

// Initialize Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyAB-n2mXSXCxmJu881EgQViXJILA2y2IVY",
  authDomain: "connected-1189b.firebaseapp.com",
  projectId: "connected-1189b",
  storageBucket: "connected-1189b.appspot.com",
  messagingSenderId: "307019906370",
  appId: "1:307019906370:web:5c9d1c99de2034bd011cdb",
  measurementId: "G-Q6REXCTZXF",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Initialize storage

function Post() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const cookies = new Cookies();

  const [user, setUser] = useState("");
  const [classs, setClasss] = useState("");
  const [school, setSchool] = useState("");

  useEffect(() => {
    // Retrieve cookies and set the state
    setUser(cookies.get("username"));
    setClasss(cookies.get("classs"));
    setSchool(cookies.get("school"));
  }, []);

  useEffect(() => {
    fetchData();
  }, [school, classs]);

  const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2 MB in bytes

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size > FILE_SIZE_LIMIT) {
      setError("File size exceeds the 2 MB limit");
      setFile(null);
    } else {
      setError("");
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let imglink = "";
      if (file) {
        // Handle file upload
        const storageRef = ref(storage, `uploads/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error("Upload failed:", error);
            setError("Failed to upload the image.");
          },
          async () => {
            // Handle successful uploads on complete
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("File available at", downloadURL);
              imglink = downloadURL;

              // Proceed to save the data
              saveData(imglink);
            } catch (error) {
              console.error("Error getting download URL:", error);
              setError("Failed to get download URL for the image.");
            }
          }
        );
      } else {
        // No file selected, proceed to save the data without an image link
        saveData("");
      }
    } catch (err) {
      setError("An error occurred while posting data.");
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const dataResponse = await axios.get("http://localhost:9001/display");
      const datas = dataResponse.data;
      const filteredData = datas.filter(
        (item) => item.school === school && item.classs === classs
      );
      setData(filteredData);
      console.log("Data fetched and filtered:", filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const saveData = async (imglink) => {
    try {
      const postData = {
        user: user,
        classs: classs,
        school: school,
        message: text,
        imglink: imglink,
      };
      console.log(postData.classs, postData.school, postData.user);
      // Post data to backend
      const response = await axios.post(
        "http://localhost:9001/upload",
        postData
      );
      console.log(response.data);

      // Reset form fields
      setText("");
      setFile(null);
      setError("");

      // Fetch data again to include the new post
      fetchData();
    } catch (err) {
      setError("An error occurred while posting data.");
      console.error(err);
    }
  };

  return (
    <>
      <div>
        <h2>Posts</h2>
     <Link to="/personal">
     <button >Personal</button>
     </Link>   
        {data.map((item, index) => (
          <div key={index} className="post">
            <p>{item.message}</p>
            {item.imglink && <img src={item.imglink} alt="Post" />}
            <p> {item.user}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Text:</label>
          <input type="text" value={text} onChange={handleTextChange} />
        </div>
        <div>
          <label>File:</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default Post;
