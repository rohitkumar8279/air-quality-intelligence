import React from 'react';
import './HeroSection.css';

const HeroSection = ({ city }) => {
  return (
    <div className="hero-section animate-fade-in">
      <div className="hero-bg-glow"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="live-pulse"></span>
          Live Environment Monitor
        </div>
        <h1 className="hero-title">{city}</h1>
        <p className="hero-subtitle">
          Real-time AI Powered Air Quality Intelligence Platform
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
