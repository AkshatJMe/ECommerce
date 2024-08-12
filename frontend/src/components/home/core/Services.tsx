import { TbTruckDelivery } from "react-icons/tb";
import { LuShieldCheck } from "react-icons/lu";
import { FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";

const services = [
  {
    icon: <TbTruckDelivery />,
    title: "FREE AND FAST DELIVERY",
    description: "Free delivery for all orders over $200",
  },
  {
    icon: <LuShieldCheck />,
    title: "SECURE PAYMENT",
    description: "100% secure payment",
  },
  {
    icon: <FaHeadset />,
    title: "24/7 SUPPORT",
    description: "Get support 24/7",
  },
];

const Services = () => {
  return (
    <article className="our-services">
      <ul>
        {services.map((service, i) => (
          <motion.li
            initial={{ opacity: 0, y: -100 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: {
                delay: i / 20,
              },
            }}
            key={service.title}
          >
            <div>{service.icon}</div>
            <section>
              <h3>{service.title}Y</h3>
              <p>{service.title}</p>
            </section>
          </motion.li>
        ))}
      </ul>
    </article>
  );
};

export default Services;
