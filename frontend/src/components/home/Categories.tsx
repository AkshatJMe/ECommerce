import React from "react";
import CategoryItem from "./core/CategoryItem.tsx";

export const categories = [
  {
    id: 1,
    img: "/catagory/shirt.jpg",
    title: "SHIRT STYLE!",
  },
  {
    id: 2,
    img: "/catagory/celebration.jpg",
    title: "CELEBRATION",
  },
  {
    id: 3,
    img: "/catagory/jacker.jpg",
    title: "LIGHT JACKETS",
  },
];

const Categories: React.FC = () => {
  return (
    <div className="categories">
      {categories.map((item) => (
        <CategoryItem item={item} key={item.id} />
      ))}
    </div>
  );
};

export default Categories;
