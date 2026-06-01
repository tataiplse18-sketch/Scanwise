"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ScanLine, Trophy, Clock, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/achievements", label: "Badges", icon: Trophy },
  { href: "/history", label: "History", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl pb-safe border-t border-white/[0.04]">
      {/* Subtle gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 transition-all duration-200",
                isActive ? "scale-105" : ""
              )}
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
                isActive ? "bg-primary-500/10" : ""
              )}>
                <Icon
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "h-5 w-5 text-primary-400" : "h-5 w-5 text-dark-600"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-primary-400" : "text-dark-600"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
