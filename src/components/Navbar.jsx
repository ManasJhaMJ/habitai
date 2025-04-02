import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GiCloakDagger } from "react-icons/gi";
import { signInWithGoogle, logout } from "../firebase"; // Import sign-in and logout functions

function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="solo-navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
        <GiCloakDagger size={50} />
          <span className="logo-text">SOLO</span>
          <span className="logo-highlight">LEVELER</span>
        </div>

        {/* Mobile Navbar Toggle Button */}
        <div className={`navbar-toggle ${isOpen ? "open" : ""}`} onClick={toggleNavbar}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navbar Links */}
        <div className={`navbar-links-container ${isOpen ? "active" : ""}`}>
          <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tracker">Tracker</Link></li>
            <li><Link to="/roadmap">Roadmap</Link></li>
            <li><Link to="/chatbot">Chatbot</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
            {/* <li><a href="#">Shop</a></li> */}
          </ul>
        </div>

        {/* Profile Section */}
        <div className="navbar-profile">
          
          {/* Display username or sign-in button */}
          <div className="profile-info">
            {user ? (
              <>
                <span className="username">{user.displayName}</span>
                <button className="logout-btn" onClick={logout}>
                Logout
                </button>
              </>
            ) : (
              <button className="login-btn" onClick={signInWithGoogle}>Sign In</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;