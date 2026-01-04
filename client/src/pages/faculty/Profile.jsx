import { useState, useEffect } from 'react';
import { User, Mail, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Faculty.css';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            setProfile(res.data.profile);
            setFormData(res.data.profile);
        } catch (err) {
            console.error('Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/profile', { fullName: formData.fullName, mobileNumber: formData.mobileNumber });
            fetchProfile();
            refreshUser();
            setEditing(false);
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="faculty-profile-page animate-fadeIn">
            <div className="page-header">
                <h1>My Profile</h1>
                <p>View and manage your account information</p>
            </div>

            <div className="card profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">{profile?.fullName?.charAt(0) || 'F'}</div>
                    <div>
                        <h2>{profile?.fullName}</h2>
                        <p className="text-muted">Faculty</p>
                    </div>
                </div>

                {!editing ? (
                    <div className="profile-details">
                        <div className="detail-item"><Mail size={18} /><div><span>Email</span><strong>{profile?.email || 'N/A'}</strong></div></div>
                        <div className="detail-item"><Building size={18} /><div><span>Department</span><strong>{profile?.department || 'Administration'}</strong></div></div>
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                    </div>
                ) : (
                    <div className="profile-edit">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" className="input" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Mobile Number</label>
                            <input type="tel" className="input" value={formData.mobileNumber || ''} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
                        </div>
                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
