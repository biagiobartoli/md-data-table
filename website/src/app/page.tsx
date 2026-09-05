import { Nav } from "@/components/sections/nav";
import { Hero3D } from "@/components/sections/hero-3d";
import { Marquee } from "@/components/sections/marquee";
import { Showcase } from "@/components/sections/showcase";
import { Stack3D } from "@/components/sections/stack-3d";
import { Press } from "@/components/sections/press";
import { MenuSection } from "@/components/sections/menu";
import { Craft } from "@/components/sections/craft";
import { Faq } from "@/components/sections/faq";
import { Visit } from "@/components/sections/visit";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero3D />
      <Marquee />
      <Showcase />
      <Stack3D />
      <Press />
      <MenuSection />
      <Craft />
      <Faq />
      <Visit />
      <Footer />
    </main>
  );
}
