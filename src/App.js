import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 
import './App.css';
import SignIn from './SignIn'; 
import Dashboard from './Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Devices from './Devices';
import { ThemeProvider } from './context/ThemeContext';
import Weather from './Weather';
import NotificationCenter from './components/NotificationCenter';
import Features from './pages/Features';
import About from './pages/About';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="landing-page">
          <NotificationCenter />
          <Routes>
            {/* Home page with Navbar */}
            <Route
              path="/"
              element={
                <div>
                  <header className="header">
                    <div className="logo">
                      Soil Fusion
                    </div>
                    <nav className="nav">
                      <Link to="/features">Features</Link>
                      <Link to="/about">About</Link>
                      <Link to="/sign-in" className="sign-in">Sign In</Link>
                      <Link to="/sign-up" className="sign-up">Sign Up</Link>
                    </nav>
                  </header>

                  <main className="hero-section">
                    <div className="hero-content">
                      <h1 className="hero-title">
                        <span>Transform Soil </span>
                        <span>Insights into Action</span>
                      </h1>
                      <p className="hero-subtitle">
                        Predict, Analyze, and Transform Soil Health with AI and Real-Time Insights
                      </p>
                      <div className="cta-buttons">
                        <Link to="/sign-up" className="btn primary">Get Started</Link>
                        <Link to="/features" className="btn secondary">Learn More</Link>
                      </div>
                    </div>
                  </main>
                </div>
              }
            />
            {/* Sign In or Sign Up page */}
            <Route path="/sign-in/*" element={<SignIn isSignUp={false} />} />
            <Route path="/sign-up/*" element={<SignIn isSignUp={true} />} />
            {/* Main Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
