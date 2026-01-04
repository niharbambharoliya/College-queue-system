import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Calendar, Clock, AlertTriangle, User, Bell, Info, Users, QrCode, LogOut } from 'lucide-react';

const studentNav = [
    {
        section: 'Main', items: [
            { path: '/dashboard', icon: Home, label: 'Dashboard' },
            { path: '/counters', icon: Users, label: 'Counters' },
            { path: '/my-bookings', icon: Calendar, label: 'My Bookings' },
        ]
    },
    {
        section: 'Services', items: [
            { path: '/emergency', icon: AlertTriangle, label: 'Emergency Queue' },
            { path: '/information', icon: Info, label: 'Information Center' },
        ]
    },
    {
        section: 'Account', items: [
            { path: '/notifications', icon: Bell, label: 'Notifications' },
            { path: '/profile', icon: User, label: 'Profile' },
        ]
    }
];

const facultyNav = [
    {
        section: 'Main', items: [
            { path: '/faculty', icon: Home, label: 'Dashboard', end: true },
            { path: '/faculty/bookings', icon: Calendar, label: 'View Bookings' },
            { path: '/faculty/scanner', icon: QrCode, label: 'QR Scanner' },
        ]
    },
    {
        section: 'Management', items: [
            { path: '/faculty/emergency', icon: AlertTriangle, label: 'Emergency Requests' },
        ]
    },
    {
        section: 'Account', items: [
            { path: '/faculty/profile', icon: User, label: 'Profile' },
        ]
    }
];

const Sidebar = ({ userType }) => {
    const { user, logout } = useAuth();
    const navItems = userType === 'faculty' ? facultyNav : studentNav;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">BVM</div>
                    <span className="sidebar-logo-text">Queue System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section} className="nav-section">
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon className="nav-link-icon" size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{user?.fullName || 'User'}</div>
                        <div className="user-role">{user?.userType}</div>
                    </div>
                </div>
                <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
