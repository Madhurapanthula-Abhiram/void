import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) throw authError;
                onLogin(data.user);
                onClose();
            } else {
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username || email.split('@')[0],
                            display_name: username || email.split('@')[0],
                        }
                    }
                });
                if (authError) throw authError;
                if (data.user) {
                    onLogin(data.user);
                    onClose();
                }
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (authError) throw authError;
        } catch (err) {
            setError(err.message || 'Google authentication failed');
            setLoading(false);
        }
    };



    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="auth-overlay-wrapper">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="auth-backdrop"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="auth-modal"
                    >
                        <button onClick={onClose} className="auth-close-btn">
                            <X size={20} />
                        </button>

                        <div className="auth-header">
                            <h2 className="auth-title mono-font">
                                {isLogin ? "INITIALIZE_SESSION" : "CREATE_PROTOCOL"}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin ? "Welcome back to the void." : "Join the next generation of intelligence."}
                            </p>
                        </div>

                        {error && (
                            <div className="auth-error">{error}</div>
                        )}

                        <div className="auth-form">
                            <div className="auth-input-group">
                                <Mail className="auth-input-icon" size={18} />
                                <input
                                    type="email"
                                    placeholder="EMAIL_ADDRESS"
                                    className="auth-input mono-font"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <div className="auth-input-group">
                                <Lock className="auth-input-icon" size={18} />
                                <input
                                    type="password"
                                    placeholder="SECURITY_KEY"
                                    className="auth-input mono-font"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            {!isLogin && (
                                <div className="auth-input-group">
                                    <User className="auth-input-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="CODENAME"
                                        className="auth-input mono-font"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="auth-submit-btn mono-font"
                            >
                                {loading ? "PROCESSING..." : (isLogin ? "EXECUTE_LOGIN" : "START_PROTOCOL")}
                            </button>

                            <div className="auth-divider">
                                <div className="auth-divider-line" />
                                <span className="auth-divider-text mono-font">or continue with</span>
                                <div className="auth-divider-line" />
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="auth-github-btn mono-font"
                            >
                                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                GOOGLE_OAUTH
                            </button>
                        </div>

                        <p className="auth-toggle-text">
                            {isLogin ? "New to the system?" : "Already have a key?"}{' '}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="auth-toggle-btn mono-font"
                            >
                                {isLogin ? "SIGN_UP" : "LOG_IN"}
                            </button>
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
