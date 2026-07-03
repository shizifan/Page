import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Enterprise } from "@/components/Enterprise";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Theses } from "@/components/Theses";
import { Works } from "@/components/Works";
import { Writing } from "@/components/Writing";

export default function Page() {
  return (
    <main className="flex-1">
      <Nav />
      <Hero />
      <About />
      <Works />
      <Enterprise />
      <Theses />
      <Writing />
      <Contact />
    </main>
  );
}
