// frontend/components/common/sidebar.tsx
"use client"; // This directive is important for client-side functionality like useState and usePathname

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook to get current path for active link highlighting

// Import all necessary Lucide icons
import {
  Bell, // From second component, though not directly used in the provided nav links yet
  Home,
  Users,
  LineChart,
  Package,
  CreditCard,
  Building,
  Upload,
} from "lucide-react";

// Import Shadcn UI components (if used for buttons/badges)
import { Button } from "@/components/ui/button";

// Interface for a basic navigation link
interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType; // Add an icon property
}

// Interface for a dropdown menu
interface DropdownLink {
  label: string;
  icon: React.ElementType; // Add an icon property for the dropdown trigger
  sublinks: NavLink[];
}

const Sidebar: React.FC = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const pathname = usePathname(); // Get the current path to highlight active links

  // Define main navigation links with icons
  const mainLinks: NavLink[] = [
    { href: "/", label: "ダッシュボード", icon: Home },
    { href: "/users", label: "担当者一覧 (Users)", icon: Users },
    { href: "/companies", label: "会社一覧 (Companies)", icon: Building },
    { href: "/deals", label: "取引一覧 (Deals)", icon: CreditCard },
    { href: "/agencies", label: "代理店一覧 (Agency)", icon: Users }, // Reusing Users icon or find a specific one
    { href: "/import", label: "データインポート (Import)", icon: Upload }, // Add the Import Data link directly
  ];

  // Define registration dropdown links with icon for the main dropdown trigger
  const registrationLinks: DropdownLink = {
    label: "登録 (Register)",
    icon: Package, // Using Package icon for the "Register" dropdown
    sublinks: [
      { href: "/register/user", label: "ユーザー", icon: Users }, // Sublinks can have icons too
      { href: "/register/company", label: "会社", icon: Building },
      { href: "/register/deal", label: "取引", icon: CreditCard },
      { href: "/register/activity", label: "活動", icon: Bell }, // Using Bell as a placeholder
      { href: "/register/agency", label: "代理店", icon: Users },
    ],
  };

  // Define analytics dropdown links with icon for the main dropdown trigger
  const analyticsLinks: DropdownLink = {
    label: "分析 (Analytics)",
    icon: LineChart, // Using LineChart icon for the "Analytics" dropdown
    sublinks: [
      { href: "/analytics/overall_analytics/monthly_churn", label: "月次解約率", icon: LineChart }, // Sublinks can reuse icons
      { href: "/analytics/deal-outcomes", label: "取引成果分析", icon: LineChart },
    ],
  };

  // Helper function to determine if a link is active,
  // also opening dropdowns if a sublink is active
  const isActiveLink = (href: string): boolean => {
    // Check for exact match for main links
    if (pathname === href) return true;

    // Check if current path starts with sublink href for dropdowns
    // and automatically open the dropdown if a sublink is active
    if (href.startsWith('/register') && pathname.startsWith('/register')) {
      if (!registerOpen) setRegisterOpen(true);
      return pathname.startsWith(href); // Highlight sublink if active
    }
    if (href.startsWith('/analytics') && pathname.startsWith('/analytics')) {
      if (!analyticsOpen) setAnalyticsOpen(true);
      return pathname.startsWith(href); // Highlight sublink if active
    }

    return false;
  };

  const isDropdownActive = (dropdownLabel: string): boolean => {
    // Check if any sublink in the dropdown is active
    if (dropdownLabel === registrationLinks.label) {
      return registrationLinks.sublinks.some(sublink => pathname.startsWith(sublink.href));
    }
    if (dropdownLabel === analyticsLinks.label) {
      return analyticsLinks.sublinks.some(sublink => pathname.startsWith(sublink.href));
    }
    return false;
  };


  return (
    <div className="hidden border-r bg-muted/40 md:block"> {/* From second component */}
      <div className="flex h-full max-h-screen flex-col gap-2"> {/* From second component */}
        {/* Logo and Title */}
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6"> {/* From second component */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" /> {/* Reused icon from second */}
            <span className="text-xl">Softsu Sales</span> {/* Larger text for branding */}
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-auto py-2"> {/* Added overflow-auto for scrollable sidebar */}
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {/* Main Links */}
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // Determine active class based on pathname or if it's a dropdown trigger
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActiveLink(link.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" /> {/* Render the icon */}
                {link.label}
              </Link>
            ))}

            {/* Registration Dropdown */}
            <div className="relative"> {/* Use div for relative positioning */}
              <Button // Use Shadcn Button for dropdown trigger
                onClick={() => setRegisterOpen(!registerOpen)}
                variant="ghost" // Use a ghost variant to match sidebar links
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
                <ul className="mt-1 ml-4 space-y-1"> {/* Adjusted margin and spacing */}
                  {registrationLinks.sublinks.map((sublink) => (
                    <li key={sublink.href}>
                      <Link
                        href={sublink.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted text-left ${
                          isActiveLink(sublink.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                        }`}
                      >
                         {sublink.icon && <sublink.icon className="h-4 w-4" />} {/* Optional icon for sublinks */}
                        {sublink.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Analytics Dropdown */}
            <div className="relative"> {/* Use div for relative positioning */}
              <Button // Use Shadcn Button for dropdown trigger
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
                <ul className="mt-1 ml-4 space-y-1"> {/* Adjusted margin and spacing */}
                  {analyticsLinks.sublinks.map((sublink) => (
                    <li key={sublink.href}>
                      <Link
                        href={sublink.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted text-left ${
                          isActiveLink(sublink.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {sublink.icon && <sublink.icon className="h-4 w-4" />} {/* Optional icon for sublinks */}
                        {sublink.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* You had a separate Analytics link outside dropdowns previously in the second code snippet,
                but it seems the intent is to put all analytics under a dropdown.
                If you want a direct Analytics link as well, add it here:
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
        {/* Footer/Settings (if any from original code) */}
        <div className="mt-auto p-4 border-t"> {/* Example for pushing content to bottom */}
            {/* Optional: Add settings link or user info here */}
            <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Users className="h-4 w-4" /> Settings {/* Using Users as placeholder */}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;