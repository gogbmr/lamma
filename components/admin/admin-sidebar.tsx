// components/admin/admin-sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle"; // Imported your existing theme controller
import { 
  LayoutDashboard, Users, BookOpen, 
  TrendingUp, Wallet, ChevronDown, 
  ChevronRight, ShieldCheck, ArrowLeft,
  UserCircle, Newspaper,
  FileQuestion // Added icon
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["courses"]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name) 
        : [...prev, name]
    );
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { 
      name: "Courses", icon: BookOpen, id: "courses",
      submenu: [
        { name: "All Courses", href: "/admin/courses" },
        { name: "Review Queue", href: "/admin/courses/review" },
      ]
    },
    { 
      name: "Users", icon: Users, id: "users",
      submenu: [
        { name: "All Users", href: "/admin/users" },
      ]
    },
    { name: "Quiz Manager", href: "/admin/quizzes", icon: FileQuestion },
    { name: "Tutors", href: "/admin/tutors", icon: UserCircle },
    { name: "News Feed", href: "/admin/news", icon: Newspaper },

    { name: "Trade Monitor", href: "/admin/trades", icon: TrendingUp },
    { name: "Financials", href: "/admin/finances", icon: Wallet },

  ];

  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border h-screen sticky top-0 flex flex-col transition-colors duration-300">
      
      {/* Branding Header Banner */}
      <div className="p-6 border-b border-border flex items-center gap-2">
        <div className="bg-destructive text-white p-1.5 rounded-lg">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="font-black tracking-tighter text-lg text-foreground">ADMIN HUB</span>
      </div>

      {/* Navigation Tree Strip */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const hasSubmenu = !!item.submenu;
          const isOpen = openMenus.includes(item.id || "");
          const isActive = pathname === item.href;

          return (
            <div key={item.name}>
              {hasSubmenu ? (
                <button
                  type="button"
                  onClick={() => toggleMenu(item.id!)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )}

              {hasSubmenu && isOpen && (
                <div className="mt-1 ml-9 space-y-1 border-l border-border pl-2">
                  {item.submenu!.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={`block p-2 text-xs font-bold rounded-lg transition-all ${
                        pathname === sub.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* FIXED: Footer transformed into a split row row with Theme Toggle added */}
      <div className="p-4 border-t border-border flex items-center justify-between gap-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 p-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> 
          <span>Exit to App</span>
        </Link>
        
        {/* Render Theme Toggle Action Button */}
        <ThemeToggle />
      </div>

    </aside>
  );
}