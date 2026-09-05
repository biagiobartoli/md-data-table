import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { HeroScroll } from "@/components/sections/hero-scroll";
import { MenuSection } from "@/components/sections/menu";
import { Craft } from "@/components/sections/craft";
import { Visit } from "@/components/sections/visit";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Marquee />
      <HeroScroll />
      <MenuSection />
      <Craft />
      <Visit />
      <Footer />
    </main>
  );
}
