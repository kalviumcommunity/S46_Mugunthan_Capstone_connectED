import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState("");
  const [Class, setClass] = useState(1);
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [adminSchools, setAdminSchools] = useState([]);
  const [type, setType] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get("http://localhost:9001/read");
        setUsernames(response.data);

        // Filter users by type 'admin' and extract their schools
        const adminUsers = response.data.filter(
          (user) => user.type === "admin"
        );
        const schools = adminUsers.map((user) => user.school);
        setAdminSchools(schools);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleClassChange = (e) => {
    setClass(parseInt(e.target.value));
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleOTPChange = (e) => {
    setOTP(e.target.value);
  };

  const handleselectedUser = (e) => {
    setSelectedUser(e.target.value);
  };

  const handlepasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9001/send-otp", {
        email,
      });
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setMessage("Failed to send OTP");
      console.error("Error:", error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9001/verify-otp", {
        token: email,
        enteredOTP: otp,
      });
      setMessage(response.data.message);
      if (response.data.success) {
        setVerified(true);
      }
    } catch (error) {
      setMessage("Failed to verify OTP");
      console.error("Error verifying OTP:", error);
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9001/auser", {
        username: username,
        school: selectedUser,
        email: email,
        password: password,
        classs: Class,
        type: type,
        fullname: name,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div>
      <h2>Enter Your Details</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Username:
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Class:
          <select required value={Class} onChange={handleClassChange}>
            {[...Array(12)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          <label>
            School:
            <select required value={selectedUser} onChange={handleselectedUser}>
              {adminSchools.map((school, index) => (
                <option key={index}>{school}</option>
              ))}
            </select>
          </label>
        </label>
        <label>
          <select required value={type} onChange={handleTypeChange}>
            <option><input type="text"></input></option>
            <option>Teacher</option>
            <option>Student</option>
          </select>
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </label>
        <button type="submit">Send OTP</button>
      </form>
      {message && <p>{message}</p>}
      {otpSent && !verified && (
        <div>
          <h2>Enter OTP</h2>
          <form onSubmit={handleVerifyOTP}>
            <label>
              OTP:
              <input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                required
              />
            </label>
            <button type="submit">Verify OTP</button>
          </form>
        </div>
      )}
      {verified && (
        <form onSubmit={handleFormSubmit}>
          <label>
            Create Password:
            <input
              type="password"
              required
              value={password}
              onChange={handlepasswordChange}
              min={6}
              max={30}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
      <Link to='/login'><p>Already have an account ?</p></Link>
    </div>
  );
}

export default Signup;
