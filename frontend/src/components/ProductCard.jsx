import { ShoppingCart } from 'lucide-react'
import React from 'react'
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/useCartStore';

const ProductCard = ({ product }) => {

  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
        toast.error('Please login to add products to cart', {id: 'login-error'}); // id is used to prevent duplicate notifications
        return;
    } else {  
        addToCart(product);
    }
  }

  return (
    <div className='flex flex-col relative w-full overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
        <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
            <img className='w-full object-cover' src={product.image} alt={product.name} />
            <div className='absolute inset-0 bg-black bg-opacity-20' />
        </div>
        <div className='mt-4 px-5 pb-5'>
            <h5 className='text-xl font-semibold tracking-tighter text-white'>{product.name}</h5>
            <div className='mt-2 mb-5 flex items-center justify-between'>
                <p>
                    <span className='text-lg font-semibold text-emerald-400'>${product.price}</span>
                </p>
            </div>
            <button
                className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm
                font-medium text-white hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300'
                onClick={handleAddToCart}
            >
                <ShoppingCart size={22} className='mr-2' />
                Add to cart
            </button>
        </div>
    </div>
  )
}

export default ProductCard