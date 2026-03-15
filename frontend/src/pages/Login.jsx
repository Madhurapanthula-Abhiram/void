import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Github, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DotGrid from '../components/DotGrid';
import './Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (authError) throw authError;
            navigate('/');
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
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

    return (
        <div className="auth-page">
            <DotGrid dotSize={1} gap={30} baseColor="rgba(255, 255, 255, 0.08)" activeColor="#FFFFFF" />

            <div className="auth-page-container">
                <div className="auth-brand-panel">
                    <Link to="/" className="auth-brand-logo mono-font">VOID</Link>
                    <div className="auth-brand-content">
                        <h1 className="auth-brand-title mono-font">Welcome<br />Back</h1>
                        <p className="auth-brand-desc">
                            Access your AI-powered engineering workspace.<br />
                            Debug. Analyze. Optimize. Test.
                        </p>
                    </div>
                    <div className="auth-brand-footer">
                        <span className="auth-version mono-font">V2.0.4</span>
                        <span className="auth-status mono-font">● Online</span>
                    </div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-form-inner">
                        <div className="auth-form-header">
                            <h2 className="auth-form-title mono-font">Log In</h2>
                            <p className="auth-form-subtitle">Enter your credentials to continue.</p>
                        </div>

                        {error && <div className="auth-error-banner">{error}</div>}

                        <form onSubmit={handleLogin} className="auth-form-fields">
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
                                        placeholder="••••••••"
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
                                {loading ? 'Logging in...' : 'Log In'}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </form>

                        <div className="auth-separator">
                            <div className="auth-separator-line" />
                            <span className="auth-separator-text mono-font">OR</span>
                            <div className="auth-separator-line" />
                        </div>

                        <button
                            onClick={handleGithubLogin}
                            disabled={loading}
                            className="auth-oauth-btn mono-font"
                        >
                            <Github size={18} /> Continue with GitHub
                        </button>

                        <p className="auth-footer-text">
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-footer-link mono-font">Sign Up →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
