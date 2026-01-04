import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            navigate(user.userType === 'faculty' ? '/faculty' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card animate-slideUp">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <div className="auth-logo-icon">BVM</div>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to your BVM Queue Management account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="auth-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="yourname@bvmengineering.ac.in"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Are you a parent?</p>
                        <Link to="/parent-login" className="auth-link">Login by your details as a parent →</Link>
                    </div>

                    <div className="auth-demo-info">
                        <h4>Demo Credentials</h4>
                        <p><strong>Student:</strong> 25ec443@bvmengineering.ac.in</p>
                        <p><strong>Faculty:</strong> 25ec407@bvmengineering.ac.in</p>
                        <p><strong>Password:</strong> password123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
