// frontend/app/page.tsx
import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      {/* Add very basic, obvious Tailwind classes here */}
      <h2 className="text-5xl font-extrabold text-red-600 p-8 border-4 border-yellow-400">
        Dashboard Overview Test
      </h2>
      <p className="text-xl text-blue-500 mt-4">This is your main dashboard content.</p>
    </div>
  );
}