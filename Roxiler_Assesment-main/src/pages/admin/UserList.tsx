import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Pencil, Trash } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { User } from '../../types';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<{ name?: string; email?: string; role?: string }>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filter,
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, token, navigate, filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: Record<string, string> = {};

    if (searchTerm.includes(':')) {
      const parts = searchTerm.split(':');
      if (parts.length === 2) {
        const [field, value] = parts;
        if (['name', 'email', 'role'].includes(field.trim().toLowerCase())) {
          filters[field.trim().toLowerCase()] = value.trim();
        }
      }
    } else if (searchTerm) {
      filters.name = searchTerm;
      filters.email = searchTerm;
      filters.role = searchTerm;
    }

    setFilter(filters);
  };

  const validateUserForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newUser.name) newErrors.name = 'Name is required';
    if (!newUser.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!newUser.password && !selectedUser) newErrors.password = 'Password is required';
    if (!newUser.address) newErrors.address = 'Address is required';
    if (!newUser.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUsers = async () => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(response.data);
  };

  const handleAddUser = async () => {
    if (!validateUserForm()) return;

    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_URL}/admin/create-user`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User added successfully');
      fetchUsers();
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: '' });
      setErrors({});
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add user';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      address: user.address || '',
      role: user.role,
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !validateUserForm()) return;
    try {
      setIsSubmitting(true);
      await axios.put(
        `${API_URL}/users/${selectedUser.id}`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User updated successfully');
      fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', sortable: true, filterable: true },
    { header: 'Email', accessor: 'email', sortable: true, filterable: true },
    { header: 'Role', accessor: 'role', sortable: true, filterable: true },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditClick(user)}
            className="text-green-600 hover:text-green-800"
            title="Edit User"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-red-800"
            title="Delete User"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center mt-4 sm:mt-0">
          <PlusCircle size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users or use format 'field:value'"
              className="block w-full pl-10 pr-3 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </Card>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={users}
          keyExtractor={(user) => user.id.toString()}
        />
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewUser({ name: '', email: '', password: '', address: '', role: '' });
          setErrors({});
        }}
        title="Add New User"
      >
        <UserForm
          newUser={newUser}
          setNewUser={setNewUser}
          errors={errors}
          onCancel={() => setIsAddModalOpen(false)}
          onSubmit={handleAddUser}
          isSubmitting={isSubmitting}
          isEdit={false}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        <UserForm
          newUser={newUser}
          setNewUser={setNewUser}
          errors={errors}
          onCancel={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateUser}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </Modal>
    </Layout>
  );
};

const UserForm = ({ newUser, setNewUser, errors, onCancel, onSubmit, isSubmitting, isEdit }: any) => (
  <div className="space-y-4">
    <Input label="User Name" name="name" value={newUser.name} onChange={(e) => setNewUser((prev: any) => ({ ...prev, name: e.target.value }))} error={errors.name} />
    <Input label="Email" name="email" type="email" value={newUser.email} onChange={(e) => setNewUser((prev: any) => ({ ...prev, email: e.target.value }))} error={errors.email} />
    {!isEdit && <Input label="Password" name="password" type="password" value={newUser.password} onChange={(e) => setNewUser((prev: any) => ({ ...prev, password: e.target.value }))} error={errors.password} />}
    <Input label="Address" name="address" value={newUser.address} onChange={(e) => setNewUser((prev: any) => ({ ...prev, address: e.target.value }))} error={errors.address} />
    <Input label="Role" name="role" value={newUser.role} onChange={(e) => setNewUser((prev: any) => ({ ...prev, role: e.target.value }))} error={errors.role} />
    <div className="flex justify-end space-x-3 mt-6">
      <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>{isEdit ? 'Update' : 'Add'} User</Button>
    </div>
  </div>
);

export default UserList;
