import { Info, FileText, GraduationCap, CreditCard, FileCheck, HelpCircle } from 'lucide-react';
import './Student.css';

const InformationCenter = () => {
    const sections = [
        {
            icon: GraduationCap, title: 'Admissions', color: '#3b82f6',
            documents: ['10th & 12th Marksheets', 'Transfer Certificate (TC)', 'Migration Certificate', 'Character Certificate', 'Passport Size Photos (6)', 'Aadhar Card Copy', 'Caste Certificate (if applicable)']
        },
        {
            icon: CreditCard, title: 'Scholarships', color: '#22c55e',
            documents: ['Income Certificate', 'Caste Certificate', 'Previous Year Marksheets', 'Bank Passbook Copy', 'Aadhar Card', 'Scholarship ID (if renewal)', 'Bonafide Certificate']
        },
        {
            icon: FileCheck, title: 'Document Verification', color: '#f59e0b',
            documents: ['Original Documents', 'ID Proof', 'Previous Verification Reports', 'Application Form', 'Fee Receipt']
        },
        {
            icon: FileText, title: 'Certificate Collection', color: '#a855f7',
            documents: ['Application Receipt', 'ID Card', 'Fee Payment Proof', 'Authorization Letter (if collecting for someone)']
        },
        {
            icon: HelpCircle, title: 'General Enquiry', color: '#06b6d4',
            documents: ['No specific documents required', 'Bring ID card for identification', 'Note down your query beforehand']
        }
    ];

    return (
        <div className="info-page animate-fadeIn">
            <div className="page-header">
                <h1><Info size={28} /> Information Center</h1>
                <p>Documents required for various administrative services</p>
            </div>

            <div className="info-grid">
                {sections.map((section) => (
                    <div key={section.title} className="info-card">
                        <div className="info-card-header" style={{ background: `linear-gradient(135deg, ${section.color}33, ${section.color}11)` }}>
                            <div className="info-icon" style={{ background: section.color }}><section.icon size={24} /></div>
                            <h3>{section.title}</h3>
                        </div>
                        <div className="info-card-body">
                            <ul className="document-list">
                                {section.documents.map((doc, i) => (
                                    <li key={i}><FileText size={14} />{doc}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card info-tips">
                <h3>📌 Important Tips</h3>
                <ul>
                    <li>Always carry original documents along with photocopies</li>
                    <li>Arrive 10 minutes before your scheduled slot time</li>
                    <li>Have your booking QR code ready on your phone</li>
                    <li>For scholarship queries, check the government portal for latest updates</li>
                    <li>Emergency requests require valid proof of deadline</li>
                </ul>
            </div>
        </div>
    );
};

export default InformationCenter;
