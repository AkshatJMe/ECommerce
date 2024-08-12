import React from "react";
import CategoryItem from "./core/CategoryItem.tsx";

export const categories = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1701318227064-549c801e4cc4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fGNlbGVicmF0aW9ufGVufDB8fDB8fHww",
    title: "SHIRT STYLE!",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1545315003-c5ad6226c272?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNlbGVicmF0ZSUyMGZvciUyMGVjY29tbWVyY2V8ZW58MHx8MHx8fDA%3D",
    title: "CELEBRATION",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1618333453296-9e35280fd6b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGVjb21tZXJjZXxlbnwwfHwwfHx8MA%3D%3D",
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
