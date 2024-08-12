import { NavLink } from "react-router-dom";
import Carousel from "./Carousel";

const categories = [
  "Electronics",
  "Mobiles",
  "Laptops",
  "Books",
  "Fashion",
  "Appliances",
  "Furniture",
  "Home Decor",
  "Grocery",
  "Beauty",
  "Toys",
  "Fitness",
];

const Hero = () => {
  return (
    <div className="hero">
      <aside>
        <h1>Categories</h1>
        <ul>
          {categories.map((i) => (
            <a key={i}>
              <NavLink to={`/search?category=${i.toLowerCase()}`}>{i}</NavLink>
            </a>
          ))}
        </ul>
      </aside>
      <Carousel />
    </div>
  );
};

export default Hero;
