import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/Navbar";

const inter  = Inter ({ subsets: ["latin"], variable: "--font-inter",  display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CLT Academy — Product Store", template: "%s | CLT Academy" },
  description: "Production-grade e-commerce product management dashboard built with Next.js, Express & MongoDB.",
  keywords: ["ecommerce", "product management", "CLT Academy"],
  authors: [{ name: "CLT Academy" }],
  openGraph: {
    title: "CLT Academy — Product Store",
    description: "Production-grade e-commerce product management dashboard.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
