import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, AlertTriangle, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Faculty.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/faculty/dashboard-stats');
            setStats(res.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { icon: Calendar, label: "Today's Total", value: stats?.today?.total || 0, color: 'primary' },
        { icon: CheckCircle, label: 'Completed', value: stats?.today?.completed || 0, color: 'success' },
        { icon: XCircle, label: 'Missed', value: stats?.today?.missed || 0, color: 'error' },
        { icon: Clock, label: 'Pending', value: stats?.today?.pending || 0, color: 'warning' },
    ];

    const quickActions = [
        { icon: Calendar, label: 'View Bookings', desc: 'See all student appointments', path: '/faculty/bookings' },
        { icon: QrCode, label: 'Scan QR', desc: 'Verify student check-in', path: '/faculty/scanner' },
        { icon: AlertTriangle, label: 'Emergency Queue', desc: `${stats?.pendingEmergencies || 0} pending requests`, path: '/faculty/emergency', highlight: stats?.pendingEmergencies > 0 },
    ];

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="faculty-dashboard animate-fadeIn">
            <div className="welcome-section">
                <h1>Welcome, {user?.fullName?.split(' ')[0]}!</h1>
                <p>Faculty Dashboard - Manage student bookings and queues</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat) => (
                    <div key={stat.label} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-icon"><stat.icon size={24} /></div>
                        <div className="stat-content">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
                {quickActions.map((action) => (
                    <div key={action.label} className={`action-card ${action.highlight ? 'highlight' : ''}`} onClick={() => navigate(action.path)}>
                        <div className="action-icon"><action.icon size={24} /></div>
                        <div className="action-content">
                            <h3>{action.label}</h3>
                            <p>{action.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Emergency Alert */}
            {stats?.pendingEmergencies > 0 && (
                <div className="emergency-alert" onClick={() => navigate('/faculty/emergency')}>
                    <AlertTriangle size={24} />
                    <div>
                        <h4>Pending Emergency Requests</h4>
                        <p>{stats.pendingEmergencies} student(s) require urgent attention</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
