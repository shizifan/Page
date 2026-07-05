import type { Metadata } from "next";
import PixelWorld from "@/components/world2d/PixelWorld";

export const metadata: Metadata = {
  title: "像素版 · 石子凡",
};

export default function PixelPage() {
  return <PixelWorld />;
}
