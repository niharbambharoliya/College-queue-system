import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/counters': 'Counter Services',
    '/book-slot': 'Book a Slot',
    '/my-bookings': 'My Bookings',
    '/emergency': 'Emergency Queue',
    '/information': 'Information Center',
    '/notifications': 'Notifications',
    '/profile': 'My Profile',
    '/faculty': 'Faculty Dashboard',
    '/faculty/bookings': 'Student Bookings',
    '/faculty/scanner': 'QR Scanner',
    '/faculty/emergency': 'Emergency Requests',
    '/faculty/profile': 'Profile',
};

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotificationCount();
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const res = await api.get('/notifications?unreadOnly=true&limit=1');
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const getPageTitle = () => {
        for (const [path, title] of Object.entries(pageTitles)) {
            if (location.pathname === path || location.pathname.startsWith(path + '/')) {
                return title;
            }
        }
        return 'BVM Queue Management';
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle">
                    <Menu size={24} />
                </button>
                <h1 className="header-title">{getPageTitle()}</h1>
            </div>

            <div className="header-right">
                <button
                    className="header-btn"
                    onClick={() => navigate(user?.userType === 'faculty' ? '/faculty/profile' : '/notifications')}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
            </div>
        </header>
    );
};

export default Header;
