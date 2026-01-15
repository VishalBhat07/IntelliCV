import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Reviews from "../components/Reviews";
import Comparison from "../components/Comparison";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans antialiased">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorks />
        <Features />
        <Reviews />
        <Comparison />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
