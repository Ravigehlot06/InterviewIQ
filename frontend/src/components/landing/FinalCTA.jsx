import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        className="card-emerald mx-auto max-w-2xl p-12 text-center"
      >
        <h2 className="font-display text-3xl sm:text-4xl">
          Your next interview doesn't have to be your first practice.
        </h2>
        <p className="mt-4 font-normal text-white/70">Practice it before you face it.</p>
        <Link to="/signup" className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-emerald-dark shadow-[0_16px_30px_-14px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.03]">
          Start your interview
        </Link>
      </motion.div>
    </section>
  );
}
