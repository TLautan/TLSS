// frontend/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/common/sidebar'; // Import your Sidebar component
import ThemeToggle from '../components/common/themetoggle'; // Import the new ThemeToggle component

export const metadata: Metadata = {
  title: 'Sales CRM System',
  description: 'Manage your sales operations efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Remove the className="dark" from html here. ThemeToggle will manage it.
    <html lang="ja">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-grow p-6 sm:p-8 bg-background text-foreground relative"> {/* Added relative for positioning */}
            <div className="absolute top-4 right-4 z-10"> {/* Positioning for the toggle button */}
              <ThemeToggle />
            </div>
            {children} {/* This is where your page content will be rendered */}
          </main>
        </div>
      </body>
    </html>
  );
}