import axios from "axios";
import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import CartItemComponent from "../components/CartItemCard";
import { Link } from "react-router-dom";
import {
  addToCart,
  calculatePrice,
  discountApplied,
  removeCartItem,
} from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";
import { CartItem } from "../types/types";
import Footer from "../components/common/Footer";

const Cart: React.FC = () => {
  const { cartItems, subtotal, tax, total, shippingCharges, discount } =
    useSelector((state: RootState) => state.cartReducer);
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(false);

  const incrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity >= cartItem.stock) return;

    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };
  const decrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity <= 1) return;

    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };
  const removeHandler = (productId: string) => {
    dispatch(removeCartItem(productId));
  };
  useEffect(() => {
    const { token: cancelToken, cancel } = axios.CancelToken.source();

    const timeOutID = setTimeout(() => {
      axios
        .get(`${server}/api/v1/payment/discount?coupon=${couponCode}`, {
          cancelToken,
        })
        .then((res) => {
          dispatch(discountApplied(res.data.discount));
          setIsValidCouponCode(true);
          dispatch(calculatePrice());
        })
        .catch(() => {
          dispatch(discountApplied(0));
          setIsValidCouponCode(false);
          dispatch(calculatePrice());
        });
    }, 1000);

    return () => {
      clearTimeout(timeOutID);
      cancel();
      setIsValidCouponCode(false);
    };
  }, [couponCode]);

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems]);
  return (
    <div className="flex w-full flex-col">
      <div className="flex m-12 gap-16 justify-between">
        <main>
          {cartItems.length > 0 ? (
            cartItems.map((i, idx) => (
              <CartItemComponent
                incrementHandler={incrementHandler}
                decrementHandler={decrementHandler}
                removeHandler={removeHandler}
                key={idx}
                cartItem={i}
              />
            ))
          ) : (
            <h1>No Items Added</h1>
          )}
        </main>

        <aside className="bg-white p-6 rounded-lg h-fit shadow-md w-96">
          <div className="mb-8">
            <p className="text-lg text-gray-600 mb-2">
              Subtotal:{" "}
              <span className="font-medium text-gray-800 mb-2">
                ₹{subtotal}
              </span>
            </p>
            <p className="text-lg text-gray-600 mb-2">
              Shipping Charges:{" "}
              <span className="font-medium text-gray-800">
                ₹{shippingCharges}
              </span>
            </p>
            <p className="text-lg text-gray-600 mb-2">
              Tax: <span className="font-medium text-gray-800">₹{tax}</span>
            </p>
            <p className="text-lg text-gray-600 mb-4">
              Discount: <em className="text-red-600"> - ₹{discount}</em>
            </p>
            <p className="text-xl font-bold text-gray-800">Total: ₹{total}</p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {couponCode && (
            <div className="mb-4">
              {isValidCouponCode ? (
                <span className="text-green-600">
                  ₹{discount} off using the{" "}
                  <code className="bg-gray-100 px-1 rounded">{couponCode}</code>
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  Invalid Coupon <VscError className="ml-1 text-lg" />
                </span>
              )}
            </div>
          )}

          {cartItems.length > 0 && (
            <Link
              to="/shipping"
              className="block text-center bg-teal-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-teal-600 transition-colors"
            >
              Checkout
            </Link>
          )}
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
