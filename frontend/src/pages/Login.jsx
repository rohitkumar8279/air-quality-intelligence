import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const authContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
  color: '#f8fafc',
  padding: '1rem'
};

const authCardStyle = {
  background: 'rgba(15, 23, 42, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '24px',
  padding: '3rem',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
};

const inputGroupStyle = {
  position: 'relative',
  marginBottom: '1.5rem'
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '12px 16px 12px 48px',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.2s'
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b'
};

const buttonStyle = {
  width: '100%',
  background: 'var(--accent-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '14px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  transition: 'background 0.2s',
  marginTop: '1rem'
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <motion.div style={authCardStyle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '1rem' }}>
            <Leaf size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Welcome Back</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Sign in to access your Air Quality Dashboard</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <Mail size={20} style={iconStyle} />
            <input 
              type="email" 
              placeholder="Email address" 
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div style={inputGroupStyle}>
            <Lock size={20} style={iconStyle} />
            <input 
              type="password" 
              placeholder="Password" 
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
              <span style={{ color: '#94a3b8' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
