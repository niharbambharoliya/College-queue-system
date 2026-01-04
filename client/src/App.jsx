import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import ParentLogin from './pages/auth/ParentLogin';
import StudentDashboard from './pages/student/Dashboard';
import Counters from './pages/student/Counters';
import BookSlot from './pages/student/BookSlot';
import MyBookings from './pages/student/MyBookings';
import EmergencyRequest from './pages/student/EmergencyRequest';
import StudentProfile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';
import InformationCenter from './pages/student/InformationCenter';
import FacultyDashboard from './pages/faculty/Dashboard';
import ViewBookings from './pages/faculty/ViewBookings';
import QRScanner from './pages/faculty/QRScanner';
import EmergencyManagement from './pages/faculty/EmergencyManagement';
import FacultyProfile from './pages/faculty/Profile';

// Layout
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh' }}><div className="spinner"></div></div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.userType)) {
        const redirect = user.userType === 'faculty' ? '/faculty' : '/dashboard';
        return <Navigate to={redirect} replace />;
    }
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh' }}><div className="spinner"></div></div>;
    if (user) {
        const redirect = user.userType === 'faculty' ? '/faculty' : '/dashboard';
        return <Navigate to={redirect} replace />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/parent-login" element={<PublicRoute><ParentLogin /></PublicRoute>} />

                    {/* Student Routes */}
                    <Route path="/" element={<ProtectedRoute allowedRoles={['student', 'parent']}><Layout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="counters" element={<Counters />} />
                        <Route path="book-slot" element={<BookSlot />} />
                        <Route path="book-slot/:counterId" element={<BookSlot />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                        <Route path="emergency" element={<EmergencyRequest />} />
                        <Route path="profile" element={<StudentProfile />} />
                        <Route path="notifications" element={<StudentNotifications />} />
                        <Route path="information" element={<InformationCenter />} />
                    </Route>

                    {/* Faculty Routes */}
                    <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><Layout userType="faculty" /></ProtectedRoute>}>
                        <Route index element={<FacultyDashboard />} />
                        <Route path="bookings" element={<ViewBookings />} />
                        <Route path="scanner" element={<QRScanner />} />
                        <Route path="emergency" element={<EmergencyManagement />} />
                        <Route path="profile" element={<FacultyProfile />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
