import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Home from "../components/Home";
import Post from "../components/Post";
import Personal from "../components/Personal";

function OTPSender() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post" element={<Post />} />
          <Route path="/personal" element={<Personal />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default OTPSender;
