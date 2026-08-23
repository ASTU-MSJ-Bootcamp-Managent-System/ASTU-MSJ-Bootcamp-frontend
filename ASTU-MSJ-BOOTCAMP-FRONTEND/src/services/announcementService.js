import { api } from './api';

const ANNOUNCEMENTS_STORAGE_KEY = 'aktu_bootcamp_announcements_data';

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: '⚡ React Todo App Assignment Posted',
    category: 'Assignment',
    content: 'The React Todo Application mini-project has been published. Due date is Aug 25 at 11:59 PM. Please review instructions carefully.',
    author: 'Mentor Team',
    date: 'Aug 23, 2026',
    timeAgo: '2 hours ago',
  },
  {
    id: 2,
    title: '📢 Bootcamp Live Mentorship Session Tomorrow',
    category: 'Bootcamp',
    content: 'Join us tomorrow at 10:00 AM for live code review and state management Q&A session.',
    author: 'Lead Instructor',
    date: 'Aug 22, 2026',
    timeAgo: '1 day ago',
  },
  {
    id: 3,
    title: '🚀 Node.js Backend Module Commencing Next Week',
    category: 'Curriculum',
    content: 'Get ready for Express.js APIs and MongoDB integration starting Monday.',
    author: 'Curriculum Team',
    date: 'Aug 20, 2026',
    timeAgo: '3 days ago',
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

export const announcementService = {
  getAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      if (response.data && Array.isArray(response.data)) return response.data;
    } catch {
      // Local fallback
    }
    return getStore();
  },

  createAnnouncement: async (announcementData) => {
    const store = getStore();
    const newId = store.length ? Math.max(...store.map((a) => a.id)) + 1 : 1;
    const newAnnouncement = {
      id: newId,
      ...announcementData,
      date: 'Aug 23, 2026',
      timeAgo: 'Just now',
    };
    store.unshift(newAnnouncement);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(store));
    return { success: true, data: newAnnouncement };
  },
};
