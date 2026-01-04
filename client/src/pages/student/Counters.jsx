import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, ArrowRight, Building2 } from 'lucide-react';
import api from '../../services/api';
import './Student.css';

const Counters = () => {
    const navigate = useNavigate();
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCounters();
    }, []);

    const fetchCounters = async () => {
        try {
            const res = await api.get('/counters?active=true');
            setCounters(res.data.counters || []);
        } catch (error) {
            console.error('Failed to fetch counters:', error);
        } finally {
            setLoading(false);
        }
    };

    const departments = ['all', ...new Set(counters.map(c => c.department))];
    const filteredCounters = filter === 'all' ? counters : counters.filter(c => c.department === filter);

    const departmentColors = {
        'Admissions': { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: 'rgba(59, 130, 246, 0.3)' },
        'Scholarships': { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', shadow: 'rgba(34, 197, 94, 0.3)' },
        'Document Verification': { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245, 158, 11, 0.3)' },
        'Fees': { bg: 'linear-gradient(135deg, #a855f7, #9333ea)', shadow: 'rgba(168, 85, 247, 0.3)' },
        'General Enquiry': { bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', shadow: 'rgba(6, 182, 212, 0.3)' },
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="counters-page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>Counter Services</h1>
                    <p>Select a counter to book your appointment slot</p>
                </div>
            </div>

            {/* Department Filter */}
            <div className="filter-tabs">
                {departments.map((dept) => (
                    <button
                        key={dept}
                        className={`filter-tab ${filter === dept ? 'active' : ''}`}
                        onClick={() => setFilter(dept)}
                    >
                        {dept === 'all' ? 'All Counters' : dept}
                    </button>
                ))}
            </div>

            {/* Counters Grid */}
            <div className="counters-grid">
                {filteredCounters.map((counter) => {
                    const colors = departmentColors[counter.department] || departmentColors['General Enquiry'];
                    return (
                        <div key={counter.id} className="counter-card" onClick={() => navigate(`/book-slot/${counter.id}`)}>
                            <div className="counter-icon" style={{ background: colors.bg, boxShadow: `0 8px 24px ${colors.shadow}` }}>
                                <Building2 size={28} />
                            </div>
                            <div className="counter-info">
                                <h3>{counter.name}</h3>
                                <p className="counter-dept">{counter.department}</p>
                                <p className="counter-desc">{counter.description}</p>
                                <div className="counter-hours">
                                    <Clock size={14} />
                                    <span>{counter.operatingHours?.startTime || '10:00'} - {counter.operatingHours?.endTime || '17:00'}</span>
                                </div>
                            </div>
                            <div className="counter-action">
                                <span>Book Slot</span>
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredCounters.length === 0 && (
                <div className="empty-state-large">
                    <Users size={60} />
                    <h3>No Counters Available</h3>
                    <p>No active counters found for this department</p>
                </div>
            )}
        </div>
    );
};

export default Counters;
