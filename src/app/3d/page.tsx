import type { Metadata } from "next";
import WorldApp from "@/components/world/WorldApp";

export const metadata: Metadata = {
  title: "3D 版 · 石子凡",
};

export default function ThreeDPage() {
  return <WorldApp />;
}
