import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <header className="about-header">
        <div className="logo">
          <Link to="/">Soil Fusion</Link>
        </div>
        <nav className="nav">
          <Link to="/features">Features</Link>
          <Link to="/about">About</Link>
          <Link to="/sign-in" className="sign-in">Sign In</Link>
          <Link to="/sign-up" className="sign-up">Sign Up</Link>
        </nav>
      </header>

      <main className="about-content">
        <div className="about-hero">
          <h1>About Soil Fusion</h1>
          <p className="subtitle">Empowering farmers with smart technology for sustainable agriculture</p>
        </div>

        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>
            At Soil Fusion, we're dedicated to revolutionizing agriculture through innovative technology. 
            Our mission is to empower farmers with real-time soil monitoring and AI-driven insights, 
            enabling them to make informed decisions that optimize crop yield while promoting sustainable 
            farming practices. We believe that by bridging the gap between traditional farming wisdom 
            and cutting-edge technology, we can help create a more sustainable and productive 
            agricultural future.
          </p>
        </div>

        <div className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Innovation</h3>
              <p>We continuously push the boundaries of agricultural technology, developing solutions 
                that make precision farming accessible to all.</p>
            </div>
            <div className="value-card">
              <h3>Sustainability</h3>
              <p>We're committed to promoting farming practices that protect and enhance our environment 
                for future generations.</p>
            </div>
            <div className="value-card">
              <h3>Empowerment</h3>
              <p>We believe in giving farmers the tools and knowledge they need to make confident, 
                data-driven decisions.</p>
            </div>
            <div className="value-card">
              <h3>Reliability</h3>
              <p>We provide dependable technology and insights that farmers can trust for their 
                critical agricultural decisions.</p>
            </div>
          </div>
        </div>

        <div className="about-technology">
          <h2>Our Technology</h2>
          <p>
            Soil Fusion combines advanced IoT sensors, artificial intelligence, and cloud computing to 
            deliver comprehensive soil health monitoring and analysis. Our platform processes real-time 
            data from multiple sources, including soil sensors and weather stations, to provide 
            actionable insights for optimal farming conditions. We leverage machine learning algorithms 
            to analyze patterns and predict potential issues before they affect crop yield, helping 
            farmers stay one step ahead in their agricultural operations.
          </p>
        </div>

        <div className="about-cta">
          <h2>Join the Future of Farming</h2>
          <p>Experience the power of smart agriculture with Soil Fusion</p>
          <Link to="/sign-up" className="cta-button">Start Your Journey</Link>
        </div>
      </main>
    </div>
  );
};

export default About; 