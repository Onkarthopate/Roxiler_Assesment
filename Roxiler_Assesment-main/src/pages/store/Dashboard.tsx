import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Table from '../../components/Table';
import StarRating from '../../components/StarRating';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Rating, Store } from '../../types';

const StoreDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'store_owner') {
      navigate('/login');
      return;
    }

    const fetchStoreData = async () => {
      try {
        setLoading(true);

        // Fetch store details
        const storeResponse = await axios.get(`${API_URL}/stores/owner/store`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStore(storeResponse.data);

        // Fetch ratings
        const ratingsResponse = await axios.get(`${API_URL}/stores/owner/ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatings(ratingsResponse.data);
      } catch (error) {
        console.error('Error fetching store data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [user, token, navigate]);

  const columns = [
    {
      header: 'User',
      accessor: 'user_name',
      sortable: true,
    },
    {
      header: 'Rating',
      accessor: (rating: Rating) => (
        <div className="flex items-center">
          <StarRating value={rating.rating} readonly size="sm" />
          <span className="ml-2">{rating.rating}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Date',
      accessor: (rating: Rating) => {
        const date = new Date(rating.created_at || '');
        return date.toLocaleDateString();
      },
      sortable: true,
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">No store found for this account.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{store.name} Dashboard</h1>
        <p className="text-gray-600">{store.address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="mt-1 flex items-center">
                {(() => {
                  const avg = Number(store.average_rating);
                  const isValid = !isNaN(avg);
                  return (
                    <>
                      <span className="text-3xl font-semibold text-gray-900 mr-2">
                        {isValid ? avg.toFixed(1) : '0.0'}
                      </span>
                      <StarRating value={isValid ? avg : 0} readonly />
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </Card>
      </div>


      <Card title="Customer Ratings">
        {ratings.length > 0 ? (
          <Table
            columns={columns}
            data={ratings}
            keyExtractor={(rating) => rating.id.toString()}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600">No ratings received yet.</p>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default StoreDashboard;
