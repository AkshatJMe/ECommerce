import React from "react";

interface CategoryItemProps {
  item: {
    img: string;
    title: string;
    id: number;
  };
}

const CategoryItem: React.FC<CategoryItemProps> = ({ item }) => {
  return (
    <div className="category-item">
      <img src={item.img} alt={item.title} className="category-item__image" />
      <div className="category-item__overlay">
        <h1 className="category-item__title">{item.title}</h1>
        <button className="category-item__button">SHOP NOW</button>
      </div>
    </div>
  );
};

export default CategoryItem;
