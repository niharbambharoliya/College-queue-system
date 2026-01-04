import { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Clock, User, Calendar, FileText, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import './Faculty.css';

const EmergencyManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/emergency-queue/pending');
            setRequests(res.data.requests || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (requestId) => {
        setActionLoading(requestId);
        try {
            await api.post(`/emergency-queue/${requestId}/approve`);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const rejectRequest = async () => {
        if (!selectedRequest || !rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        setActionLoading(selectedRequest.id);
        try {
            await api.post(`/emergency-queue/${selectedRequest.id}/reject`, { reason: rejectReason });
            setSelectedRequest(null);
            setRejectReason('');
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="emergency-management-page animate-fadeIn">
            <div className="page-header">
                <h1><AlertTriangle size={28} /> Emergency Requests</h1>
                <p>Review and respond to urgent appointment requests</p>
            </div>

            {requests.length === 0 ? (
                <div className="empty-state-large">
                    <AlertTriangle size={60} />
                    <h3>No Pending Requests</h3>
                    <p>All emergency requests have been processed</p>
                </div>
            ) : (
                <div className="emergency-cards">
                    {requests.map((request) => (
                        <div key={request.id} className="emergency-card">
                            <div className="emergency-card-header">
                                <div className="emergency-badge"><AlertTriangle size={16} /> Emergency</div>
                                <span className="emergency-time">{new Date(request.requestedAt).toLocaleString()}</span>
                            </div>

                            <div className="emergency-card-body">
                                <div className="student-section">
                                    <User size={20} />
                                    <div>
                                        <h4>{request.student?.name}</h4>
                                        <p>{request.student?.rollNumber} • {request.student?.department}</p>
                                        <p className="text-sm text-muted">{request.student?.email}</p>
                                    </div>
                                </div>

                                <div className="details-grid">
                                    <div className="detail"><Calendar size={16} /><span>Requested Date:</span><strong>{request.requestedDate}</strong></div>
                                    <div className="detail"><Clock size={16} /><span>Preferred Time:</span><strong>{request.requestedTime}</strong></div>
                                    <div className="detail full"><AlertTriangle size={16} /><span>Deadline:</span><strong>{request.deadline}</strong></div>
                                    <div className="detail full"><FileText size={16} /><span>Work Type:</span><strong>{request.workType}</strong></div>
                                </div>

                                <div className="description-box">
                                    <h5>Description</h5>
                                    <p>{request.description}</p>
                                </div>

                                {request.proofDocument && (
                                    <a href={request.proofDocument} target="_blank" rel="noopener noreferrer" className="proof-link">
                                        <FileText size={16} /> View Proof Document <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>

                            <div className="emergency-card-actions">
                                <button className="btn btn-success" onClick={() => approveRequest(request.id)} disabled={actionLoading === request.id}>
                                    {actionLoading === request.id ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : <><Check size={16} /> Approve</>}
                                </button>
                                <button className="btn btn-danger" onClick={() => setSelectedRequest(request)}>
                                    <X size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {selectedRequest && (
                <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reject Request</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRequest(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p>Rejecting request from <strong>{selectedRequest.student?.name}</strong></p>
                            <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                <label>Rejection Reason *</label>
                                <textarea className="input" rows={3} placeholder="Provide a reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={rejectRequest} disabled={actionLoading}>
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyManagement;
