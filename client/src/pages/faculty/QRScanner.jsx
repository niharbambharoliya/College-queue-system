import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Check, X, User, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import './Faculty.css';

const QRScanner = () => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const scannerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, []);

    const startScanning = () => {
        setScanning(true);
        setResult(null);
        setError('');

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } });
            scannerRef.current = scanner;

            scanner.render(
                async (decodedText) => {
                    scanner.clear();
                    setScanning(false);
                    await verifyQR(decodedText);
                },
                (err) => console.log('Scan error:', err)
            );
        }, 100);
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
        }
        setScanning(false);
    };

    const verifyQR = async (qrData) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/faculty/scan-qr', { qrData });
            setResult(res.data.booking);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleManualVerify = async () => {
        if (!manualInput.trim()) return;
        await verifyQR(manualInput);
    };

    const markAction = async (action) => {
        if (!result) return;
        setLoading(true);
        try {
            await api.post(`/faculty/mark-${action}/${result.id}`);
            setResult({ ...result, status: action });
        } catch (err) {
            setError(err.response?.data?.message || `Failed to mark as ${action}`);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError('');
        setManualInput('');
    };

    return (
        <div className="qr-scanner-page animate-fadeIn">
            <div className="page-header">
                <h1><QrCode size={28} /> QR Scanner</h1>
                <p>Scan student booking QR codes to verify appointments</p>
            </div>

            <div className="scanner-container">
                {!scanning && !result && (
                    <div className="scanner-start">
                        <div className="scanner-icon"><Camera size={60} /></div>
                        <h3>Scan Booking QR Code</h3>
                        <p>Position the QR code within the camera frame</p>
                        <button className="btn btn-primary btn-lg" onClick={startScanning}>
                            <Camera size={20} /> Start Scanner
                        </button>

                        <div className="divider"><span>OR</span></div>

                        <div className="manual-input">
                            <h4>Manual Verification</h4>
                            <div className="input-row">
                                <input type="text" className="input" placeholder="Paste QR data or booking ID" value={manualInput} onChange={(e) => setManualInput(e.target.value)} />
                                <button className="btn btn-secondary" onClick={handleManualVerify} disabled={loading}>
                                    {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Verify'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {scanning && (
                    <div className="scanner-active">
                        <div id="qr-reader" style={{ width: '100%' }}></div>
                        <button className="btn btn-secondary" onClick={stopScanning}>Cancel Scanning</button>
                    </div>
                )}

                {loading && !scanning && (
                    <div className="loading-container"><div className="spinner"></div><p>Verifying...</p></div>
                )}

                {error && (
                    <div className="scanner-error">
                        <X size={40} />
                        <h3>Verification Failed</h3>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={reset}><RefreshCw size={16} /> Try Again</button>
                    </div>
                )}

                {result && (
                    <div className="scanner-result">
                        <div className={`result-header ${result.status === 'completed' ? 'success' : result.status === 'missed' ? 'error' : 'info'}`}>
                            <Check size={40} />
                            <h3>{result.status === 'completed' ? 'Already Completed' : result.status === 'missed' ? 'Marked as Missed' : 'Booking Verified!'}</h3>
                        </div>

                        <div className="result-details">
                            <div className="detail-row"><User size={18} /><div><span>Student</span><strong>{result.student?.name}</strong></div></div>
                            <div className="detail-row"><Calendar size={18} /><div><span>Roll Number</span><strong>{result.student?.rollNumber}</strong></div></div>
                            <div className="detail-row"><Clock size={18} /><div><span>Appointment</span><strong>{result.date} at {result.startTime}</strong></div></div>
                            <div className="detail-row"><QrCode size={18} /><div><span>Token</span><strong>#{result.tokenNumber}</strong></div></div>
                            <div className="detail-row counter-row"><div><span>Counter</span><strong>{result.counter?.name}</strong></div></div>
                            <div className="detail-row"><div><span>Work Type</span><strong>{result.workType}</strong></div></div>
                        </div>

                        {result.status === 'confirmed' && (
                            <div className="result-actions">
                                <button className="btn btn-success btn-lg" onClick={() => markAction('completed')} disabled={loading}>
                                    <Check size={18} /> Mark Completed
                                </button>
                                <button className="btn btn-danger btn-lg" onClick={() => markAction('missed')} disabled={loading}>
                                    <X size={18} /> Mark Missed
                                </button>
                            </div>
                        )}

                        <button className="btn btn-ghost" onClick={reset} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                            <RefreshCw size={16} /> Scan Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
