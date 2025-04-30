import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import Modal from '../../components/Modal';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Store } from '../../types';
import { toast } from 'react-hot-toast';

const UserStoreList: React.FC = () => {
  const { user, token } = useAuth();
  const [stores, setStores] = useState<(Store & { user_rating?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState<(Store & { user_rating?: number })[]>([]);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      return;
    }

    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/stores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStores(response.data);
        setFilteredStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [user, token]);

  useEffect(() => {
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(lowercaseSearch) ||
          store.address.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchTerm, stores]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openRatingModal = (store: Store) => {
    setSelectedStore(store);
    const userRating = stores.find(s => s.id === store.id)?.user_rating || 0;
    setRatingValue(userRating);
    setIsRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedStore || !ratingValue) return;

    try {
      setSubmittingRating(true);
      await axios.post(
        `${API_URL}/ratings`,
        {
          store_id: selectedStore.id,
          rating: ratingValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setStores(
        stores.map((store) =>
          store.id === selectedStore.id
            ? {
              ...store,
              user_rating: ratingValue,
              // Update average rating (simple approximation)
              average_rating: store.average_rating
                ? (store.average_rating + ratingValue) / 2
                : ratingValue,
            }
            : store
        )
      );

      toast.success('Rating submitted successfully');
      setIsRatingModalOpen(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <p className="text-gray-600">Browse and rate stores</p>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search stores by name or address..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading stores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <Card key={store.id} className="h-full flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {store.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{store.address}</p>

                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      Overall Rating:
                    </span>
                    <StarRating
                      value={Number(store.average_rating) || 0}
                      readonly
                      size="sm"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {!isNaN(Number(store.average_rating))
                        ? Number(store.average_rating).toFixed(1)
                        : 'No ratings'}
                    </span>
                  </div>


                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      Your Rating:
                    </span>
                    {store.user_rating ? (
                      <>
                        <StarRating
                          value={store.user_rating}
                          readonly
                          size="sm"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {store.user_rating}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm italic text-gray-500">
                        Not rated yet
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => openRatingModal(store)}
                  variant={store.user_rating ? 'secondary' : 'primary'}
                  fullWidth
                >
                  {store.user_rating ? 'Update Rating' : 'Rate Store'}
                </Button>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-600">No stores found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={`Rate ${selectedStore?.name || 'Store'}`}
        size="sm"
      >
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">Select your rating (1-5 stars)</p>

          <div className="flex justify-center mb-4">
            <StarRating
              value={ratingValue}
              onChange={setRatingValue}
              size="lg"
            />
          </div>

          <p className="text-lg font-semibold text-gray-900 mb-4">
            {ratingValue} {ratingValue === 1 ? 'Star' : 'Stars'}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setIsRatingModalOpen(false)}
            disabled={submittingRating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitRating}
            isLoading={submittingRating}
            disabled={!ratingValue}
          >
            Submit Rating
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default UserStoreList;