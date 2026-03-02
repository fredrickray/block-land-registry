import { NavLink, Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowRightLeft, 
  ShieldCheck, 
  ScrollText, 
  LayoutDashboard,
  Link as LinkIcon,
  Menu,
  X,
  Search,
  Send,
  Home,
  History,
  LogOut,
  UserCircle2
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const sellerNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/register", icon: Building2, label: "Register Property" },
  { to: "/transfer", icon: ArrowRightLeft, label: "Transfer" },
  { to: "/verify", icon: ShieldCheck, label: "Verify" },
  { to: "/transactions", icon: ScrollText, label: "Transactions" },
];

const buyerNavItems = [
  { to: "/buyer/search", icon: Search, label: "Property Search" },
  { to: "/buyer/request", icon: Send, label: "Request Transfer" },
  { to: "/buyer/properties", icon: Home, label: "My Properties" },
  { to: "/buyer/history", icon: History, label: "Purchase History" },
];

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const navItems = user.role === "seller" ? sellerNavItems : buyerNavItems;

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-chain">
            <LinkIcon className="w-5 h-5 text-chain" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-sm tracking-tight">LandChain</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              {user.role === "seller" ? "Seller Panel" : "Buyer Panel"}
            </p>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => isMobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-chain border border-primary/20 glow-chain"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle2 className="w-4 h-4 text-chain" />
            <span className="text-xs text-foreground font-medium truncate">{user.name}</span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground truncate">{user.email}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Network</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-foreground font-mono">Simulated Chain</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-muted-foreground hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`w-64 border-r border-border bg-sidebar flex flex-col fixed h-screen z-30 transition-transform duration-300 ${
          isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>

      <main className={`flex-1 ${isMobile ? "" : "ml-64"}`}>
        {isMobile && (
          <header className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-background/80 backdrop-blur-sm">
            <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-chain" />
              <span className="font-display font-bold text-foreground text-sm">LandChain</span>
            </div>
          </header>
        )}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
