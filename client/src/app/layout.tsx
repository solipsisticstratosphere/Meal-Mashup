import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/lib/client-providers";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meal Mashup",
  description: "Generate recipes from ingredients you have",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <SonnerToaster richColors position="top-right" />
          <HotToaster position="top-center" />
        </ClientProviders>
      </body>
    </html>
  );
}
