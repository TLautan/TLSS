// frontend/components/common/sidebar.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
}

// Interface for a dropdown menu
interface DropdownLink {
  label: string;
  sublinks: NavLink[];
}

const Sidebar: React.FC = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const pathname = usePathname();

  const mainLinks: NavLink[] = [
    { href: "/", label: "Dashboard" },
  ];

  const registrationLinks: DropdownLink = {
    label: "登録 (Register)",
    sublinks: [
      { href: "/register/user", label: "ユーザー" },
      { href: "/register/company", label: "会社" },
      { href: "/register/deal", label: "取引" },
      { href: "/register/activity", label: "活動" },
      { href: "/register/agency", label: "代理店" },
    ],
  };

  const analyticsLinks: DropdownLink = {
    label: "分析 (Analytics)",
    sublinks: [
      { href: "/analytics/overall_analytics/monthly_churn", label: "月次解約率" },
      // Add more analytics links here later
    ],
  };

  return (
    <nav className="w-64 h-screen bg-gray-800 text-white p-5 flex flex-col flex-shrink-0">
      <h3 className="text-xl font-bold text-cyan-400 mb-6">営業管理システム</h3>
      <ul className="flex flex-col space-y-2">
        {mainLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={`block py-2 px-3 rounded-md transition-colors ${pathname === link.href ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              {link.label}
            </Link>
          </li>
        ))}
        
        {/* Registration Dropdown */}
        <li className="relative">
          <button
            onClick={() => setRegisterOpen(!registerOpen)}
            className="w-full flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-left"
          >
            <span>{registrationLinks.label}</span>
            <span className={`transform transition-transform duration-200 ${registerOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {registerOpen && (
            <ul className="mt-2 pl-4 space-y-1">
              {registrationLinks.sublinks.map((sublink) => (
                <li key={sublink.href}>
                  <Link href={sublink.href} className={`block py-1.5 px-3 rounded-md transition-colors ${pathname === sublink.href ? 'text-cyan-400 font-bold' : 'hover:bg-gray-600'}`}>
                    {sublink.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        <li className="relative">
          <button
            onClick={() => setAnalyticsOpen(!analyticsOpen)}
            className="w-full flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-left"
          >
            <span>{analyticsLinks.label}</span>
            <span className={`transform transition-transform duration-200 ${analyticsOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {analyticsOpen && (
            <ul className="mt-2 pl-4 space-y-1">
              {analyticsLinks.sublinks.map((sublink) => (
                <li key={sublink.href}>
                  <Link href={sublink.href} className={`block py-1.5 px-3 rounded-md transition-colors ${pathname === sublink.href ? 'text-cyan-400 font-bold' : 'hover:bg-gray-600'}`}>
                    {sublink.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;