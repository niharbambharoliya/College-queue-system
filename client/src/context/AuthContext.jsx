import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const parentLogin = async (credentials) => {
        const res = await api.post('/auth/parent-login', credentials);
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isStudent: user?.userType === 'student',
        isFaculty: user?.userType === 'faculty',
        isParent: user?.userType === 'parent',
        login,
        parentLogin,
        logout,
        refreshUser: fetchUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

