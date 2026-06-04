// app/admin/layout.tsx
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    /* FIXED: Force an explicit, non-scrolling flex row across the entire viewport */
    <div className="flex flex-row h-screen w-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      
      {/* Sidebar stays locked safely on the left margin */}
      <AdminSidebar />
      
      {/* FIXED: right side container handles its own internal scrolling independently from the top */}
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        {children}
      </div>

    </div>
  );
} 