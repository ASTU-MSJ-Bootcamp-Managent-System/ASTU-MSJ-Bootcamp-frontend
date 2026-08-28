import { api } from './api';

const ANNOUNCEMENTS_STORAGE_KEY = 'astu_bootcamp_announcements_data';

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: '⚡ React Todo App Assignment Posted',
    category: 'Assignment',
    targetAudience: 'Students',
    batch: 'Bootcamp 2026 Cohort A',
    content: 'The React Todo Application mini-project has been published. Due date is Aug 29 at 11:59 PM. Please review instructions carefully.',
    author: 'Mentor Team',
    publishDate: '2026-08-27',
    date: 'Aug 27, 2026',
    timeAgo: '2 hours ago',
    status: 'Published',
    isRead: false,
  },
  {
    id: 2,
    title: '⏰ Upcoming Deadline: Node.js REST API Server',
    category: 'Deadline',
    targetAudience: 'All',
    batch: '',
    content: 'Reminder: Node.js Express REST API server submission deadline is approaching on Aug 30. Ensure test cases pass before submission.',
    author: 'Lead Instructor',
    publishDate: '2026-08-26',
    date: 'Aug 26, 2026',
    timeAgo: '1 day ago',
    status: 'Published',
    isRead: false,
  },
  {
    id: 3,
    title: '🎓 Grades & Feedback Published: JavaScript Basics Quiz',
    category: 'Grade',
    targetAudience: 'Students',
    batch: 'Bootcamp 2026 Cohort A',
    content: 'Grades for the JavaScript Async & Promises quiz have been published. Check your assignments tab to view personalized feedback.',
    author: 'Mentor Sara',
    publishDate: '2026-08-25',
    date: 'Aug 25, 2026',
    timeAgo: '2 days ago',
    status: 'Published',
    isRead: true,
  },
  {
    id: 4,
    title: '📢 Bootcamp Live Mentorship Session Tomorrow',
    category: 'General',
    targetAudience: 'All',
    batch: '',
    content: 'Join us tomorrow at 10:00 AM for live code review and state management Q&A session.',
    author: 'Lead Instructor',
    publishDate: '2026-08-24',
    date: 'Aug 24, 2026',
    timeAgo: '3 days ago',
    status: 'Published',
    isRead: true,
  },
  {
    id: 5,
    title: '⚠️ Important Update: Schedule Change for Frontend Office Hours',
    category: 'Important',
    targetAudience: 'All',
    batch: '',
    content: 'Friday office hours have been moved from 2:00 PM to 4:00 PM. Zoom link remains the same.',
    author: 'Admin Team',
    publishDate: '2026-08-23',
    date: 'Aug 23, 2026',
    timeAgo: '4 days ago',
    status: 'Published',
    isRead: false,
  },
];

const getStore = () => {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading announcements store:', err);
    return INITIAL_ANNOUNCEMENTS;
  }
};

const saveStore = (data) => {
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed saving announcements store:', err);
  }
};

export const getAnnouncements = async (userRole = null, userBatch = null) => {
  try {
    const response = await api.get('/announcements');
    if (response.data && Array.isArray(response.data)) {
      return filterByAudience(response.data, userRole, userBatch);
    }
  } catch {
    // API fallback
  }

  const store = getStore();
  return filterByAudience(store, userRole, userBatch);
};

const filterByAudience = (list, role, batch) => {
  if (!role || role?.toLowerCase() === 'admin') return list;

  const normalizedRole = role?.toLowerCase();
  const normalizedBatch = batch?.toLowerCase();

  return list.filter((item) => {
    const audience = item.targetAudience?.toLowerCase() || 'all';

    // Role filtering
    if (audience === 'all') return true;
    if (audience === 'students' && normalizedRole === 'student') return true;
    if (audience === 'mentors' && normalizedRole === 'mentor') return true;

    // Specific Batch filtering
    if (audience === 'specific batch' || item.batch) {
      if (!item.batch) return true;
      if (normalizedBatch && item.batch.toLowerCase() === normalizedBatch) return true;
    }

    return false;
  });
};

export const createAnnouncement = async (announcementData) => {
  const store = getStore();
  const newId = store.length ? Math.max(...store.map((a) => a.id)) + 1 : 1;
  const newAnnouncement = {
    id: newId,
    ...announcementData,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timeAgo: 'Just now',
    status: announcementData.status || 'Published',
    isRead: false,
  };
  store.unshift(newAnnouncement);
  saveStore(store);

  try {
    await api.post('/announcements', newAnnouncement);
  } catch {
    // API fallback
  }

  return { success: true, data: newAnnouncement };
};

export const updateAnnouncement = async (id, announcementData) => {
  const store = getStore();
  const updatedStore = store.map((item) =>
    item.id === id ? { ...item, ...announcementData } : item
  );
  saveStore(updatedStore);

  try {
    await api.put(`/announcements/${id}`, announcementData);
  } catch {
    // API fallback
  }

  return { success: true };
};

export const deleteAnnouncement = async (id) => {
  const store = getStore();
  const updatedStore = store.filter((item) => item.id !== id);
  saveStore(updatedStore);

  try {
    await api.delete(`/announcements/${id}`);
  } catch {
    // API fallback
  }

  return { success: true };
};

export const toggleReadStatus = async (id) => {
  const store = getStore();
  const updatedStore = store.map((item) =>
    item.id === id ? { ...item, isRead: !item.isRead } : item
  );
  saveStore(updatedStore);
  return { success: true };
};

export const announcementService = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleReadStatus,
};

