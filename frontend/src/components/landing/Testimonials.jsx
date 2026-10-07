import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";

const TESTIMONIALS = [
  { quote: "The follow-ups actually felt like a real interviewer was listening.", name: "Demo user", role: "Final-year CS student", avatar: "boy" },
  { quote: "The report made it obvious where my explanations were weak.", name: "Demo user", role: "Aspiring data analyst", avatar: "girl" },
  { quote: "Questions felt specific to my own projects, not generic.", name: "Demo user", role: "Early-career developer", avatar: "boy" },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Practice, then walk in ready</h2>
          <p className="mt-3 font-normal text-ink-soft">Illustrative feedback from demo practice sessions.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <motion.figure
              key={t.quote}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: idx * 0.06 }}
              className="card-soft p-6"
            >
              <blockquote className="font-normal text-[14.5px] leading-relaxed text-ink">"{t.quote}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5">
                <Avatar type={t.avatar} size={32} />
                <span className="text-[13px] font-normal text-ink-soft">{t.name} — {t.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
