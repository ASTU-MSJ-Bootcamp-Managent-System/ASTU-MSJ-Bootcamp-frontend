import { useLocation } from 'react-router-dom';
import AdminUsers from '../components/admin/AdminUsers';
import { useAuth } from '../context/AuthContext';
import AssignmentDetailPage from '../pages/assignments/AssignmentDetailPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ProfilePage from '../pages/profile/ProfilePage';
import RecordsPage from '../pages/records/RecordsPage';
import { validRecordTypes } from '../pages/records/recordsData';

export default function DashboardArea() {
  const { user } = useAuth();
  const location = useLocation();
  const [, , section = 'dashboard', detail] = location.pathname.split('/');

  if (section === 'dashboard') return <DashboardPage role={user.role} />;
  if (user.role === 'admin' && section === 'users') return <AdminUsers />;
  if (section === 'profile' || section === 'change-password') return <ProfilePage />;
  if (section === 'assignments' && detail) return <AssignmentDetailPage />;
  if (validRecordTypes.includes(section)) return <RecordsPage type={section} />;

  return <NotFoundPage />;
}
