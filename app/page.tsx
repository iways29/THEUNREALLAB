import Nav from "@/components/Nav";
import Stage from "@/components/Stage";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import ThePromise from "@/components/ThePromise";
import ThePractice from "@/components/ThePractice";
import TheRoom from "@/components/TheRoom";
import TheFund from "@/components/TheFund";
import TheConch from "@/components/TheConch";

export default function Home() {
  return (
    <>
      <Stage />
      <Nav />
      <div className="progress" data-progress aria-hidden="true" />
      <main className="content">
        <Hero />
        <ThePromise />
        <ThePractice />
        <TheRoom />
        <TheFund />
        <TheConch />
      </main>
      <Cursor />
    </>
  );
}
