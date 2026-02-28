import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowRightLeft, 
  ShieldCheck, 
  ScrollText, 
  LayoutDashboard,
  Link as LinkIcon
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/register", icon: Building2, label: "Register Property" },
  { to: "/transfer", icon: ArrowRightLeft, label: "Transfer" },
  { to: "/verify", icon: ShieldCheck, label: "Verify" },
  { to: "/transactions", icon: ScrollText, label: "Transactions" },
];

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col fixed h-screen z-10">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-chain">
              <LinkIcon className="w-5 h-5 text-chain" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-sm tracking-tight">LandChain</h1>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Registry v1.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
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

        <div className="p-4 border-t border-border">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Network</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-foreground font-mono">Simulated Chain</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
