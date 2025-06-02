import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import '../assets/css/admin/admin.css';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
            <AdminHeader />
            <div className="admin-content">
            <Outlet />
            </div>
        </div>
        </div>
    );
}
