// components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <h1 style={styles.title}>Cricket Score App</h1>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Team Selection</Link>
        <Link to="/player-selection" style={styles.link}>Player Selection</Link>
        <Link to="/score-ticker" style={styles.link}>Score Ticker</Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px 30px',
    backgroundColor: '#007bff',
    color: '#fff',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '18px',
    transition: 'color 0.3s ease',
  },
};

export default Navbar;
