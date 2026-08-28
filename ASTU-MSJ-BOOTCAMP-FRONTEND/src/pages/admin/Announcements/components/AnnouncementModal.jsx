import React, { useState, useEffect } from 'react';

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  announcement = null,
  availableBatches = [],
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All',
    batch: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Published',
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        category: announcement.category || 'General',
        targetAudience: announcement.targetAudience || 'All',
        batch: announcement.batch || '',
        publishDate: announcement.publishDate || new Date().toISOString().split('T')[0],
        status: announcement.status || 'Published',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'All',
        batch: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'Published',
      });
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const isEditMode = !!announcement;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Edit Announcement' : 'Publish Announcement'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Announcement Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 📢 Live Q&A Session Tomorrow"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Category / Type
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-700"
              >
                <option value="General">📢 General Announcement</option>
                <option value="Assignment">📝 New Assignment</option>
                <option value="Deadline">⏰ Deadline Reminder</option>
                <option value="Grade">🎓 Grades & Feedback</option>
                <option value="Important">⚠️ Important Update</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-700"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Target Audience
              </label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-700"
              >
                <option value="All">All Users</option>
                <option value="Students">Students Only</option>
                <option value="Mentors">Mentors Only</option>
                <option value="Specific Batch">Specific Batch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Batch (Optional)
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                disabled={formData.targetAudience !== 'Specific Batch' && formData.targetAudience !== 'Students'}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-700 disabled:opacity-50"
              >
                <option value="">All Cohorts / Unspecified</option>
                {availableBatches.map((b) => (
                  <option key={b.id || b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Publish Date
            </label>
            <input
              type="date"
              name="publishDate"
              required
              value={formData.publishDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Content Body
            </label>
            <textarea
              name="content"
              required
              rows={4}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write announcement details, instructions, or notification body..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm transition"
            >
              {isEditMode ? 'Save Changes' : 'Publish Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
