import React from "react";
import { FaEnvelope, FaMapMarkedAlt } from "react-icons/fa";
import {
  FaSquareFacebook,
  FaSquareInstagram,
  FaSquarePhone,
  FaSquarePinterest,
  FaSquareXTwitter,
} from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <div className="container">
      <div className="section social-media">
        <h1>Trend Mart</h1>
        <p>
          Shop with confidence at TrendMart. Enjoy seamless shopping with secure
          checkout, fast shipping, and dedicated customer support. Explore our
          wide range of products, read customer reviews, and take advantage of
          exclusive offers. For inquiries or assistance, contact us at
          realakshatjain@gmail.com
        </p>
        <div className="social-icons">
          <div className="icon facebook">
            <FaSquareFacebook />
          </div>
          <div className="icon instagram">
            <FaSquareInstagram />
          </div>
          <div className="icon twitter">
            <FaSquareXTwitter />
          </div>
          <div className="icon pinterest">
            <FaSquarePinterest />
          </div>
        </div>
      </div>

      <div className="section links">
        <h3>Useful Links</h3>
        <ul>
          <li>Home</li>
          <li>Cart</li>
          <li>Man Fashion</li>
          <li>Woman Fashion</li>
          <li>Accessories</li>
          <li>My Account</li>
          <li>Order Tracking</li>
          <li>Wishlist</li>
          <li>Terms</li>
        </ul>
      </div>

      <div className="section contact">
        <h3>Contact</h3>
        <div className="contact-item">
          <FaMapMarkedAlt className="icon" />
          564, New Delhi, India
        </div>
        <div className="contact-item">
          <FaSquarePhone className="icon" />
          +91 6969696969
        </div>
        <div className="contact-item">
          <FaEnvelope className="icon" /> contact@don't.dev
        </div>
        <img
          src="/common/payment.png"
          alt="Payment Methods"
          className="payment-image"
        />
      </div>
    </div>
  );
};

export default Footer;
