import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminPreviewHighlighter from "@/components/AdminPreviewHighlighter";
import { RedisInitializer } from "@/components/RedisInitializer";
import '@/lib/redis'; // Initialize Redis on server startup

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Inkhub - Premium Temporary Tattoos",
  description: "Shop unique and high-quality temporary tattoos. Express yourself with our exclusive collection of spiritual, anime, minimal, and bold designs.",
  keywords: "temporary tattoos, tattoo shop, spiritual tattoos, anime tattoos, minimal tattoos, body art",
  openGraph: {
    title: "Inkhub - Premium Temporary Tattoos",
    description: "Shop unique and high-quality temporary tattoos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <RedisInitializer />
        <AdminPreviewHighlighter />
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
