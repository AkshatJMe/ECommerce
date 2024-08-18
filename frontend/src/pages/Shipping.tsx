import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingInfo } from "../redux/reducer/cartReducer";
import { RootState, server } from "../redux/store";

const Shipping = () => {
  const { cartItems, total } = useSelector(
    (state: RootState) => state.cartReducer
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(saveShippingInfo(shippingInfo));

    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/create`,
        {
          amount: total,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/checkout", {
        state: data.clientSecret,
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (cartItems.length <= 0) return navigate("/cart");
  }, [cartItems]);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Shipping Address
        </h1>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <input
              required
              type="text"
              placeholder="Address"
              name="address"
              value={shippingInfo.address}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <input
              required
              type="text"
              placeholder="City"
              name="city"
              value={shippingInfo.city}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <input
              required
              type="text"
              placeholder="State"
              name="state"
              value={shippingInfo.state}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <select
              name="country"
              required
              value={shippingInfo.country}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Choose Country</option>
              <option value="india">India</option>
              {/* Add more countries as needed */}
            </select>
          </div>

          <div>
            <input
              required
              type="number"
              placeholder="Pin Code"
              name="pinCode"
              value={shippingInfo.pinCode}
              onChange={changeHandler}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
