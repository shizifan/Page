import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Works } from "@/components/Works";

export default function Page() {
  return (
    <main className="flex-1">
      <Nav />
      <Hero />
      <About />
      <Works />
      <Contact />
    </main>
  );
}
