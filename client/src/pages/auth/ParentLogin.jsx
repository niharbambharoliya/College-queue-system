import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Phone, User, CreditCard, MapPin, AlertCircle } from 'lucide-react';
import './Auth.css';

const ParentLogin = () => {
    const navigate = useNavigate();
    const { parentLogin } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        aadhaarNumber: '',
        address: '',
        mobileNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'aadhaarNumber') {
            // Only allow digits, max 12
            setFormData(prev => ({
                ...prev,
                [name]: value.replace(/\D/g, '').slice(0, 12)
            }));
        } else if (name === 'mobileNumber') {
            // Only allow digits, max 10
            setFormData(prev => ({
                ...prev,
                [name]: value.replace(/\D/g, '').slice(0, 10)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await parentLogin(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid =
        formData.fullName.trim().length > 0 &&
        formData.aadhaarNumber.length === 12 &&
        formData.address.trim().length > 0 &&
        formData.mobileNumber.length === 10;

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card animate-slideUp">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <div className="auth-logo-icon">BVM</div>
                        </div>
                        <h1>Parent Login</h1>
                        <p>Access your child's queue management account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error"><AlertCircle size={18} /><span>{error}</span></div>}

                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="fullName"
                                    className="input"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Aadhaar Card Number</label>
                            <div className="input-with-icon">
                                <CreditCard size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="aadhaarNumber"
                                    className="input"
                                    placeholder="Enter 12-digit Aadhaar number"
                                    value={formData.aadhaarNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Address</label>
                            <div className="input-with-icon" style={{ alignItems: 'flex-start' }}>
                                <MapPin size={18} className="input-icon" style={{ marginTop: '12px' }} />
                                <textarea
                                    name="address"
                                    className="input"
                                    placeholder="Enter your full address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{ resize: 'vertical', minHeight: '80px' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Mobile Number</label>
                            <div className="input-with-icon">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    className="input"
                                    placeholder="Enter your 10-digit mobile"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading || !isFormValid}>
                            {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : 'Login'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Student or Faculty?</p>
                        <Link to="/login" className="auth-link">← Login with Email</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentLogin;

