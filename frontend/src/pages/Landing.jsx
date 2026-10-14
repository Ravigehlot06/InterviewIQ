import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ScrollStoryScene from "../components/landing/ScrollStoryScene";
import Features from "../components/landing/Features";
import InterviewTypes from "../components/landing/InterviewTypes";
import Stats from "../components/landing/Stats";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <Hero />
      <ScrollStoryScene />
      <Features />
      <InterviewTypes />
      <Stats />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
