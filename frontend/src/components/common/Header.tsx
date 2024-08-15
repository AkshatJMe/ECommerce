import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";
import { User } from "../../types/types";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import { FaUserLarge } from "react-icons/fa6";

interface PropsType {
  user: User | null;
}

const Header = ({ user }: PropsType) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      toast.success("Sign Out Successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Sign Out Fail");
    }
  };
  return (
    <div className="header">
      <Link to="/">
        <div className="logo">
          <span className="logo-text">Trend Mart</span>
        </div>
      </Link>

      <div className="nav-links">
        <Link to={"/search"}>
          <div className="i-icon">
            <FaSearch className="icon" />
          </div>
        </Link>
        <Link to="/cart">
          <div className="i-icon">
            <FaShoppingCart className="icon" />
          </div>
        </Link>

        {user?._id ? (
          <>
            <div onClick={() => setIsOpen((prev) => !prev)}>
              <div className="i-icon">
                <FaUserLarge className="icon" />
              </div>
            </div>
            <dialog open={isOpen}>
              <div>
                {user.role === "admin" && (
                  <NavLink
                    onClick={() => setIsOpen(false)}
                    to="/admin/dashboard"
                  >
                    Admin
                  </NavLink>
                )}

                <Link onClick={() => setIsOpen(false)} to="/orders">
                  Orders
                </Link>
                <div onClick={logoutHandler}>
                  <FaSignOutAlt />
                </div>
              </div>
            </dialog>
          </>
        ) : (
          <Link to={"/login"}>
            <div className="i-icon">
              <IoLogIn className="login-icon" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
