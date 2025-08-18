// frontend/app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/common/global-search";

const inter = Inter({ subsets: ["latin"] });


function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const pathname = usePathname();

  const showLayout = isAuthenticated && pathname !== '/login';
  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              Loading Application...
          </div>
      );
  }

  return (
    <div className="flex min-h-screen">
      {showLayout && <Sidebar />}
      <div className="flex flex-col flex-grow w-full">
        {showLayout && (
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-10">
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <p className="text-sm text-muted-foreground">{user?.name}</p>
          </header>
        )}
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
            <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
