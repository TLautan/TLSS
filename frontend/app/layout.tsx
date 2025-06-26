// frontend/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './components/sidebar';

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
    <html lang="ja">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children} {/* This is where your page content will be rendered */}
          </main>
        </div>
      </body>
    </html>
  );
}