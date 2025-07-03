import React from 'react';
import '../css/TopBar.css';

const Topbar = () => {
  return (
    <nav className="topbar">
      <ul className="links">
        <li><a href="#">My Dashboard</a></li>
        <li><a href="#">My Timesheet</a></li>
        <li><a href="#">Careers</a></li>
      </ul>
      <ul className="pfp">
        <li><a href="#">Pfp</a></li>
      </ul>
    </nav>
  );
};

export default Topbar;