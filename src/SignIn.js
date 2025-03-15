import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = ({ isSignUp }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(isSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auto-login effect
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Demo credentials
        const demoEmail = 'test@test.com';
        const demoPassword = 'test123';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Auto navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Auto-login failed:', err);
        // If auto-login fails, user can still log in manually
      }
    };

    autoLogin();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // For demo, accept any credentials
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-sm text-gray-400 mb-6">
          {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          {isSignUp ? (
            <p>Already have an account? <a href="/sign-in">Sign In</a></p>
          ) : (
            <p>Don't have an account? <a href="/sign-up">Sign Up</a></p>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-500 text-sm text-center">
            Demo Mode: Auto-login enabled with test credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
