import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './Home.css'

function Home() {
  return (
    <div>
      <Link to='/login'>
      <button>login</button>
      </Link> 
      <Link to='/signup'>
         <button>signup</button>
      </Link> 
    </div>
  )
}

export default Home