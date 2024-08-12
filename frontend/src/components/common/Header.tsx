import React from "react";
import { NavLink } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";

const Header: React.FC = () => {
  return (
    <div className="header">
      <NavLink to="/">
        <div className="logo">
          <span className="logo-text">Trend Mart</span>
        </div>
      </NavLink>

      <div className="search-bar">
        <input
          className="search-input"
          type="email"
          placeholder="Search Products"
        />
        <button className="search-button">
          <FaSearch className="search-icon" />
        </button>
      </div>

      <div className="nav-links">
        <NavLink to="/cart">
          <div className="i-icon">
            <FaShoppingCart className="icon" />
          </div>
        </NavLink>

        {/* <NavLink to="/user">
          <div className="i-icon">
            <FaUserAlt className="icon" />
          </div>
        </NavLink> */}
        <NavLink to="/login">
          <div className="i-icon">
            <IoLogIn className="login-icon" />
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default Header;
