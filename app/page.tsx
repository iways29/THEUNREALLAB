import Nav from "@/components/Nav";
import Stage from "@/components/Stage";
import Rail from "@/components/Rail";
import Hero from "@/components/Hero";
import ThePromise from "@/components/ThePromise";
import ThePractice from "@/components/ThePractice";
import TheRoom from "@/components/TheRoom";
import TheFund from "@/components/TheFund";
import TheConch from "@/components/TheConch";
import Particles from "@/components/reactbits/Particles";
import ClickSpark from "@/components/reactbits/ClickSpark";
import TargetCursor from "@/components/reactbits/TargetCursor";
import SplashCursor from "@/components/reactbits/SplashCursor";
import GradualBlur from "@/components/reactbits/GradualBlur";

export default function Home() {
  return (
    <>
      <Stage />
      <Particles />
      <Nav />
      <Rail />
      <div className="progress" data-progress aria-hidden="true" />
      <main className="content">
        <Hero />
        <ThePromise />
        <ThePractice />
        <TheRoom />
        <TheFund />
        <TheConch />
      </main>
      <GradualBlur position="bottom" height="12vh" strength={2} divCount={4} />
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR="#e6b85a"
        SIM_RESOLUTION={96}
        DYE_RESOLUTION={640}
        DENSITY_DISSIPATION={4.2}
        VELOCITY_DISSIPATION={2.6}
        SPLAT_RADIUS={0.11}
        SPLAT_FORCE={2200}
        CURL={6}
        PRESSURE_ITERATIONS={12}
        SHADING={false}
      />
      <ClickSpark />
      <TargetCursor targetSelector="a, button, [data-cursor-target], .prose, .verse" />
    </>
  );
}
