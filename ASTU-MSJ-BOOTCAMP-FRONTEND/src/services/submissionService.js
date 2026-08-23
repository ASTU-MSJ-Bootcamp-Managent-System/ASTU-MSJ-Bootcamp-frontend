import { api } from './api';

const SUBMISSIONS_STORAGE_KEY = 'aktu_bootcamp_submissions_data';

export const SUBMISSION_STATUS_CONFIG = {
  'Not Submitted': { label: 'Not Submitted', symbol: '🟠', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  Submitted: { label: 'Submitted', symbol: '🔵', color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Under Review': { label: 'Under Review', symbol: '🟣', color: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  Graded: { label: 'Graded', symbol: '🟢', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Resubmission Required': { label: 'Resubmission Required', symbol: '🔴', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  Resubmitted: { label: 'Resubmitted', symbol: '🟡', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-101-1',
    assignmentId: 1,
    assignmentTitle: 'React Todo Application',
    maxScore: 20,
    studentId: 101,
    studentName: 'Ahmed Ali',
    studentEmail: 'ahmed.ali@example.com',
    githubUrl: 'https://github.com/ahmedali/react-todo-app',
    liveDemoUrl: 'https://ahmed-todo.vercel.app',
    notes: 'Implemented all required features: component hierarchy, state hooks, and delete functionality.',
    submittedAt: '2026-08-23T10:32:00.000Z',
    submittedAtFormatted: 'Aug 23, 10:32 AM',
    status: 'Graded',
    score: 17,
    percentage: 85,
    feedback: 'Good component structure. Improve state management and validation for empty todos.',
    gradedAt: '2026-08-23T11:15:00.000Z',
  },
  {
    id: 'sub-102-1',
    assignmentId: 1,
    assignmentTitle: 'React Todo Application',
    maxScore: 20,
    studentId: 102,
    studentName: 'Mohammed Ibrahim',
    studentEmail: 'mohammed.i@example.com',
    githubUrl: 'https://github.com/mohammed/react-todo-app',
    liveDemoUrl: 'https://mohammed-todo.netlify.app',
    notes: 'Added custom drag and drop features as an extra bonus.',
    submittedAt: '2026-08-23T09:14:00.000Z',
    submittedAtFormatted: 'Aug 23, 9:14 AM',
    status: 'Submitted',
    score: null,
    percentage: null,
    feedback: '',
  },
  {
    id: 'sub-103-1',
    assignmentId: 1,
    assignmentTitle: 'React Todo Application',
    maxScore: 20,
    studentId: 103,
    studentName: 'Sara Kasa',
    studentEmail: 'sara.kasa@example.com',
    githubUrl: 'https://github.com/sara/react-todo-app',
    liveDemoUrl: 'https://sara-todo.vercel.app',
    notes: 'Clean Tailwind styling and custom checkbox icons.',
    submittedAt: '2026-08-22T16:20:00.000Z',
    submittedAtFormatted: 'Aug 22, 4:20 PM',
    status: 'Graded',
    score: 19,
    percentage: 95,
    feedback: 'Flawless component structure and exceptional UI styling!',
    gradedAt: '2026-08-22T18:00:00.000Z',
  },
  {
    id: 'sub-104-1',
    assignmentId: 1,
    assignmentTitle: 'React Todo Application',
    maxScore: 20,
    studentId: 104,
    studentName: 'Hana Gemeda',
    studentEmail: 'hana.g@example.com',
    githubUrl: 'https://github.com/hana/react-todo-app',
    liveDemoUrl: '',
    notes: 'Basic version submitted.',
    submittedAt: '2026-08-21T14:10:00.000Z',
    submittedAtFormatted: 'Aug 21, 2:10 PM',
    status: 'Resubmission Required',
    score: null,
    percentage: null,
    feedback: 'Missing state persistence requirement. Please add local storage saving and resubmit.',
    gradedAt: '2026-08-22T09:30:00.000Z',
  },
  {
    id: 'sub-101-2',
    assignmentId: 2,
    assignmentTitle: 'JavaScript Quiz & DOM Calculator',
    maxScore: 20,
    studentId: 101,
    studentName: 'Ahmed Ali',
    studentEmail: 'ahmed.ali@example.com',
    githubUrl: 'https://github.com/ahmedali/js-quiz',
    liveDemoUrl: 'https://ahmed-quiz.vercel.app',
    notes: '5 interactive questions with timer.',
    submittedAt: '2026-08-21T11:00:00.000Z',
    submittedAtFormatted: 'Aug 21, 11:00 AM',
    status: 'Graded',
    score: 18,
    percentage: 90,
    feedback: 'Great event delegation and clear DOM manipulation logic.',
    gradedAt: '2026-08-21T15:00:00.000Z',
  },
];

const getStore = () => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading submissions store:', err);
    return INITIAL_SUBMISSIONS;
  }
};

const setStore = (store) => {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed writing submissions store:', err);
  }
};

export const submissionService = {
  getSubmissionsByAssignment: async (assignmentId) => {
    const store = getStore();
    return store.filter((s) => String(s.assignmentId) === String(assignmentId));
  },

  getAssignmentStats: async (assignmentId) => {
    const subs = await submissionService.getSubmissionsByAssignment(assignmentId);
    let submittedCount = 28;
    let pendingCount = 5;
    let resubmissionCount = 2;

    subs.forEach((s) => {
      if (s.status === 'Submitted' || s.status === 'Under Review') pendingCount++;
      if (s.status === 'Resubmission Required') resubmissionCount++;
    });

    return {
      submittedCount,
      pendingCount,
      resubmissionCount,
    };
  },

  getStudentSubmissions: async (studentId = 101) => {
    const store = getStore();
    return store.filter((s) => String(s.studentId) === String(studentId));
  },

  submitAssignment: async (data) => {
    const { assignmentId, studentId, studentName, studentEmail, githubUrl, liveDemoUrl, notes } = data;

    try {
      await api.post('/submissions', data);
    } catch {
      // Local fallback
    }

    const store = getStore();
    const existingIndex = store.findIndex(
      (s) => String(s.assignmentId) === String(assignmentId) && String(s.studentId) === String(studentId)
    );

    const now = new Date();
    const formattedDate = `Aug ${now.getDate()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const submissionObj = {
      id: existingIndex >= 0 ? store[existingIndex].id : `sub-${studentId}-${assignmentId}-${Date.now()}`,
      assignmentId,
      assignmentTitle: data.assignmentTitle || 'React Todo Application',
      maxScore: data.maxScore || 20,
      studentId,
      studentName: studentName || 'Ahmed Ali',
      studentEmail: studentEmail || 'ahmed.ali@example.com',
      githubUrl,
      liveDemoUrl: liveDemoUrl || '',
      notes: notes || '',
      submittedAt: now.toISOString(),
      submittedAtFormatted: formattedDate,
      status: existingIndex >= 0 && store[existingIndex].status === 'Resubmission Required' ? 'Resubmitted' : 'Submitted',
      score: null,
      percentage: null,
      feedback: '',
    };

    if (existingIndex >= 0) {
      store[existingIndex] = submissionObj;
    } else {
      store.unshift(submissionObj);
    }

    setStore(store);

    return {
      success: true,
      data: submissionObj,
      message: 'Assignment submitted successfully!',
    };
  },

  gradeSubmission: async (submissionId, score, feedback, isResubmissionRequest = false) => {
    const store = getStore();
    const index = store.findIndex((s) => String(s.id) === String(submissionId));

    if (index < 0) {
      return { success: false, message: 'Submission not found.' };
    }

    const maxScore = store[index].maxScore || 20;
    const percentage = score ? Math.round((Number(score) / maxScore) * 100) : null;
    const status = isResubmissionRequest ? 'Resubmission Required' : 'Graded';

    store[index] = {
      ...store[index],
      score: isResubmissionRequest ? null : Number(score),
      percentage: isResubmissionRequest ? null : percentage,
      feedback,
      status,
      gradedAt: new Date().toISOString(),
    };

    setStore(store);

    return {
      success: true,
      data: store[index],
      message: isResubmissionRequest ? 'Resubmission requested from student.' : 'Grade saved successfully!',
    };
  },
};
