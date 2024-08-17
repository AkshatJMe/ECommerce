import { FaExpandAlt, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CartItem } from "../types/types";
import { transformImage } from "../utils/features";

type ProductsProps = {
  productId: string;
  photos: {
    url: string;
    public_id: string;
  }[];
  name: string;
  price: number;
  stock: number;
  handler: (cartItem: CartItem) => string | undefined;
};

const ProductCard = ({
  productId,
  price,
  name,
  photos,
  stock,
  handler,
}: ProductsProps) => {
  return (
    <div className="flex flex-col items-center justify-between m-8 bg-white hover:scale-110 transition-all duration-300  ease-in gap-3 p-4 mt-10 ml-5 rounded-xl shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] w-80 h-96 hover:shadow-[0px_0px_95px_53px_#00000024]">
      <div>
        <h1 className="text-gray-700 font-semibold text-lg text-left truncate mt-1 w-40">
          {name}
        </h1>
      </div>

      <div className="h-[180px]">
        <img
          src={transformImage(photos?.[0]?.url, 400)}
          alt={name}
          className="h-40 w-40"
        />
      </div>

      <div className="flex justify-between items-center w-full mt-5">
        <p className="text-teal-500 font-semibold">₹{price}</p>

        <div className="flex gap-4">
          <button
            onClick={() =>
              handler({
                productId,
                price,
                name,
                photo: photos[0].url,
                stock,
                quantity: 1,
              })
            }
          >
            <FaPlus />
          </button>

          <Link to={`/product/${productId}`}>
            <FaExpandAlt />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
