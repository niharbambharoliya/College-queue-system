import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, AlertTriangle, Info } from 'lucide-react';
import api from '../../services/api';
import './Student.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=50');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete');
        }
    };

    const getIcon = (type) => {
        if (type.includes('booking')) return <Calendar size={18} className="text-primary" />;
        if (type.includes('emergency') || type.includes('warning')) return <AlertTriangle size={18} className="text-warning" />;
        return <Info size={18} className="text-muted" />;
    };

    const filteredNotifications = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="notifications-page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1><Bell size={28} /> Notifications</h1>
                    <p>Stay updated with your booking alerts and announcements</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
                        <Check size={14} /> Mark All Read
                    </button>
                )}
            </div>

            <div className="filter-tabs">
                <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All ({notifications.length})
                </button>
                <button className={`filter-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                    Unread ({unreadCount})
                </button>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="empty-state-large">
                    <Bell size={60} />
                    <h3>No Notifications</h3>
                    <p>{filter === 'unread' ? 'All caught up!' : 'You have no notifications yet'}</p>
                </div>
            ) : (
                <div className="notification-cards">
                    {filteredNotifications.map((notif) => (
                        <div key={notif.id} className={`notification-card ${!notif.isRead ? 'unread' : ''}`}>
                            <div className="notification-icon">{getIcon(notif.type)}</div>
                            <div className="notification-content">
                                <h4>{notif.title}</h4>
                                <p>{notif.message}</p>
                                <span className="notification-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="notification-actions">
                                {!notif.isRead && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(notif.id)} title="Mark as read">
                                        <Check size={16} />
                                    </button>
                                )}
                                <button className="btn btn-ghost btn-sm" onClick={() => deleteNotification(notif.id)} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
