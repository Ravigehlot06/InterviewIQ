import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ScrollStory from "../components/landing/ScrollStory";
import Features from "../components/landing/Features";
import InterviewTypes from "../components/landing/InterviewTypes";
import ProductPreview from "../components/landing/ProductPreview";
import Credibility from "../components/landing/Credibility";
import FAQ from "../components/landing/FAQ";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full bg-[#EDF3F8] text-[#001D39] font-sans antialiased selection:bg-[#0A4174] selection:text-white overflow-x-clip">
      {/* Subtle Ambient Grain/Radial Background */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(#001D3908_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />

      {/* ── ANIMATED FLOATING AMBIENT ORB BACKGROUND ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Large slow orb top-left */}
        <div
          className="absolute -top-24 -left-32 h-[600px] w-[600px] rounded-full opacity-30 animate-orb-1"
          style={{ background: 'radial-gradient(circle, rgba(123,189,232,0.5) 0%, transparent 70%)' }}
        />
        {/* Medium orb right center */}
        <div
          className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full opacity-25 animate-orb-2"
          style={{ background: 'radial-gradient(circle, rgba(78,142,162,0.5) 0%, transparent 70%)' }}
        />
        {/* Small accent orb bottom-left */}
        <div
          className="absolute bottom-[15%] left-[10%] h-[400px] w-[400px] rounded-full opacity-20 animate-orb-3"
          style={{ background: 'radial-gradient(circle, rgba(189,216,233,0.6) 0%, transparent 70%)' }}
        />
        {/* Deep teal accent orb center */}
        <div
          className="absolute top-[60%] left-[55%] h-[350px] w-[350px] rounded-full opacity-15 animate-orb-1"
          style={{ background: 'radial-gradient(circle, rgba(10,65,116,0.5) 0%, transparent 70%)', animationDelay: '8s' }}
        />
      </div>

      {/* 1. Minimal Responsive Sticky Navigation */}
      <Navbar />

      {/* 2. Editorial First-Impression Hero */}
      <Hero />

      {/* 3. Signature Experience — Four-Step Connected Scroll Story */}
      <ScrollStory />

      {/* 4. Editorial Features Section */}
      <Features />

      {/* 5. Interview Types Section */}
      <InterviewTypes />

      {/* 6. Realistic Product Preview Showcase */}
      <ProductPreview />

      {/* 7. Practical Trust & Credibility Section */}
      <Credibility />

      {/* 8. Comprehensive FAQ Accordion */}
      <FAQ />

      {/* 9. Final High-Contrast Call to Action */}
      <FinalCTA />

      {/* 10. Minimal Editorial Footer */}
      <Footer />
    </div>
  );
}
