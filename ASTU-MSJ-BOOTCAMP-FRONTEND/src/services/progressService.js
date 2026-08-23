import { api } from './api';

const PROGRESS_STORAGE_KEY = 'aktu_bootcamp_progress_data';

export const TOPICS = [
  { id: 'html-css', name: 'HTML / CSS', category: 'Frontend' },
  { id: 'javascript', name: 'JavaScript', category: 'Frontend' },
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'git-github', name: 'Git / GitHub', category: 'DevTools' },
];

export const PROGRESS_STATUSES = [
  { label: 'Not Started', symbol: '○', color: 'slate', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  { label: 'In Progress', symbol: '◐', color: 'amber', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Completed', symbol: '✓', color: 'emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Needs Improvement', symbol: '⚠', color: 'rose', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
];

const INITIAL_PROGRESS_STORE = {
  101: {
    // Ahmed Ali
    studentId: 101,
    studentName: 'Ahmed Ali',
    batch: 'Batch A',
    overallProgress: 78,
    topics: {
      'html-css': { status: 'Completed', percentage: 100, note: 'Excellence in responsive design & Flexbox/Grid layout.' },
      javascript: { status: 'In Progress', percentage: 85, note: 'Strong understanding of ES6, async/await and promises.' },
      react: { status: 'Needs Improvement', percentage: 55, note: 'Understands components but needs improvement with state management.' },
      nodejs: { status: 'Not Started', percentage: 0, note: 'Scheduled for upcoming module.' },
      'git-github': { status: 'Completed', percentage: 100, note: 'Proficient with branching, pull requests, and merges.' },
    },
  },
  102: {
    studentId: 102,
    studentName: 'Mohammed Ibrahim',
    batch: 'Batch A',
    overallProgress: 65,
    topics: {
      'html-css': { status: 'Completed', percentage: 100, note: 'Great CSS styling.' },
      javascript: { status: 'In Progress', percentage: 70, note: 'Working through DOM manipulation exercises.' },
      react: { status: 'In Progress', percentage: 40, note: 'Started React hooks.' },
      nodejs: { status: 'Not Started', percentage: 0, note: '' },
      'git-github': { status: 'Completed', percentage: 100, note: 'Git fundamentals mastered.' },
    },
  },
  103: {
    studentId: 103,
    studentName: 'Sara Kasa',
    batch: 'Batch A',
    overallProgress: 90,
    topics: {
      'html-css': { status: 'Completed', percentage: 100, note: 'Top marks in UI styling.' },
      javascript: { status: 'Completed', percentage: 100, note: 'Mastered JS fundamentals.' },
      react: { status: 'In Progress', percentage: 85, note: 'Building full stack components.' },
      nodejs: { status: 'In Progress', percentage: 30, note: 'Express API setup started.' },
      'git-github': { status: 'Completed', percentage: 100, note: 'Flawless workflow.' },
    },
  },
  104: {
    studentId: 104,
    studentName: 'Hana Gemeda',
    batch: 'Batch A',
    overallProgress: 82,
    topics: {
      'html-css': { status: 'Completed', percentage: 100, note: 'Solid semantics.' },
      javascript: { status: 'Completed', percentage: 95, note: 'Great logic.' },
      react: { status: 'In Progress', percentage: 75, note: 'Hooks and Context API mastered.' },
      nodejs: { status: 'Not Started', percentage: 0, note: '' },
      'git-github': { status: 'Completed', percentage: 100, note: 'Good repo hygiene.' },
    },
  },
};

const getStore = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(INITIAL_PROGRESS_STORE));
      return INITIAL_PROGRESS_STORE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading progress store:', err);
    return INITIAL_PROGRESS_STORE;
  }
};

const setStore = (store) => {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed writing progress store:', err);
  }
};

const calculateOverallProgress = (topicsMap) => {
  const values = Object.values(topicsMap);
  if (!values.length) return 0;
  const weights = {
    Completed: 100,
    'In Progress': 65,
    'Needs Improvement': 40,
    'Not Started': 0,
  };
  const totalWeight = values.reduce((acc, t) => acc + (weights[t.status] || 0), 0);
  return Math.round(totalWeight / values.length);
};

export const progressService = {
  getTopics: () => TOPICS,
  getStatuses: () => PROGRESS_STATUSES,

  getAllProgress: async (batch = 'Batch A') => {
    try {
      const response = await api.get('/progress', { params: { batch } });
      if (response.data && Array.isArray(response.data)) return response.data;
    } catch {
      // Local storage fallback
    }

    const store = getStore();
    return Object.values(store).filter(
      (p) => !batch || p.batch.toLowerCase() === batch.toLowerCase()
    );
  },

  getStudentProgress: async (studentId = 101) => {
    const store = getStore();
    return store[studentId] || INITIAL_PROGRESS_STORE[101];
  },

  updateTopicProgress: async (studentId, topicId, status, note = '') => {
    try {
      await api.put(`/progress/${studentId}`, { topicId, status, note });
    } catch {
      // Local storage fallback
    }

    const store = getStore();
    if (!store[studentId]) {
      store[studentId] = {
        studentId,
        studentName: 'Ahmed Ali',
        batch: 'Batch A',
        topics: {},
      };
    }

    const currentTopics = store[studentId].topics || {};
    const topicPercentage =
      status === 'Completed' ? 100 : status === 'In Progress' ? 65 : status === 'Needs Improvement' ? 40 : 0;

    currentTopics[topicId] = {
      status,
      percentage: topicPercentage,
      note,
    };

    store[studentId].topics = currentTopics;
    store[studentId].overallProgress = calculateOverallProgress(currentTopics);

    setStore(store);

    return {
      success: true,
      data: store[studentId],
      message: 'Student progress updated successfully.',
    };
  },
};
