// frontend/components/common/sidebar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell, Home, Users, LineChart, Package, CreditCard,
  Building, KanbanSquare, Upload, FileText, Hammer, Wrench, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DropdownLink {
  id: string;
  label: string;
  icon: React.ElementType;
  sublinks: NavLink[];
}

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/register')) setOpenDropdown('register');
    else if (pathname.startsWith('/analytics')) setOpenDropdown('analytics');
    else if (pathname.startsWith('/settings')) setOpenDropdown('settings');
    else setOpenDropdown(null);
  }, [pathname]);


  const mainLinks: NavLink[] = [
    { href: "/", label: "ダッシュボード", icon: Home },
    { href: "/pipeline", label: "パイプライン (Pipeline)", icon: KanbanSquare },
    { href: "/users", label: "担当者一覧 (Users)", icon: Users },
    { href: "/companies", label: "会社一覧 (Companies)", icon: Building },
    { href: "/deals", label: "取引一覧 (Deals)", icon: CreditCard },
    { href: "/agencies", label: "代理店一覧 (Agency)", icon: Users },
  ];

  const dropdowns: DropdownLink[] = [
    {
      id: "register",
      label: "登録 (Register)",
      icon: Package,
      sublinks: [
        { href: "/register/user", label: "ユーザー", icon: Users },
        { href: "/register/company", label: "会社", icon: Building },
        { href: "/register/deal", label: "取引", icon: CreditCard },
        { href: "/register/activity", label: "活動", icon: Bell },
        { href: "/register/agency", label: "代理店", icon: Users },
        { href: "/import", label: "データインポート (Import)", icon: Upload },
      ],
    },
    {
      id: "analytics",
      label: "分析 (Analytics)",
      icon: LineChart,
      sublinks: [
        { href: "/analytics/leaderboard", label: "リーダーボード", icon: LineChart },
        { href: "/analytics/forecast", label: "売上予測", icon: LineChart },
        { href: "/analytics/channel-performance", label: "チャネル別実績", icon: LineChart },
        { href: "/analytics/agency-performance", label: "代理店別実績", icon: LineChart },
        { href: "/analytics/overall_analytics/monthly_churn", label: "月次解約率", icon: LineChart },
        { href: "/analytics/deal-outcomes", label: "取引成果分析", icon: LineChart },
        { href: "/analytics/reports/monthly", label: "月次レポート", icon: FileText },
      ],
    },
    {
        id: "settings",
        label: "その他 (Other)",
        icon: Wrench,
        sublinks: [
            { href: "/settings/audit-log", label: "監査ログ (Audit Log)", icon: Hammer },
        ]
    }
  ];
  
  const toggleDropdown = (id: string) => {
    setOpenDropdown(prev => (prev === id ? null : id));
  };
  
  const isLinkActive = (href: string) => pathname === href;

  const isDropdownActive = (dropdown: DropdownLink) => {
      return dropdown.sublinks.some(sublink => pathname.startsWith(sublink.href));
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 sticky top-0 h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl">Softsu Sales</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isLinkActive(link.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {dropdowns.map((dropdown) => (
              <div key={dropdown.id} className="relative">
                <Button
                  onClick={() => toggleDropdown(dropdown.id)}
                  variant="ghost"
                  className={`w-full flex justify-between items-center px-3 py-2 transition-all hover:bg-muted text-left ${
                    isDropdownActive(dropdown) ? 'bg-muted text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <dropdown.icon className="h-4 w-4" />
                    <span>{dropdown.label}</span>
                  </span>
                  <span className={`transform transition-transform duration-200 ${openDropdown === dropdown.id ? 'rotate-180' : ''}`}>▲</span>
                </Button>

                {openDropdown === dropdown.id && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {dropdown.sublinks.map((sublink) => (
                      <li key={sublink.href}>
                        <Link
                          href={sublink.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted text-left ${
                            pathname.startsWith(sublink.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {sublink.icon && <sublink.icon className="h-4 w-4" />}
                          {sublink.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト (Logout)
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;