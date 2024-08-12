import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import Newsletter from "../components/common/Newsletter";
import Announcement from "../components/home/Announcement";
import Categories from "../components/home/Categories";

const Home = () => {
  return (
    <div>
      <Header />
      <Announcement />
      <Categories />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
