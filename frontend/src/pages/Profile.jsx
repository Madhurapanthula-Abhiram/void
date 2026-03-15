import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Edit3, Save, ArrowLeft, LogOut, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DotGrid from '../components/DotGrid';
import './Auth.css';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ conversations: 0, messages: 0 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                navigate('/login');
                return;
            }

            setUser(authUser);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setDisplayName(profileData.display_name || '');
                setUsername(profileData.username || '');
            }

            const { count: convCount } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id);

            const { count: msgCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id);

            setStats({
                conversations: convCount || 0,
                messages: msgCount || 0,
            });

            setLoading(false);
        };

        loadProfile();
    }, [navigate]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    username: username,
                })
                .eq('id', user.id);

            if (updateError) throw updateError;
            setProfile(prev => ({ ...prev, display_name: displayName, username }));
            setEditing(false);
            setSuccess('Profile updated successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="auth-page">
                <DotGrid dotSize={1} gap={30} baseColor="rgba(255, 255, 255, 0.08)" activeColor="#FFFFFF" />
                <div className="profile-loading">
                    <span className="mono-font">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <DotGrid dotSize={1} gap={30} baseColor="rgba(255, 255, 255, 0.08)" activeColor="#FFFFFF" />

            <div className="profile-container">
                <div className="profile-header">
                    <Link to="/" className="profile-back mono-font">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <button onClick={handleLogout} className="profile-logout mono-font">
                        <LogOut size={16} /> Log Out
                    </button>
                </div>

                <div className="profile-card">
                    <div className="profile-avatar">
                        <User size={40} />
                    </div>

                    <div className="profile-info">
                        {error && <div className="auth-error-banner">{error}</div>}
                        {success && <div className="profile-success">{success}</div>}

                        <div className="profile-meta">
                            <span className="profile-meta-label mono-font">Member Since</span>
                            <span className="profile-meta-value mono-font">
                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                })}
                            </span>
                        </div>

                        <div className="profile-fields">
                            <div className="profile-field">
                                <label className="auth-label mono-font">Display Name</label>
                                {editing ? (
                                    <div className="auth-input-wrapper">
                                        <User className="auth-field-icon" size={16} />
                                        <input
                                            type="text"
                                            className="auth-field-input mono-font"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div className="profile-field-value mono-font">
                                        {profile?.display_name || '—'}
                                    </div>
                                )}
                            </div>

                            <div className="profile-field">
                                <label className="auth-label mono-font">Username</label>
                                {editing ? (
                                    <div className="auth-input-wrapper">
                                        <User className="auth-field-icon" size={16} />
                                        <input
                                            type="text"
                                            className="auth-field-input mono-font"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div className="profile-field-value mono-font">
                                        @{profile?.username || '—'}
                                    </div>
                                )}
                            </div>

                            <div className="profile-field">
                                <label className="auth-label mono-font">Email</label>
                                <div className="profile-field-value mono-font">
                                    <Mail size={14} style={{ opacity: 0.5 }} /> {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            {editing ? (
                                <>
                                    <button onClick={handleSave} disabled={saving} className="auth-submit mono-font">
                                        {saving ? 'Saving...' : 'Save Changes'} <Save size={14} />
                                    </button>
                                    <button onClick={() => setEditing(false)} className="auth-oauth-btn mono-font">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setEditing(true)} className="auth-oauth-btn mono-font">
                                    <Edit3 size={14} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="profile-stat-card">
                        <MessageSquare size={20} className="profile-stat-icon" />
                        <div className="profile-stat-value mono-font">{stats.conversations}</div>
                        <div className="profile-stat-label mono-font">Conversations</div>
                    </div>
                    <div className="profile-stat-card">
                        <Clock size={20} className="profile-stat-icon" />
                        <div className="profile-stat-value mono-font">{stats.messages}</div>
                        <div className="profile-stat-label mono-font">Messages</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
