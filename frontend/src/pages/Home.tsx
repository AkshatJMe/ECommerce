import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import Newsletter from "../components/common/Newsletter";
import Announcement from "../components/home/Announcement";
import Categories from "../components/home/Categories";
import Hero from "../components/home/core/Hero";
import Services from "../components/home/core/Services";

const Home = () => {
  return (
    <div>
      <Announcement />
      <Hero />
      <Categories />
      <Services />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
