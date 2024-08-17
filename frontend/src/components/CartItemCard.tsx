import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CartItem } from "../types/types";
import { transformImage } from "../utils/features";

type CartItemProps = {
  cartItem: CartItem;
  incrementHandler: (cartItem: CartItem) => void;
  decrementHandler: (cartItem: CartItem) => void;
  removeHandler: (id: string) => void;
};

const CartItemComponent = ({
  cartItem,
  incrementHandler,
  decrementHandler,
  removeHandler,
}: CartItemProps) => {
  const { photo, productId, name, price, quantity } = cartItem;

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-md mb-4">
      <img
        src={transformImage(photo)}
        alt={name}
        className="w-24 h-24 object-cover rounded-md mr-4"
      />
      <article className="flex-1">
        <Link
          to={`/product/${productId}`}
          className="text-lg font-semibold text-teal-600 hover:underline"
        >
          {name}
        </Link>
        <span className="block text-gray-600 text-sm">₹{price}</span>
      </article>

      <div className="flex items-center space-x-2 mx-4">
        <button
          onClick={() => decrementHandler(cartItem)}
          className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          -
        </button>
        <p className="text-lg font-semibold">{quantity}</p>
        <button
          onClick={() => incrementHandler(cartItem)}
          className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600"
        >
          +
        </button>
      </div>

      <button
        onClick={() => removeHandler(productId)}
        className="text-red-600 hover:text-red-800 transition-colors"
      >
        <FaTrash className="text-xl" />
      </button>
    </div>
  );
};

export default CartItemComponent;
