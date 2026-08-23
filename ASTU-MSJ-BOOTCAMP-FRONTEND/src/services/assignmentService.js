import { api } from './api';

const ASSIGNMENTS_STORAGE_KEY = 'aktu_bootcamp_assignments_data';

const INITIAL_ASSIGNMENTS = [
  {
    id: 1,
    title: 'React Todo Application',
    batch: 'Batch A',
    description: 'Build a full-featured Todo application using React components, local state management, and clean modular styling.',
    instructions: '1. Use React components for list items and forms\n2. Implement add, toggle completion, and delete todo features\n3. Manage state locally using useState and useEffect\n4. Push code to GitHub repository and deploy live demo',
    deadline: '2026-08-25T23:59',
    deadlineFormatted: 'Aug 25, 2026 11:59 PM',
    maxScore: 20,
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'JavaScript Quiz & DOM Calculator',
    batch: 'Batch A',
    description: 'Interactive JavaScript quiz application with dynamic DOM manipulation, score tracking, and custom event listeners.',
    instructions: '1. Build at least 5 multiple choice questions\n2. Calculate score dynamically\n3. Handle edge cases with validation',
    deadline: '2026-08-27T23:59',
    deadlineFormatted: 'Aug 27, 2026 11:59 PM',
    maxScore: 20,
    createdAt: '2026-08-20T09:00:00.000Z',
  },
  {
    id: 3,
    title: 'Node.js REST API Server',
    batch: 'Batch A',
    description: 'Build a RESTful API server using Express.js with JSON endpoints for student resource management.',
    instructions: '1. Implement GET, POST, PUT, DELETE routes\n2. Use middleware for logging and validation\n3. Include Postman collection or documentation',
    deadline: '2026-08-28T23:59',
    deadlineFormatted: 'Aug 28, 2026 11:59 PM',
    maxScore: 25,
    createdAt: '2026-08-22T14:30:00.000Z',
  },
];

const getStore = () => {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
      return INITIAL_ASSIGNMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading assignments store:', err);
    return INITIAL_ASSIGNMENTS;
  }
};

const setStore = (store) => {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed writing assignments store:', err);
  }
};

export const assignmentService = {
  getAssignments: async (batch = 'Batch A') => {
    try {
      const response = await api.get('/assignments', { params: { batch } });
      if (response.data && Array.isArray(response.data)) return response.data;
    } catch {
      // Local fallback
    }

    const store = getStore();
    return store.filter((a) => !batch || a.batch.toLowerCase() === batch.toLowerCase());
  },

  getAssignmentById: async (id) => {
    const store = getStore();
    return store.find((a) => String(a.id) === String(id)) || store[0];
  },

  createAssignment: async (assignmentData) => {
    try {
      const res = await api.post('/assignments', assignmentData);
      if (res.data) return res.data;
    } catch {
      // Local fallback
    }

    const store = getStore();
    const newId = store.length ? Math.max(...store.map((a) => a.id)) + 1 : 1;
    const newAssignment = {
      id: newId,
      ...assignmentData,
      createdAt: new Date().toISOString(),
      deadlineFormatted: assignmentData.deadline
        ? new Date(assignmentData.deadline).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'Aug 25, 2026 11:59 PM',
    };

    store.unshift(newAssignment);
    setStore(store);

    return {
      success: true,
      data: newAssignment,
      message: 'Assignment created successfully.',
    };
  },
};
