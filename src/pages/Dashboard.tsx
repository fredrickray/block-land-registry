import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ArrowRightLeft, Blocks, ShieldCheck } from "lucide-react";
import { seedDemoData, getState, type Transaction } from "@/lib/blockchain";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import HashDisplay from "@/components/HashDisplay";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, transfers: 0, blocks: 0 });
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);

  useEffect(() => {
    seedDemoData();
    const state = getState();
    setStats({
      properties: Object.keys(state.properties).length,
      transfers: state.transactions.filter(t => t.type === 'TRANSFER').length,
      blocks: state.blocks.length,
    });
    setRecentTx(state.transactions.slice(-3).reverse());
  }, []);

  if (user?.role === "buyer") return <Navigate to="/buyer/search" replace />;

  const statCards = [
    { label: "Properties", value: stats.properties, icon: Building2 },
    { label: "Transfers", value: stats.transfers, icon: ArrowRightLeft },
    { label: "Blocks Mined", value: stats.blocks, icon: Blocks },
    { label: "Verified", value: stats.properties, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Blockchain-powered land registry overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <s.icon className="w-4 h-4 text-chain" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-start justify-between p-4 bg-secondary rounded-lg border border-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge type={tx.type} />
                  <span className="text-sm font-mono text-foreground">{tx.propertyId}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tx.from} → {tx.to}
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {new Date(tx.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Latest Block Hash</h2>
        <HashDisplay hash={getState().blocks[getState().blocks.length - 1]?.hash || ''} label="Chain Head" />
      </div>
    </div>
  );
}
