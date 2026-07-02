import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, User, ArrowRight } from 'lucide-react';
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

const inputGroupStyle = { position: 'relative', marginBottom: '1.5rem' };

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

const iconStyle = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' };

const buttonStyle = {
  width: '100%', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '12px',
  padding: '14px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex',
  justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s', marginTop: '1rem'
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Create Account</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Join AirIntel to personalize your experience.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <User size={20} style={iconStyle} />
            <input type="text" placeholder="Full Name" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div style={inputGroupStyle}>
            <Mail size={20} style={iconStyle} />
            <input type="email" placeholder="Email address" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div style={inputGroupStyle}>
            <Lock size={20} style={iconStyle} />
            <input type="password" placeholder="Password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
          </div>

          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
