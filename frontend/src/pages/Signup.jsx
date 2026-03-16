import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DotGrid from '../components/DotGrid';
import './Auth.css';

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username || email.split('@')[0],
                        display_name: username || email.split('@')[0],
                    },
                },
            });
            if (authError) throw authError;
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };



    const handleGoogleSignup = async () => {
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (authError) throw authError;
        } catch (err) {
            setError(err.message || 'Google authentication failed');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <DotGrid dotSize={1} gap={30} baseColor="rgba(255, 255, 255, 0.08)" activeColor="#FFFFFF" />
                <div className="auth-success-container">
                    <div className="auth-success-card">
                        <div className="auth-success-icon mono-font">[✓]</div>
                        <h2 className="auth-success-title mono-font">Account Created</h2>
                        <p className="auth-success-desc">
                            A verification link has been sent to <strong>{email}</strong>.
                            Please check your email to activate your account.
                        </p>
                        <Link to="/login" className="auth-submit mono-font" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                            Go to Log In <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <DotGrid dotSize={1} gap={30} baseColor="rgba(255, 255, 255, 0.08)" activeColor="#FFFFFF" />

            <div className="auth-page-container">
                <div className="auth-brand-panel">
                    <Link to="/" className="auth-brand-logo mono-font">VOID</Link>
                    <div className="auth-brand-content">
                        <h1 className="auth-brand-title mono-font">Create<br />Account</h1>
                        <p className="auth-brand-desc">
                            Join the next generation of AI-powered engineering.<br />
                            Build smarter. Ship faster.
                        </p>
                    </div>
                    <div className="auth-brand-footer">
                        <span className="auth-version mono-font">V2.0.4</span>
                        <span className="auth-status mono-font">● Open for Signups</span>
                    </div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-form-inner">
                        <div className="auth-form-header">
                            <h2 className="auth-form-title mono-font">Sign Up</h2>
                            <p className="auth-form-subtitle">Create your engineering workspace.</p>
                        </div>

                        {error && <div className="auth-error-banner">{error}</div>}

                        <form onSubmit={handleSignup} className="auth-form-fields">
                            <div className="auth-field">
                                <label className="auth-label mono-font">Username</label>
                                <div className="auth-input-wrapper">
                                    <User className="auth-field-icon" size={16} />
                                    <input
                                        type="text"
                                        placeholder="name"
                                        className="auth-field-input mono-font"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label mono-font">Email</label>
                                <div className="auth-input-wrapper">
                                    <Mail className="auth-field-icon" size={16} />
                                    <input
                                        type="email"
                                        placeholder="you@email.com"
                                        className="auth-field-input mono-font"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label mono-font">Password</label>
                                <div className="auth-input-wrapper">
                                    <Lock className="auth-field-icon" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min 6 characters"
                                        className="auth-field-input mono-font"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-submit mono-font"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </form>

                        <div className="auth-separator">
                            <div className="auth-separator-line" />
                            <span className="auth-separator-text mono-font">OR</span>
                            <div className="auth-separator-line" />
                        </div>

                        <button
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="auth-oauth-btn mono-font"
                        >
                            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <p className="auth-footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-footer-link mono-font">Log In →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
