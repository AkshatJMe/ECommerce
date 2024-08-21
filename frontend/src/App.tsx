import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getUser } from "./services/userAPI";
import { userExist, userNotExist } from "./redux/reducer/userReducer";
import { auth } from "./firebase";
import { RootState } from "./redux/store";
import Header from "./components/common/Header";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails.tsx";
import Shipping from "./pages/Shipping.tsx";
import Checkout from "./pages/Checkout.tsx";
import NotFound from "./pages/NotFound.tsx";
import Orders from "./pages/Order.tsx";

function App() {
  const { user, loading } = useSelector(
    (state: RootState) => state.userReducer
  );
  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getUser(user.uid);
        dispatch(userExist(data.user));
      } else dispatch(userNotExist());
    });
  }, []);

  return (
    <Router>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
