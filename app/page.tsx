import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Index from "@/components/Index";
import Products from "@/components/Products";
import Manifesto from "@/components/Manifesto";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Index />
        <Products />
        <Manifesto />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
