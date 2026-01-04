import { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Building, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Student.css';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

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
            await api.patch('/profile', {
                fullName: formData.fullName,
                mobileNumber: formData.mobileNumber,
                department: formData.department,
                semester: formData.semester
            });
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
        <div className="profile-page animate-fadeIn">
            <div className="page-header">
                <h1>My Profile</h1>
                <p>View and manage your account information</p>
            </div>

            {profile?.warningStatus && profile.warningStatus !== 'none' && (
                <div className="warning-card">
                    <AlertTriangle size={24} />
                    <div>
                        <h4>Account Warning</h4>
                        <p>Your account has been flagged for excessive cancellations. Please avoid unnecessary bookings.</p>
                    </div>
                </div>
            )}

            <div className="profile-grid">
                <div className="card profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">{profile?.fullName?.charAt(0) || 'U'}</div>
                        <div>
                            <h2>{profile?.fullName}</h2>
                            <p className="text-muted">{profile?.userType === 'student' ? 'Student' : 'Parent'}</p>
                        </div>
                    </div>

                    {!editing ? (
                        <div className="profile-details">
                            <div className="detail-item"><Mail size={18} /><div><span>Email</span><strong>{profile?.email || 'N/A'}</strong></div></div>
                            <div className="detail-item"><User size={18} /><div><span>Roll Number</span><strong>{profile?.rollNumber || 'N/A'}</strong></div></div>
                            <div className="detail-item"><Phone size={18} /><div><span>Mobile</span><strong>{profile?.mobileNumber || 'N/A'}</strong></div></div>
                            <div className="detail-item"><Building size={18} /><div><span>Department</span><strong>{profile?.department || 'N/A'}</strong></div></div>
                            <div className="detail-item"><BookOpen size={18} /><div><span>Semester</span><strong>{profile?.semester || 'N/A'}</strong></div></div>
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
                            <div className="input-group">
                                <label>Department</label>
                                <input type="text" className="input" value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Semester</label>
                                <select className="input" value={formData.semester || ''} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {profile?.parentContact && (
                    <div className="card">
                        <h3>Parent Contact</h3>
                        <div className="profile-details">
                            <div className="detail-item"><User size={18} /><div><span>Name</span><strong>{profile.parentContact.name || 'N/A'}</strong></div></div>
                            <div className="detail-item"><Mail size={18} /><div><span>Email</span><strong>{profile.parentContact.email || 'N/A'}</strong></div></div>
                            <div className="detail-item"><Phone size={18} /><div><span>Mobile</span><strong>{profile.parentContact.mobileNumber || 'N/A'}</strong></div></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
