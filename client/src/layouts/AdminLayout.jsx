import AdminSidebar from '../components/admin/AdminSidebar';
import '../assets/css/admin/admin.css';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
            <div className="admin-content">
            <Outlet />
            </div>
        </div>
        </div>
    );
}
