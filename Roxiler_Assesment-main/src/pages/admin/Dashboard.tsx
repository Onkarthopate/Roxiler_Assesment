import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Star, BarChart3 } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { DashboardStats } from '../../types';

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user, token, navigate]);

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '...' : value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of the system data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="Total Stores" 
          value={stats.totalStores} 
          icon={<Store size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Total Ratings" 
          value={stats.totalRatings} 
          icon={<Star size={24} />} 
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <div className="h-64 flex items-center justify-center">
            <BarChart3 size={48} className="text-gray-300" />
            <p className="ml-4 text-gray-500">Activity chart will be displayed here</p>
          </div>
        </Card>
        
        <Card title="Quick Actions">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/admin/stores/new')}
              className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-left flex items-center transition-colors"
            >
              <Store size={20} className="mr-2" />
              Add New Store
            </button>
            
            <button 
              onClick={() => navigate('/admin/users/new')}
              className="w-full py-2 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-left flex items-center transition-colors"
            >
              <Users size={20} className="mr-2" />
              Add New User
            </button>
            
            <button 
              onClick={() => navigate('/admin/users')}
              className="w-full py-2 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-left flex items-center transition-colors"
            >
              <Users size={20} className="mr-2" />
              Manage Users
            </button>
            
            <button 
              onClick={() => navigate('/admin/stores')}
              className="w-full py-2 px-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-md text-left flex items-center transition-colors"
            >
              <Store size={20} className="mr-2" />
              Manage Stores
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;