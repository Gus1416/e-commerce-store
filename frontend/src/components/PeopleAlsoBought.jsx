import toast from 'react-hot-toast';
import axios from '../lib/axios';
import React, { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner';
import ProductCard from './ProductCard';

const PeopleAlsoBought = () => {

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This could be in the store
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get('products/recommended');
        setRecommendations(res.data);

      } catch (error) {
        toast.error(error.response.data.message || 'Failed to fetch recommendations');

      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3> 
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default PeopleAlsoBought