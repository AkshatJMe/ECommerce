//@ts-nocheck
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { RootState } from "../redux/store";
import { useProductDetailsQuery } from "../services/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, isError, data } = useProductDetailsQuery(params.id!);
  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");

    dispatch(addToCart(cartItem));
    toast.success("Added to cart");
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Product Details */}
      <main className="max-w-6xl mx-auto p-6 bg-white rounded-lg ">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="m-10 pl-10">
            <img
              //@ts-ignore
              src={data?.product?.photos.map((i) => i.url) || ""}
              alt="Product"
              className="w-60 h-auto object-cover "
            />
          </div>

          {/* Product Information */}
          <div className="flex-1 md:ml-6 m-10">
            <h1 className="text-3xl font-semibold text-gray-800">
              {data?.product?.name}
            </h1>
            <div className="flex items-center mt-2">
              <span className="text-yellow-500 flex items-center">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar className="text-gray-300" />
              </span>
              <span className="ml-2 text-gray-600">(4.0)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-4">
              ₹{data?.product?.price}
            </p>
            <p className="text-gray-600 mt-4">{data?.product?.description}</p>
            <div className="mt-6">
              <button
                onClick={() =>
                  addToCartHandler({
                    productId: data?.product?._id!,
                    name: data?.product?.name!,
                    price: data?.product?.price!,
                    stock: data?.product?.stock!,

                    photo: data?.product?.photos[0].url || "",
                  })
                }
                className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
