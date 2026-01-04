import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, AlertTriangle, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Student.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bookingsRes, notificationsRes] = await Promise.all([
                api.get('/bookings?type=upcoming'),
                api.get('/notifications?limit=5')
            ]);
            setUpcomingBookings(bookingsRes.data.current?.slice(0, 3) || []);
            setNotifications(notificationsRes.data.notifications?.slice(0, 4) || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { icon: Calendar, label: 'Book Slot', desc: 'Reserve your appointment', path: '/counters', color: 'primary' },
        { icon: Clock, label: 'My Bookings', desc: 'View your appointments', path: '/my-bookings', color: 'accent' },
        { icon: AlertTriangle, label: 'Emergency', desc: 'Request urgent slot', path: '/emergency', color: 'warning' },
    ];

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="dashboard animate-fadeIn">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
                    <p>Manage your queue bookings and appointments</p>
                </div>
                {user?.warningStatus && user?.warningStatus !== 'none' && (
                    <div className="warning-banner">
                        <AlertTriangle size={20} />
                        <span>Your account has a warning. Please avoid excessive cancellations.</span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="section-header">
                <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
                {quickActions.map((action) => (
                    <div key={action.label} className={`action-card action-${action.color}`} onClick={() => navigate(action.path)}>
                        <div className="action-icon"><action.icon size={24} /></div>
                        <div className="action-content">
                            <h3>{action.label}</h3>
                            <p>{action.desc}</p>
                        </div>
                        <ArrowRight size={20} className="action-arrow" />
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Upcoming Bookings */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3><Calendar size={20} /> Upcoming Bookings</h3>
                        <button onClick={() => navigate('/my-bookings')} className="btn btn-ghost btn-sm">View All</button>
                    </div>
                    <div className="card-body">
                        {upcomingBookings.length === 0 ? (
                            <div className="empty-state">
                                <Calendar size={40} />
                                <p>No upcoming bookings</p>
                                <button onClick={() => navigate('/counters')} className="btn btn-primary btn-sm">Book Now</button>
                            </div>
                        ) : (
                            <div className="booking-list">
                                {upcomingBookings.map((booking) => (
                                    <div key={booking.id} className="booking-item">
                                        <div className="booking-token">#{booking.tokenNumber}</div>
                                        <div className="booking-details">
                                            <h4>{booking.counter}</h4>
                                            <p>{booking.date} • {booking.startTime}</p>
                                        </div>
                                        <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'pending'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3><Bell size={20} /> Notifications</h3>
                        <button onClick={() => navigate('/notifications')} className="btn btn-ghost btn-sm">View All</button>
                    </div>
                    <div className="card-body">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <Bell size={40} />
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message.substring(0, 80)}...</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
