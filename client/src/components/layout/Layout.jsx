import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ userType = 'student' }) => {
    return (
        <div className="layout">
            <Sidebar userType={userType} />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
