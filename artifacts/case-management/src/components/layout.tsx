import { FC, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Briefcase, 
  LayoutDashboard, 
  Files, 
  CalendarDays, 
  CheckSquare, 
  MessagesSquare,
  Scale
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: Briefcase },
  { href: "/documents", label: "Documents", icon: Files },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/interactions", label: "Interactions", icon: MessagesSquare },
];

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-md">
            <Scale className="h-6 w-6" />
          </div>
          <span className="font-serif font-semibold text-xl tracking-wide">J&amp;B Law</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium">
              JB
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">J&amp;B Law Firm</span>
              <span className="text-xs text-sidebar-foreground/60">Case Management</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col h-full bg-slate-50/50 relative">
        {/* Top header area could go here, for now it's just the page content */}
        <div className="flex-1 w-full max-w-7xl mx-auto p-8 relative animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};
