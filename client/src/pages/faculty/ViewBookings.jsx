import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X, Filter } from 'lucide-react';
import api from '../../services/api';
import './Faculty.css';

const ViewBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('today');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const endpoint = filter === 'today' ? '/faculty/today-bookings' : filter === 'upcoming' ? '/faculty/upcoming-bookings' : '/faculty/past-bookings';
            const res = await api.get(endpoint);
            setBookings(res.data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const markCompleted = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await api.post(`/faculty/mark-completed/${bookingId}`);
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to mark as completed');
        } finally {
            setActionLoading(null);
        }
    };

    const markMissed = async (bookingId) => {
        if (!confirm('Mark this booking as missed? This will count towards the student\'s fake enquiry record.')) return;
        setActionLoading(bookingId);
        try {
            await api.post(`/faculty/mark-missed/${bookingId}`);
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to mark as missed');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = { confirmed: 'info', completed: 'success', missed: 'error', cancelled: 'warning', pending: 'pending' };
        return colors[status] || 'info';
    };

    return (
        <div className="view-bookings-page animate-fadeIn">
            <div className="page-header">
                <h1>Student Bookings</h1>
                <p>View and manage student appointments</p>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button className={`filter-tab ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>
                    <Calendar size={16} /> Today
                </button>
                <button className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
                    <Clock size={16} /> Upcoming
                </button>
                <button className={`filter-tab ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>
                    <Filter size={16} /> Past
                </button>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : bookings.length === 0 ? (
                <div className="empty-state-large">
                    <Calendar size={60} />
                    <h3>No Bookings Found</h3>
                    <p>There are no {filter} bookings to display</p>
                </div>
            ) : (
                <div className="bookings-table-container">
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Token</th>
                                <th>Student</th>
                                <th>Time</th>
                                <th>Work Type</th>
                                <th>Status</th>
                                {filter === 'today' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td><span className="token-badge">#{booking.tokenNumber}</span></td>
                                    <td>
                                        <div className="student-info">
                                            <strong>{booking.student?.name}</strong>
                                            <span>{booking.student?.rollNumber} • {booking.student?.department}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-info">
                                            <strong>{booking.startTime} - {booking.endTime}</strong>
                                            <span>{booking.date}</span>
                                        </div>
                                    </td>
                                    <td>{booking.workType}</td>
                                    <td><span className={`badge badge-${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                                    {filter === 'today' && (
                                        <td>
                                            {booking.status === 'confirmed' && (
                                                <div className="action-buttons">
                                                    <button className="btn btn-success btn-sm" onClick={() => markCompleted(booking.id)} disabled={actionLoading === booking.id}>
                                                        <Check size={14} /> Complete
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => markMissed(booking.id)} disabled={actionLoading === booking.id}>
                                                        <X size={14} /> Missed
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewBookings;
