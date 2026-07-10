import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../stores/cartStore';
import { Link } from 'react-router-dom';

export const CartIcon = () => {
  const count = useCartStore((state) => state.getItemCount());

  return (
    <Link to="/cart" className="relative">
      <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
};