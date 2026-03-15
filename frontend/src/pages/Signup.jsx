import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Github, ArrowRight, Eye, EyeOff } from 'lucide-react';
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

    const handleGithubSignup = async () => {
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (authError) throw authError;
        } catch (err) {
            setError(err.message || 'GitHub authentication failed');
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
                            onClick={handleGithubSignup}
                            disabled={loading}
                            className="auth-oauth-btn mono-font"
                        >
                            <Github size={18} /> Continue with GitHub
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
