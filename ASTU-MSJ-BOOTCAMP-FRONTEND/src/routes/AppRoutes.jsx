import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import Users from '../pages/admin/Users/Users';
import Login from '../pages/auth/Login/Login';
import Unauthorized from '../pages/public/Unauthorized';
import MentorAttendance from '../pages/mentor/Attendance/MentorAttendance';
import StudentAttendance from '../pages/student/Attendance/StudentAttendance';
import MentorProgress from '../pages/mentor/Progress/MentorProgress';
import StudentProgress from '../pages/student/Progress/StudentProgress';
import MentorAssignments from '../pages/mentor/Assignments/MentorAssignments';
import StudentAssignments from '../pages/student/Assignments/StudentAssignments';
import StudentDashboard from '../pages/student/Dashboard/StudentDashboard';
import MentorDashboard from '../pages/mentor/Dashboard/MentorDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated Routes wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route
            path="/admin/users"
            element={
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            }
          />
        </Route>

        {/* Mentor Workspace Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin', 'Mentor']} />}>
          <Route
            path="/mentor/dashboard"
            element={
              <DashboardLayout>
                <MentorDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/mentor/attendance"
            element={
              <DashboardLayout>
                <MentorAttendance />
              </DashboardLayout>
            }
          />
          <Route
            path="/mentor/progress"
            element={
              <DashboardLayout>
                <MentorProgress />
              </DashboardLayout>
            }
          />
          <Route
            path="/mentor/assignments"
            element={
              <DashboardLayout>
                <MentorAssignments />
              </DashboardLayout>
            }
          />
        </Route>

        {/* Student Academic Journey Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin', 'Mentor', 'Student']} />}>
          <Route
            path="/student/dashboard"
            element={
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <DashboardLayout>
                <StudentAttendance />
              </DashboardLayout>
            }
          />
          <Route
            path="/student/progress"
            element={
              <DashboardLayout>
                <StudentProgress />
              </DashboardLayout>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <DashboardLayout>
                <StudentAssignments />
              </DashboardLayout>
            }
          />
        </Route>
      </Route>

      {/* Default Fallbacks */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}
