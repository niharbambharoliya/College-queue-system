import { useState, useEffect } from 'react';
import { AlertTriangle, Upload, Calendar, Clock, Send, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import dayjs from 'dayjs';
import './Student.css';

const EmergencyRequest = () => {
    const [counters, setCounters] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        counterId: '', requestedDate: dayjs().format('YYYY-MM-DD'), requestedTime: '10:00',
        workType: '', deadline: '', description: '', proofDocument: null
    });

    const workTypes = ['Emergency Document', 'Urgent Scholarship Issue', 'Deadline Submission', 'Other Emergency'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [countersRes, requestsRes] = await Promise.all([
                api.get('/counters?active=true'),
                api.get('/emergency-queue/my-requests')
            ]);
            setCounters(countersRes.data.counters || []);
            setMyRequests(requestsRes.data.requests || []);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.proofDocument) {
            setError('Please upload proof document');
            return;
        }
        setSubmitting(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });

            await api.post('/emergency-queue', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            fetchData();
            setFormData({ counterId: '', requestedDate: dayjs().format('YYYY-MM-DD'), requestedTime: '10:00', workType: '', deadline: '', description: '', proofDocument: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'approved') return <CheckCircle size={16} className="text-success" />;
        if (status === 'rejected' || status === 'auto_rejected') return <XCircle size={16} className="text-error" />;
        return <Clock size={16} className="text-warning" />;
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="emergency-page animate-fadeIn">
            <div className="page-header">
                <h1><AlertTriangle size={28} /> Emergency Queue</h1>
                <p>Request an urgent appointment slot with proof of deadline</p>
            </div>

            {success && (
                <div className="success-banner">
                    <CheckCircle size={20} />
                    <span>Your emergency request has been submitted. Faculty will be notified.</span>
                    <button onClick={() => setSuccess(false)}>&times;</button>
                </div>
            )}

            <div className="emergency-grid">
                {/* Request Form */}
                <div className="card emergency-form-card">
                    <h3>Submit Emergency Request</h3>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="auth-error"><AlertTriangle size={16} />{error}</div>}

                        <div className="input-group">
                            <label>Select Counter *</label>
                            <select className="input" value={formData.counterId} onChange={(e) => setFormData({ ...formData, counterId: e.target.value })} required>
                                <option value="">Choose counter</option>
                                {counters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Preferred Date *</label>
                                <input type="date" className="input" value={formData.requestedDate} onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })} min={dayjs().format('YYYY-MM-DD')} required />
                            </div>
                            <div className="input-group">
                                <label>Preferred Time *</label>
                                <select className="input" value={formData.requestedTime} onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Emergency Type *</label>
                            <select className="input" value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })} required>
                                <option value="">Select type</option>
                                {workTypes.map(wt => <option key={wt} value={wt}>{wt}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Your Deadline *</label>
                            <input type="text" className="input" placeholder="e.g., Document submission by 5th Jan 2026" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
                        </div>

                        <div className="input-group">
                            <label>Description *</label>
                            <textarea className="input" rows={3} placeholder="Explain why this is urgent..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                        </div>

                        <div className="input-group">
                            <label>Upload Proof Document *</label>
                            <div className="file-upload">
                                <input type="file" id="proof" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFormData({ ...formData, proofDocument: e.target.files[0] })} required />
                                <label htmlFor="proof" className="file-label">
                                    <Upload size={20} />
                                    <span>{formData.proofDocument ? formData.proofDocument.name : 'Choose file (JPG, PNG, PDF)'}</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                            {submitting ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : <><Send size={16} /> Submit Request</>}
                        </button>
                    </form>
                </div>

                {/* My Requests */}
                <div className="card">
                    <h3>My Emergency Requests</h3>
                    {myRequests.length === 0 ? (
                        <div className="empty-state"><AlertTriangle size={40} /><p>No emergency requests</p></div>
                    ) : (
                        <div className="request-list">
                            {myRequests.map((req) => (
                                <div key={req.id} className="request-item">
                                    <div className="request-header">
                                        {getStatusIcon(req.status)}
                                        <span className={`badge badge-${req.status === 'approved' ? 'success' : req.status === 'pending' ? 'pending' : 'error'}`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h4>{req.counter}</h4>
                                    <p>{req.requestedDate} • {req.workType}</p>
                                    {req.rejectionReason && <p className="text-error text-sm">Reason: {req.rejectionReason}</p>}
                                    {req.booking && <p className="text-success text-sm">Token: #{req.booking.tokenNumber}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyRequest;
