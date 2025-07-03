import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Management System",
  description: "A dashboard for sales analytics and management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        {/* Main Flex Container */}
        <div className="flex min-h-screen">
          
          {/* Sidebar Component */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-grow p-6 sm:p-8 bg-muted/40">
            {children} {/* Your page content will render here */}
          </main>

        </div>
      </body>
    </html>
  );
}
