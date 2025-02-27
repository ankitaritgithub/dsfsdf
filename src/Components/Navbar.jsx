import React from 'react';
import logo from '../assets/logo.svg';
import moonIcon from '../assets/moon.svg';
import notificationIcon from '../assets/notification.svg';
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <img 
          src={logo} 
          alt="Logo" 
          className="logo"
        />
        <div className="brand">
          <h1>AgentQA</h1>
          <p>powered by <span>akira AI</span></p>
        </div>
      </div>
      <div className="navbar-right">
        <img src={moonIcon} alt="Moon" className="icon moon-icon" />
        <img src={notificationIcon} alt="Notification" className="icon notification-icon" />
      </div>
    </div>
  );
}

export default Navbar;
