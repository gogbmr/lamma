// components/navigation/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Home, 
  BookOpen, // New Icon
  Trophy, 
  TrendingUp, 
  Newspaper, 
  User, 
  LogIn
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data } = authClient.useSession();
  const isLoggedIn = !!data?.user && data.user.username !== null;

  const navigationItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Courses", href: "/courses", icon: BookOpen }, // Added Courses
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Trade", href: "/trading", icon: TrendingUp },
    { label: "News", href: "/news", icon: Newspaper },
    { 
      label: isLoggedIn ? "Profile" : "Login", 
      href: isLoggedIn ? "/dashboard" : "/login", 
      icon: isLoggedIn ? User : LogIn 
    },
  ];

  // ... Rest of the Navbar component remains exactly the same as previous updates ...
  return (
    <>
      <header className="hidden md:flex w-full bg-card border-b border-border sticky top-0 z-50 px-8 py-3.5 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-widest text-primary">FINLAMMA</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Headers */}
      <header className="flex md:hidden w-full bg-card border-b border-border sticky top-0 z-50 px-4 py-3 items-center justify-between">
        <span className="text-lg font-black tracking-widest text-primary">FINLAMMA</span>
        <ThemeToggle />
      </header>

      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 h-16 items-center justify-around px-2 shadow-lg">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/");
          return (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center flex-1 gap-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`p-1.5 rounded-xl ${isActive ? "bg-primary/10" : ""}`}><Icon className="h-5 w-5" /></div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}