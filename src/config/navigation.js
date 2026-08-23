import {
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Users,
} from 'lucide-react';

export const rolePaths = {
  admin: '/admin/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
};

export const navigation = {
  admin: [
    ['Dashboard', '/admin/dashboard', LayoutDashboard],
    ['Users', '/admin/users', Users],
    ['Batches', '/admin/batches', Users],
    ['Announcements', '/admin/announcements', Bell],
    ['Profile', '/admin/profile', GraduationCap],
  ],
  mentor: [
    ['Dashboard', '/mentor/dashboard', LayoutDashboard],
    ['Students', '/mentor/students', Users],
    ['Attendance', '/mentor/attendance', CalendarCheck],
    ['Progress', '/mentor/progress', CheckCircle2],
    ['Assignments', '/mentor/assignments', ClipboardList],
    ['Submissions', '/mentor/submissions', BookOpen],
    ['Announcements', '/mentor/announcements', Bell],
    ['Profile', '/mentor/profile', GraduationCap],
  ],
  student: [
    ['Dashboard', '/student/dashboard', LayoutDashboard],
    ['Attendance', '/student/attendance', CalendarCheck],
    ['Progress', '/student/progress', CheckCircle2],
    ['Assignments', '/student/assignments', ClipboardList],
    ['Grades', '/student/grades', BookOpen],
    ['Announcements', '/student/announcements', Bell],
    ['Profile', '/student/profile', GraduationCap],
    ['Change password', '/student/change-password', GraduationCap],
  ],
};
