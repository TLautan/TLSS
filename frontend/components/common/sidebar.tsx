// frontend/components/common/sidebar.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from "lucide-react";
import {
  Bell,
  Home,
  Users,
  LineChart,
  Package,
  CreditCard,
  Building,
  KanbanSquare,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DropdownLink {
  label: string;
  icon: React.ElementType;
  sublinks: NavLink[];
}

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const pathname = usePathname();

  const mainLinks: NavLink[] = [
    { href: "/", label: "ダッシュボード", icon: Home },
    { href: "/pipeline", label: "パイプライン (Pipeline)", icon: KanbanSquare },
    { href: "/users", label: "担当者一覧 (Users)", icon: Users },
    { href: "/companies", label: "会社一覧 (Companies)", icon: Building },
    { href: "/deals", label: "取引一覧 (Deals)", icon: CreditCard },
    { href: "/agencies", label: "代理店一覧 (Agency)", icon: Users },
    { href: "/import", label: "データインポート (Import)", icon: Upload },
  ];

  const registrationLinks: DropdownLink = {
    label: "登録 (Register)",
    icon: Package,
    sublinks: [
      { href: "/register/user", label: "ユーザー", icon: Users },
      { href: "/register/company", label: "会社", icon: Building },
      { href: "/register/deal", label: "取引", icon: CreditCard },
      { href: "/register/activity", label: "活動", icon: Bell },
      { href: "/register/agency", label: "代理店", icon: Users },
    ],
  };

  const analyticsLinks: DropdownLink = {
    label: "分析 (Analytics)",
    icon: LineChart,
    sublinks: [
      { href: "/analytics/leaderboard", label: "リーダーボード (Leaderboard)", icon: LineChart },
      { href: "/analytics/forecast", label: "売上予測 (Forecast)", icon: LineChart },
      { href: "/analytics/channel-performance", label: "チャネル別実績 (Channels)", icon: LineChart },
      { href: "/analytics/agency-performance", label: "代理店別実績 (Agencies)", icon: LineChart },
      { href: "/analytics/overall_analytics/monthly_churn", label: "月次解約率", icon: LineChart },
      { href: "/analytics/deal-outcomes", label: "取引成果分析", icon: LineChart },
    ],
  };

  const isActiveLink = (href: string): boolean => {
    if (pathname === href) return true;

    if (href.startsWith('/register') && pathname.startsWith('/register')) {
      if (!registerOpen) setRegisterOpen(true);
      return pathname.startsWith(href);
    }
    if (href.startsWith('/analytics') && pathname.startsWith('/analytics')) {
      if (!analyticsOpen) setAnalyticsOpen(true);
      return pathname.startsWith(href);
    }

    return false;
  };

  const isDropdownActive = (dropdownLabel: string): boolean => {
    if (dropdownLabel === registrationLinks.label) {
      return registrationLinks.sublinks.some(sublink => pathname.startsWith(sublink.href));
    }
    if (dropdownLabel === analyticsLinks.label) {
      return analyticsLinks.sublinks.some(sublink => pathname.startsWith(sublink.href));
    }
    return false;
  };


  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl">Softsu Sales</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActiveLink(link.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <div className="relative">
              <Button
                onClick={() => setRegisterOpen(!registerOpen)}
                variant="ghost"
                className={`w-full flex justify-between items-center px-3 py-2 transition-all hover:bg-muted text-left ${
                  isDropdownActive(registrationLinks.label) ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-3">
                  <registrationLinks.icon className="h-4 w-4" />
                  <span>{registrationLinks.label}</span>
                </span>
                <span className={`transform transition-transform duration-200 ${registerOpen ? 'rotate-180' : ''}`}>▼</span>
              </Button>

              {registerOpen && (
                <ul className="mt-1 ml-4 space-y-1">
                  {registrationLinks.sublinks.map((sublink) => (
                    <li key={sublink.href}>
                      <Link
                        href={sublink.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted text-left ${
                          isActiveLink(sublink.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
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

            <div className="relative">
              <Button
                onClick={() => setAnalyticsOpen(!analyticsOpen)}
                variant="ghost"
                className={`w-full flex justify-between items-center px-3 py-2 transition-all hover:bg-muted text-left ${
                  isDropdownActive(analyticsLinks.label) ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-3">
                  <analyticsLinks.icon className="h-4 w-4" />
                  <span>{analyticsLinks.label}</span>
                </span>
                <span className={`transform transition-transform duration-200 ${analyticsOpen ? 'rotate-180' : ''}`}>▼</span>
              </Button>

              {analyticsOpen && (
                <ul className="mt-1 ml-4 space-y-1">
                  {analyticsLinks.sublinks.map((sublink) => (
                    <li key={sublink.href}>
                      <Link
                        href={sublink.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted text-left ${
                          isActiveLink(sublink.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
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
            {/* 
            <Link
                href="/analytics/deal-outcomes"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <LineChart className="h-4 w-4" />
                Analytics (Direct)
            </Link>
            */}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <Users className="h-4 w-4" /> 設定
          </Link>
          <div className="mt-auto p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
                ログアウト
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;