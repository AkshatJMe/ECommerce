import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const Newsletter: React.FC = () => {
  return (
    <div className="newsletter">
      <h1>Newsletter</h1>
      <p>Subscribe for daily updates for your favorite products.</p>
      <div className="input-container">
        <input type="email" placeholder="Your email" />
        <button>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Newsletter;
