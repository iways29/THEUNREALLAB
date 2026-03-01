import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Products from "@/components/Products";
import Manifesto from "@/components/Manifesto";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      <Cursor />
      <ScrollReveal />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Products />
        <Manifesto />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
