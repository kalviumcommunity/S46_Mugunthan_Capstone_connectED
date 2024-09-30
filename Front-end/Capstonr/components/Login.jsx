import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import "../components/Login.css";
function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9001/login", {
        username: formData.username,
        password: formData.password,
      });
      console.log(response.data);
      setError("");

      // Set user-related information in cookies after successful login

      cookies.set("username", formData.username);
      // After successful login, fetch user data
      const userDataResponse = await axios.get("http://localhost:9001/read");
      const users = userDataResponse.data;
      const currentUser = users.find(
        (user) => user.username === formData.username
      );
      cookies.set("school", currentUser.school);
      cookies.set("classs", currentUser.classs);

      // Navigate to Post component
      navigate("/post");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      <nav id="login-nav">
        <p>connectED</p>
        <p id="reg">get registered</p>
      </nav>
      <div id="login-cont">
        <Link to="/signup">
          <p id="sign-btn">Signup</p>
        </Link>
        <form id="login-form" onSubmit={handleSubmit}>
          <p id="login-txt">Login</p>
          <div id="inputs">
            <label>
              <input
                type="text"
                name="username"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <input
                type="password"
                placeholder="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit">Login</button>
          </div>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
