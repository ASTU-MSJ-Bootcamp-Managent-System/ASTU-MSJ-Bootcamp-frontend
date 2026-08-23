export const recordsData = {
  users: {
    title: 'Users',
    heads: ['Name', 'Email', 'Role', 'Status'],
    rows: [
      ['Marta Bekele', 'marta@astu.edu.et', 'Student', 'Active'],
      ['Abel Tesfaye', 'abel@astu.edu.et', 'Mentor', 'Active'],
      ['Selam Desta', 'selam@astu.edu.et', 'Admin', 'Active'],
    ],
  },
  batches: {
    title: 'Batches',
    heads: ['Batch', 'Mentor', 'Students', 'Status'],
    rows: [
      ['Web Development A', 'Abel Tesfaye', '24', 'Active'],
      ['Full-stack B', 'Meron Tadesse', '28', 'Active'],
    ],
  },
  students: {
    title: 'Assigned students',
    heads: ['Student', 'Attendance', 'Progress', 'Status'],
    rows: [
      ['Marta Bekele', '92%', 'Completed React', 'On track'],
      ['Yonas Ali', '78%', 'In Progress', 'Needs attention'],
      ['Sara Mohammed', '95%', 'Completed React', 'On track'],
    ],
  },
  attendance: {
    title: 'Attendance',
    heads: ['Student', 'Date', 'Status', 'Percentage'],
    rows: [
      ['Marta Bekele', 'Aug 20, 2026', 'Present', '92%'],
      ['Yonas Ali', 'Aug 20, 2026', 'Late', '78%'],
      ['Sara Mohammed', 'Aug 20, 2026', 'Present', '95%'],
    ],
  },
  progress: {
    title: 'Progress',
    heads: ['Topic', 'Status', 'Note'],
    rows: [
      ['HTML/CSS', 'Completed', 'Strong layout fundamentals'],
      ['JavaScript', 'Completed', 'Ready for advanced concepts'],
      ['React', 'In Progress', 'Finish state management practice'],
      ['Node.js', 'Not Started', 'Starts next week'],
    ],
  },
  assignments: {
    title: 'Assignments',
    heads: ['Assignment', 'Deadline', 'Max score', 'Status'],
    rows: [
      ['React Task Manager', 'Aug 29, 2026', '100', 'Submitted'],
      ['REST API Integration', 'Sep 05, 2026', '100', 'Open'],
    ],
  },
  submissions: {
    title: 'Submissions',
    heads: ['Student', 'Assignment', 'Submitted', 'Status'],
    rows: [
      ['Marta Bekele', 'React Task Manager', 'Aug 20', 'Needs review'],
      ['Yonas Ali', 'React Task Manager', 'Aug 21', 'Needs review'],
    ],
  },
  grades: {
    title: 'Grades',
    heads: ['Assignment', 'Score', 'Feedback'],
    rows: [
      ['HTML Portfolio', '88 / 100', 'Clean, responsive work.'],
      ['JavaScript Quiz', '80 / 100', 'Review array methods.'],
    ],
  },
  announcements: {
    title: 'Announcements',
    heads: ['Title', 'Audience', 'Published', 'Status'],
    rows: [
      ['React workshop schedule', 'Web Development A', 'Aug 19, 2026', 'Published'],
      ['Project submission reminder', 'All students', 'Aug 18, 2026', 'Published'],
    ],
  },
};

export const validRecordTypes = Object.keys(recordsData);
