import React, { useEffect, useState } from 'react';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import UserModal from './components/UserModal';
import DeleteModal from './components/DeleteModal';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/userService';
import { getBatches } from '../../../services/batchService';

const defaultBatches = [
  { id: 1, name: 'Bootcamp 2026 Cohort A', code: 'ASTU-2026-A' },
  { id: 2, name: 'Bootcamp 2026 Cohort B', code: 'ASTU-2026-B' },
  { id: 3, name: 'Bootcamp 2025 Graduate Cohort', code: 'ASTU-2025-FX' },
];

const initialSampleUsers = [
  { id: 1, name: 'Ahmed', email: 'ahmed@example.com', role: 'Student', batch: 'Bootcamp 2026 Cohort A' },
  { id: 2, name: 'Sara', email: 'sara@example.com', role: 'Mentor', batch: 'Bootcamp 2026 Cohort A' },
  { id: 3, name: 'Ali', email: 'ali@example.com', role: 'Student', batch: 'Bootcamp 2026 Cohort B' },
];

const Users = () => {
  const [users, setUsers] = useState(initialSampleUsers);
  const [batches, setBatches] = useState(defaultBatches);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Fetch users and batches on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, batchRes] = await Promise.allSettled([getUsers(), getBatches()]);

        if (userRes.status === 'fulfilled') {
          const res = userRes.value;
          const apiUsers = Array.isArray(res) ? res : res?.users || res?.data;
          if (apiUsers && apiUsers.length > 0) {
            setUsers(apiUsers);
          }
        }

        if (batchRes.status === 'fulfilled') {
          const res = batchRes.value;
          const apiBatches = Array.isArray(res) ? res : res?.batches || res?.data;
          if (apiBatches && apiBatches.length > 0) {
            setBatches(apiBatches);
          }
        }
      } catch (err) {
        console.warn('API unavailable, using initial state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users by search term, role, and batch
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      u.role?.toLowerCase() === roleFilter.toLowerCase();

    const matchesBatch =
      batchFilter === 'All' ||
      u.batch?.toLowerCase() === batchFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesBatch;
  });

  // Handle Add User
  const handleCreateUser = async (formData) => {
    try {
      const res = await createUser(formData);
      const newUser = res?.data || res?.user || { id: Date.now(), ...formData };
      setUsers((prev) => [newUser, ...prev]);
    } catch (err) {
      console.warn('API create error, updating local state:', err);
      setUsers((prev) => [{ id: Date.now(), ...formData }, ...prev]);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  // Handle Edit User
  const handleUpdateUser = async (formData) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, formData);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
      );
    } catch (err) {
      console.warn('API update error, updating local state:', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
      );
    } finally {
      setEditingUser(null);
    }
  };

  // Handle Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    } catch (err) {
      console.warn('API delete error, updating local state:', err);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage accounts, assign roles, and allocate users to bootcamp batches.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Filter and Search Controls */}
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        batchFilter={batchFilter}
        onBatchFilterChange={setBatchFilter}
        availableBatches={batches}
      />

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Loading users...
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={(user) => setEditingUser(user)}
          onDelete={(user) => setDeletingUser(user)}
        />
      )}

      {/* Add User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUser}
        availableBatches={batches}
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
        availableBatches={batches}
      />

      {/* Delete User Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingUser}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Users;

