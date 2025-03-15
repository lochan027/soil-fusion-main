import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IconPlant, 
  IconBrain, 
  IconCloud, 
  IconBell, 
  IconChartBar, 
  IconDevices,
  IconCloudRain,
  IconCamera,
  IconRobot,
  IconDrone,
  IconDroplet,
  IconShare
} from '@tabler/icons-react';
import './Features.css';

const Features = () => {
  return (
    <div className="features-page">
      <header className="features-header">
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

      <main className="features-content">
        <div className="features-hero">
          <h1>Features</h1>
          <p className="subtitle">Discover how Soil Fusion revolutionizes farming with smart technology</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <IconPlant className="icon" />
            <h3>Real-time Soil Monitoring</h3>
            <p>Monitor soil conditions in real-time with advanced sensors tracking moisture, temperature, pH, and nutrient levels for optimal crop growth.</p>
          </div>

          <div className="feature-card">
            <IconBrain className="icon" />
            <h3>AI-Powered Analysis</h3>
            <p>Leverage artificial intelligence to analyze soil data and receive personalized recommendations for improving soil health and crop yield.</p>
          </div>

          <div className="feature-card">
            <IconCloud className="icon" />
            <h3>Weather Integration</h3>
            <p>Access local weather forecasts and receive guidance on optimal timing for irrigation, planting, and fertilization based on weather conditions.</p>
          </div>

          <div className="feature-card">
            <IconBell className="icon" />
            <h3>Smart Notifications</h3>
            <p>Stay informed with real-time alerts about critical soil conditions, weather changes, and recommended actions for your crops.</p>
          </div>

          <div className="feature-card">
            <IconChartBar className="icon" />
            <h3>Data Analytics</h3>
            <p>Track trends and patterns in soil health over time with comprehensive data visualization and reporting tools.</p>
          </div>

          <div className="feature-card">
            <IconDevices className="icon" />
            <h3>Device Management</h3>
            <p>Easily manage and monitor multiple soil sensors across your farm from a single, intuitive dashboard.</p>
          </div>

          <div className="feature-card">
            <IconCloudRain className="icon" />
            <h3>Predictive Weather Integration</h3>
            <p>Plan your farming activities with confidence using AI-powered weather forecasts that help optimize irrigation and fertilization timing.</p>
          </div>

          <div className="feature-card">
            <IconCamera className="icon" />
            <h3>Image Analysis</h3>
            <p>Upload images of your soil or crops for instant AI-powered analysis to detect health issues and receive treatment recommendations.</p>
          </div>

          <div className="feature-card">
            <IconRobot className="icon" />
            <h3>Natural Language Interaction</h3>
            <p>Get instant support through our AI chatbot that provides conversational access to insights and recommendations.</p>
          </div>

          <div className="feature-card">
            <IconDrone className="icon" />
            <h3>Automated Drone Farming</h3>
            <p>Deploy smart drones that automatically apply water or fertilizers to specific areas based on real-time soil analysis alerts.</p>
          </div>

          <div className="feature-card">
            <IconDroplet className="icon" />
            <h3>Automated Irrigation Systems</h3>
            <p>Save water and resources with smart irrigation systems that activate only when needed, based on real-time soil moisture data.</p>
          </div>

          <div className="feature-card">
            <IconShare className="icon" />
            <h3>Easy Sharing of Reports</h3>
            <p>Generate and share comprehensive soil analysis reports and recommendations to facilitate better decision-making.</p>
          </div>
        </div>

        <div className="features-cta">
          <h2>Ready to Transform Your Farming?</h2>
          <p>Join thousands of farmers using Soil Fusion to optimize their crop yield and soil health.</p>
          <Link to="/sign-up" className="cta-button">Get Started Today</Link>
        </div>
      </main>
    </div>
  );
};

export default Features; 