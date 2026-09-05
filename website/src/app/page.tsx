import { Nav } from "@/components/sections/nav";
import { Hero3D } from "@/components/sections/hero-3d";
import { Stack3D } from "@/components/sections/stack-3d";
import { Marquee } from "@/components/sections/marquee";
import { MenuSection } from "@/components/sections/menu";
import { Craft } from "@/components/sections/craft";
import { Visit } from "@/components/sections/visit";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero3D />
      <Stack3D />
      <Marquee />
      <MenuSection />
      <Craft />
      <Visit />
      <Footer />
    </main>
  );
}
