import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../services/announcementService';
import { getBatches } from '../../../services/batchService';
import AnnouncementModal from './components/AnnouncementModal';
import AnnouncementDeleteModal from './components/AnnouncementDeleteModal';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [annRes, batchRes] = await Promise.allSettled([
          getAnnouncements(),
          getBatches(),
        ]);

        if (annRes.status === 'fulfilled') {
          setAnnouncements(annRes.value || []);
        }
        if (batchRes.status === 'fulfilled') {
          const bList = Array.isArray(batchRes.value) ? batchRes.value : batchRes.value?.data || [];
          setBatches(bList);
        }
      } catch (err) {
        console.error('Error loading announcement data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = async (formData) => {
    try {
      const authorName = user?.name || (user?.role === 'Admin' ? 'Admin Team' : 'Mentor Team');
      const payload = {
        ...formData,
        author: authorName,
      };
      const res = await createAnnouncement(payload);
      if (res?.data) {
        setAnnouncements((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Create announcement error:', err);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingAnnouncement) return;
    try {
      await updateAnnouncement(editingAnnouncement.id, formData);
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === editingAnnouncement.id ? { ...item, ...formData } : item))
      );
    } catch (err) {
      console.error('Update announcement error:', err);
    } finally {
      setEditingAnnouncement(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnnouncement) return;
    try {
      await deleteAnnouncement(deletingAnnouncement.id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== deletingAnnouncement.id));
    } catch (err) {
      console.error('Delete announcement error:', err);
    } finally {
      setDeletingAnnouncement(null);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.content?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || item.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesAudience =
      audienceFilter === 'All' || item.targetAudience?.toLowerCase() === audienceFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesAudience;
  });

  const getCategoryBadge = (category) => {
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Announcements & Notifications Publishing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast announcements, assignment alerts, deadline reminders, and updates to specific cohorts or students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Publish Announcement
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Category:</label>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-700"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">📢 General</option>
              <option value="Assignment">📝 Assignment</option>
              <option value="Deadline">⏰ Deadline</option>
              <option value="Grade">🎓 Grade</option>
              <option value="Important">⚠️ Important</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Audience:</label>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-700"
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
            >
              <option value="All">All Audiences</option>
              <option value="Students">Students</option>
              <option value="Mentors">Mentors</option>
              <option value="Specific Batch">Specific Batch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Loading announcements...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-slate-600 font-semibold">No announcements found</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or create a new announcement.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Title & Content</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Audience & Batch</th>
                  <th className="py-3.5 px-5">Publish Date</th>
                  <th className="py-3.5 px-5">Author</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAnnouncements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">
                        {item.content}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadge(item.category)}`}>
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600">
                      <div className="font-medium text-slate-700">{item.targetAudience || 'All'}</div>
                      {item.batch && (
                        <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                          🏷️ {item.batch}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 whitespace-nowrap">
                      {item.publishDate || item.date}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 font-medium">
                      {item.author || 'Admin Team'}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingAnnouncement(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Announcement"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingAnnouncement(item)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Announcement"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnnouncementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreate}
        availableBatches={batches}
      />

      {/* Edit Modal */}
      <AnnouncementModal
        isOpen={!!editingAnnouncement}
        announcement={editingAnnouncement}
        onClose={() => setEditingAnnouncement(null)}
        onSubmit={handleUpdate}
        availableBatches={batches}
      />

      {/* Delete Modal */}
      <AnnouncementDeleteModal
        isOpen={!!deletingAnnouncement}
        announcement={deletingAnnouncement}
        onClose={() => setDeletingAnnouncement(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
