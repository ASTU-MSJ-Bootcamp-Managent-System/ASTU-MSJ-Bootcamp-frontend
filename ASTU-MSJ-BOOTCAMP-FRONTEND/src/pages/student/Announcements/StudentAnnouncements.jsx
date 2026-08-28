import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAnnouncements, toggleReadStatus } from '../../../services/announcementService';

export default function StudentAnnouncements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const studentRole = user?.role || 'Student';
  const studentBatch = user?.batch || 'Bootcamp 2026 Cohort A';

  useEffect(() => {
    const fetchStudentNotifications = async () => {
      setLoading(true);
      try {
        const data = await getAnnouncements(studentRole, studentBatch);
        setItems(data || []);
      } catch (err) {
        console.error('Error loading student announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentNotifications();
  }, [studentRole, studentBatch]);

  const handleToggleRead = async (id) => {
    await toggleReadStatus(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'assignment':
        return '📝';
      case 'deadline':
        return '⏰';
      case 'grade':
        return '🎓';
      case 'important':
        return '⚠️';
      case 'general':
      default:
        return '📢';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'assignment':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deadline':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'grade':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'important':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'general':
      default:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.content?.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === 'All' || item.category?.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Notifications & Announcements
            </h1>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-sm text-indigo-200 mt-1">
            Stay updated with your cohort alerts, assignment notices, deadline reminders, and posted grades.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs text-indigo-100">
          <span className="font-semibold block">Cohort: {studentBatch}</span>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'All', label: 'All Updates', icon: '🌐' },
              { id: 'General', label: 'Announcements', icon: '📢' },
              { id: 'Assignment', label: 'Assignments', icon: '📝' },
              { id: 'Deadline', label: 'Deadlines', icon: '⏰' },
              { id: 'Grade', label: 'Grades', icon: '🎓' },
              { id: 'Important', label: 'Important', icon: '⚠️' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Notifications Stream */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Loading notifications...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <span className="text-4xl block">🔕</span>
          <h3 className="text-base font-bold text-slate-700">No notifications found</h3>
          <p className="text-xs text-slate-400">You are all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 transition shadow-sm relative overflow-hidden ${
                !item.isRead
                  ? 'border-indigo-200 bg-indigo-50/20 ring-1 ring-indigo-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {!item.isRead && (
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-600" />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(item.category)}`}>
                        {item.category || 'General'}
                      </span>
                      {!item.isRead && (
                        <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{item.content}</p>

                    <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 font-medium">
                      <span>👤 {item.author || 'Bootcamp Team'}</span>
                      <span>•</span>
                      <span>📅 {item.date || item.publishDate}</span>
                      {item.batch && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">🏷️ {item.batch}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleRead(item.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap shrink-0 ${
                    item.isRead
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  {item.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
