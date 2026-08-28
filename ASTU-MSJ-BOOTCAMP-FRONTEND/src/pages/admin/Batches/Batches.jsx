import React, { useEffect, useState } from 'react';
import BatchTable from './components/BatchTable';
import BatchFilters from './components/BatchFilters';
import BatchModal from './components/BatchModal';
import BatchDeleteModal from './components/BatchDeleteModal';
import { getBatches, createBatch, updateBatch, deleteBatch } from '../../../services/batchService';

const initialSampleBatches = [
  {
    id: 1,
    name: 'Bootcamp 2026 Cohort A',
    code: 'ASTU-2026-A',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    status: 'Active',
    studentCount: 42,
    description: 'Fullstack Web Development & Mobile Engineering Track',
  },
  {
    id: 2,
    name: 'Bootcamp 2026 Cohort B',
    code: 'ASTU-2026-B',
    startDate: '2026-07-01',
    endDate: '2026-12-15',
    status: 'Upcoming',
    studentCount: 28,
    description: 'AI & Data Science Track',
  },
  {
    id: 3,
    name: 'Bootcamp 2025 Graduate Cohort',
    code: 'ASTU-2025-FX',
    startDate: '2025-01-10',
    endDate: '2025-11-20',
    status: 'Completed',
    studentCount: 50,
    description: 'Specialized Systems Programming Track',
  },
];

export default function Batches() {
  const [batches, setBatches] = useState(initialSampleBatches);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await getBatches();
        const apiBatches = Array.isArray(res) ? res : res?.batches || res?.data;
        if (apiBatches && apiBatches.length > 0) {
          setBatches(apiBatches);
        }
      } catch (err) {
        console.warn('Batch API unavailable, using sample state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Filter batches by search term and status
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      !search.trim() ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.code?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      b.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Handle Add Batch
  const handleCreateBatch = async (formData) => {
    try {
      const res = await createBatch(formData);
      const newBatch = res?.data || res?.batch || { id: Date.now(), studentCount: 0, ...formData };
      setBatches((prev) => [newBatch, ...prev]);
    } catch (err) {
      console.warn('API create batch error, updating local state:', err);
      setBatches((prev) => [{ id: Date.now(), studentCount: 0, ...formData }, ...prev]);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  // Handle Edit Batch
  const handleUpdateBatch = async (formData) => {
    if (!editingBatch) return;
    try {
      await updateBatch(editingBatch.id, formData);
      setBatches((prev) =>
        prev.map((b) => (b.id === editingBatch.id ? { ...b, ...formData } : b))
      );
    } catch (err) {
      console.warn('API update batch error, updating local state:', err);
      setBatches((prev) =>
        prev.map((b) => (b.id === editingBatch.id ? { ...b, ...formData } : b))
      );
    } finally {
      setEditingBatch(null);
    }
  };

  // Handle Delete Batch
  const handleConfirmDelete = async () => {
    if (!deletingBatch) return;
    try {
      await deleteBatch(deletingBatch.id);
      setBatches((prev) => prev.filter((b) => b.id !== deletingBatch.id));
    } catch (err) {
      console.warn('API delete batch error, updating local state:', err);
      setBatches((prev) => prev.filter((b) => b.id !== deletingBatch.id));
    } finally {
      setDeletingBatch(null);
    }
  };

  const activeCount = batches.filter((b) => b.status === 'Active').length;
  const totalStudents = batches.reduce((acc, b) => acc + (b.studentCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Batch Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize bootcamp cohorts, track schedules, and manage student batch enrollments.
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
          Create Batch
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            {batches.length}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Batches</p>
            <p className="text-lg font-bold text-slate-800">{batches.length} Cohorts</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {activeCount}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Batches</p>
            <p className="text-lg font-bold text-slate-800">{activeCount} Running</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            {totalStudents}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
            <p className="text-lg font-bold text-slate-800">{totalStudents} Total</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <BatchFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Batch Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Loading batches...
        </div>
      ) : (
        <BatchTable
          batches={filteredBatches}
          onEdit={(b) => setEditingBatch(b)}
          onDelete={(b) => setDeletingBatch(b)}
        />
      )}

      {/* Add Batch Modal */}
      <BatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateBatch}
      />

      {/* Edit Batch Modal */}
      <BatchModal
        isOpen={!!editingBatch}
        batch={editingBatch}
        onClose={() => setEditingBatch(null)}
        onSubmit={handleUpdateBatch}
      />

      {/* Delete Confirmation Modal */}
      <BatchDeleteModal
        isOpen={!!deletingBatch}
        batch={deletingBatch}
        onClose={() => setDeletingBatch(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
