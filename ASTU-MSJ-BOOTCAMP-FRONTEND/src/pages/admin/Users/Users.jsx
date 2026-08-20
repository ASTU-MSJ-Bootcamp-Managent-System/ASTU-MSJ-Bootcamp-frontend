import React, { useEffect, useState } from 'react';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import UserModal from './components/UserModal';
import DeleteModal from './components/DeleteModal';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/userService';

const initialSampleUsers = [
  { id: 1, name: 'Ahmed', email: 'ahmed@example.com', role: 'Student' },
  { id: 2, name: 'Sara', email: 'sara@example.com', role: 'Mentor' },
  { id: 3, name: 'Ali', email: 'ali@example.com', role: 'Student' },
];

const Users = () => {
  const [users, setUsers] = useState(initialSampleUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getUsers();
        const apiUsers = Array.isArray(res) ? res : res?.users || res?.data;
        if (apiUsers && apiUsers.length > 0) {
          setUsers(apiUsers);
        }
      } catch (err) {
        console.warn('API unavailable, using initial state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users by search term and role filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      u.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
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
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h1>
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
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
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
