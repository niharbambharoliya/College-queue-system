import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Check, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import dayjs from 'dayjs';
import './Student.css';

const BookSlot = () => {
    const { counterId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(counterId ? 2 : 1);
    const [counters, setCounters] = useState([]);
    const [selectedCounter, setSelectedCounter] = useState(counterId || null);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [workType, setWorkType] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');

    const workTypes = ['Admission', 'Scholarship', 'Document Verification', 'Fees Payment', 'Certificate Collection', 'General Enquiry', 'Other'];

    useEffect(() => {
        if (!counterId) fetchCounters();
        else fetchCounter();
    }, [counterId]);

    useEffect(() => {
        if (selectedCounter && selectedDate) fetchSlots();
    }, [selectedCounter, selectedDate]);

    const fetchCounters = async () => {
        const res = await api.get('/counters?active=true');
        setCounters(res.data.counters || []);
    };

    const fetchCounter = async () => {
        const res = await api.get(`/counters/${counterId}`);
        setCounters([res.data.counter]);
    };

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/slots?counterId=${selectedCounter}&date=${selectedDate}`);
            setSlots(res.data.slots || []);
        } catch (err) {
            setError('Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot || !workType) {
            setError('Please select a slot and work type');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/bookings', {
                slotId: selectedSlot.id,
                counterId: selectedCounter,
                workType,
                workDescription: description,
                date: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime
            });
            setBooking(res.data.booking);
            setStep(5);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => dayjs().format('YYYY-MM-DD');
    const getMaxDate = () => dayjs().add(14, 'day').format('YYYY-MM-DD');

    return (
        <div className="book-slot-page animate-fadeIn">
            {/* Progress Steps */}
            <div className="booking-progress">
                {['Counter', 'Date', 'Slot', 'Details', 'Confirm'].map((label, i) => (
                    <div key={label} className={`progress-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                        <div className="step-circle">{step > i + 1 ? <Check size={14} /> : i + 1}</div>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className="booking-container">
                {error && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}><AlertCircle size={18} /><span>{error}</span></div>}

                {/* Step 1: Select Counter */}
                {step === 1 && (
                    <div className="booking-step">
                        <h2>Select Counter</h2>
                        <div className="counter-select-grid">
                            {counters.map((c) => (
                                <div key={c.id} className={`counter-option ${selectedCounter === c.id ? 'selected' : ''}`} onClick={() => setSelectedCounter(c.id)}>
                                    <h4>{c.name}</h4>
                                    <p>{c.department}</p>
                                </div>
                            ))}
                        </div>
                        <div className="booking-actions">
                            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!selectedCounter}>
                                Next <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Date */}
                {step === 2 && (
                    <div className="booking-step">
                        <h2>Select Date</h2>
                        <div className="date-picker-wrapper">
                            <Calendar size={20} />
                            <input type="date" className="input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={getMinDate()} max={getMaxDate()} />
                        </div>
                        <div className="booking-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
                        </div>
                    </div>
                )}

                {/* Step 3: Select Slot */}
                {step === 3 && (
                    <div className="booking-step">
                        <h2>Select Time Slot</h2>
                        <p className="step-desc">Choose an available slot for {dayjs(selectedDate).format('DD MMMM YYYY')}</p>
                        {loading ? (
                            <div className="loading-container"><div className="spinner"></div></div>
                        ) : (
                            <div className="slots-grid">
                                {slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className={`slot-card ${!slot.isAvailable ? 'disabled' : ''} ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                                    >
                                        <div className="slot-time"><Clock size={16} /> {slot.startTime} - {slot.endTime}</div>
                                        <div className={`slot-capacity ${slot.remainingCapacity <= 2 ? 'low' : ''}`}>
                                            {slot.isFull ? 'Full' : `${slot.remainingCapacity} seats left`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="booking-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(4)} disabled={!selectedSlot}>Next <ArrowRight size={16} /></button>
                        </div>
                    </div>
                )}

                {/* Step 4: Work Details */}
                {step === 4 && (
                    <div className="booking-step">
                        <h2>Work Details</h2>
                        <div className="input-group">
                            <label>Work Type *</label>
                            <select className="input" value={workType} onChange={(e) => setWorkType(e.target.value)}>
                                <option value="">Select work type</option>
                                {workTypes.map((wt) => <option key={wt} value={wt}>{wt}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Description (Optional)</label>
                            <textarea className="input" rows={3} placeholder="Briefly describe your query..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="booking-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(3)}><ArrowLeft size={16} /> Back</button>
                            <button className="btn btn-primary" onClick={handleBooking} disabled={!workType || loading}>
                                {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Confirmation */}
                {step === 5 && booking && (
                    <div className="booking-step success-step">
                        <div className="success-icon"><Check size={40} /></div>
                        <h2>Booking Confirmed!</h2>
                        <p>Your appointment has been scheduled successfully</p>

                        <div className="booking-summary">
                            <div className="qr-container">
                                {booking.qrCode ? (
                                    <img src={booking.qrCode} alt="Booking QR Code" className="qr-image" />
                                ) : (
                                    <QRCodeSVG value={JSON.stringify({ bookingId: booking.id, time: booking.startTime, tokenNumber: booking.tokenNumber })} size={180} />
                                )}
                            </div>
                            <div className="summary-details">
                                <div className="summary-item"><span>Token Number</span><strong>#{booking.tokenNumber}</strong></div>
                                <div className="summary-item"><span>Counter</span><strong>{booking.counter}</strong></div>
                                <div className="summary-item"><span>Date</span><strong>{booking.date}</strong></div>
                                <div className="summary-item"><span>Time</span><strong>{booking.startTime} - {booking.endTime}</strong></div>
                                <div className="summary-item"><span>Work Type</span><strong>{booking.workType}</strong></div>
                            </div>
                        </div>

                        <div className="booking-actions">
                            <button className="btn btn-secondary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
                            <button className="btn btn-primary" onClick={() => navigate('/counters')}>Book Another</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookSlot;
