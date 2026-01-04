import { useState, useEffect } from 'react';
import { Calendar, Clock, X, ChevronDown, ChevronUp, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import './Student.css';

const MyBookings = () => {
    const [currentBookings, setCurrentBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setCurrentBookings(res.data.current || []);
            setHistoryBookings(res.data.history || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        setCancelling(bookingId);
        try {
            await api.delete(`/bookings/${bookingId}`);
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel');
        } finally {
            setCancelling(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = { confirmed: 'success', completed: 'success', pending: 'pending', missed: 'error', cancelled: 'warning' };
        return colors[status] || 'info';
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="my-bookings-page animate-fadeIn">
            <div className="page-header">
                <h1>My Bookings</h1>
                <p>View and manage your appointments</p>
            </div>

            {/* Current Bookings */}
            <div className="bookings-section">
                <h2><Calendar size={20} /> Upcoming Appointments</h2>

                {currentBookings.length === 0 ? (
                    <div className="empty-state-large">
                        <Calendar size={60} />
                        <h3>No Upcoming Bookings</h3>
                        <p>You don't have any scheduled appointments</p>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {currentBookings.map((booking) => (
                            <div key={booking.id} className="booking-card">
                                <div className="booking-card-header">
                                    <div className="booking-token-large">#{booking.tokenNumber}</div>
                                    <span className={`badge badge-${getStatusColor(booking.status)}`}>{booking.status}</span>
                                </div>
                                <div className="booking-card-body">
                                    <h3>{booking.counter}</h3>
                                    <div className="booking-meta">
                                        <span><Calendar size={14} /> {booking.date}</span>
                                        <span><Clock size={14} /> {booking.startTime} - {booking.endTime}</span>
                                    </div>
                                    <p className="booking-work-type">{booking.workType}</p>
                                </div>
                                <div className="booking-card-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedBooking(booking)}>
                                        <QrCode size={16} /> View QR
                                    </button>
                                    {booking.status === 'confirmed' && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(booking.id)} disabled={cancelling === booking.id}>
                                            {cancelling === booking.id ? <div className="spinner" style={{ width: 14, height: 14 }}></div> : <><X size={14} /> Cancel</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History Section (Nested) */}
            <div className="bookings-section history-section">
                <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
                    <span><Clock size={20} /> Booking History ({historyBookings.length})</span>
                    {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showHistory && (
                    <div className="history-content animate-slideUp">
                        {historyBookings.length === 0 ? (
                            <p className="text-muted text-center">No past bookings</p>
                        ) : (
                            <div className="history-list">
                                {historyBookings.map((booking) => (
                                    <div key={booking.id} className="history-item">
                                        <div className="history-date">{booking.date}</div>
                                        <div className="history-details">
                                            <h4>{booking.counter}</h4>
                                            <p>{booking.startTime} • {booking.workType}</p>
                                        </div>
                                        <span className={`badge badge-${getStatusColor(booking.status)}`}>{booking.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Booking QR Code</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedBooking(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <div className="qr-container" style={{ display: 'inline-block', padding: 'var(--space-4)', background: 'white', borderRadius: 'var(--radius-lg)' }}>
                                {selectedBooking.qrCode ? (
                                    <img src={selectedBooking.qrCode} alt="QR Code" style={{ width: 200 }} />
                                ) : (
                                    <QRCodeSVG value={JSON.stringify({ bookingId: selectedBooking.id, tokenNumber: selectedBooking.tokenNumber })} size={200} />
                                )}
                            </div>
                            <div className="summary-details" style={{ marginTop: 'var(--space-4)' }}>
                                <p><strong>Token:</strong> #{selectedBooking.tokenNumber}</p>
                                <p><strong>Counter:</strong> {selectedBooking.counter}</p>
                                <p><strong>Date:</strong> {selectedBooking.date} at {selectedBooking.startTime}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
