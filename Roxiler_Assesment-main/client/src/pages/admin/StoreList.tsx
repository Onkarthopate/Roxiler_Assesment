import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, Search } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Store } from '../../types';
import StarRating from '../../components/StarRating';
import { toast } from 'react-hot-toast';

const StoreList: React.FC = () => {
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<{
    name?: string;
    email?: string;
    address?: string;
  }>({});

  // Add Store Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/admin/stores`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filter,
        });
        setStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to fetch stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [currentUser, token, navigate, filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: Record<string, string> = {};
    
    if (searchTerm.includes(':')) {
      const parts = searchTerm.split(':');
      if (parts.length === 2) {
        const [field, value] = parts;
        if (['name', 'email', 'address'].includes(field.trim().toLowerCase())) {
          filters[field.trim().toLowerCase()] = value.trim();
        }
      }
    } else if (searchTerm) {
      filters.name = searchTerm;
      filters.email = searchTerm;
      filters.address = searchTerm;
    }
    
    setFilter(filters);
  };

  const handleViewStore = (storeId: number) => {
    navigate(`/admin/stores/${storeId}`);
  };

  const validateStoreForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newStore.name) {
      newErrors.name = 'Name is required';
    } else if (newStore.name.length < 20 || newStore.name.length > 60) {
      newErrors.name = 'Name must be between 20 and 60 characters';
    }

    if (!newStore.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStore.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!newStore.address) {
      newErrors.address = 'Address is required';
    } else if (newStore.address.length > 400) {
      newErrors.address = 'Address cannot exceed 400 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStore = async () => {
    if (!validateStoreForm()) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_URL}/admin/stores`,
        newStore,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStores(prev => [...prev, response.data]);
      setIsAddModalOpen(false);
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      toast.success('Store added successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add store';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
      filterable: true,
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: true,
      filterable: true,
    },
    {
      header: 'Rating',
      accessor: (store: Store) => {
        const avgRating = Number(store.average_rating); // Forcefully convert to number
    
        return (
          <div className="flex items-center">
            <StarRating value={isNaN(avgRating) ? 0 : avgRating} readonly size="sm" />
            <span className="ml-2 text-gray-600">
              {!isNaN(avgRating) ? avgRating.toFixed(1) : 'No ratings'}
            </span>
          </div>
        );
      },
      sortable: true,
    },    
    {
      header: 'Actions',
      accessor: (store: Store) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewStore(store.id)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Store"
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600">Manage all stores in the system</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center mt-4 sm:mt-0"
        >
          <PlusCircle size={16} className="mr-2" />
          Add Store
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
              placeholder="Search stores or use format 'field:value' (e.g., name:grocery)"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading stores...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={stores}
          keyExtractor={(store) => store.id.toString()}
        />
      )}

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewStore({ name: '', email: '', address: '', owner_id: '' });
          setErrors({});
        }}
        title="Add New Store"
      >
        <div className="space-y-4">
          <Input
            label="Store Name"
            name="name"
            value={newStore.name}
            onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            placeholder="Enter store name (20-60 characters)"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={newStore.email}
            onChange={(e) => setNewStore(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            placeholder="Enter store email"
          />

          <Input
            label="Address"
            name="address"
            value={newStore.address}
            onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
            error={errors.address}
            placeholder="Enter store address (max 400 characters)"
          />

          <Input
            label="Store Owner ID (Optional)"
            name="owner_id"
            type="number"
            value={newStore.owner_id}
            onChange={(e) => setNewStore(prev => ({ ...prev, owner_id: e.target.value }))}
            placeholder="Enter store owner's ID if applicable"
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewStore({ name: '', email: '', address: '', owner_id: '' });
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddStore}
              isLoading={isSubmitting}
            >
              Add Store
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default StoreList;