import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Clock, CheckCircle, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPropertiesByOwner, getPurchaseHistory, getTransferRequests, seedDemoData, type PropertyRecord, type Transaction, type TransferRequest } from "@/lib/ledgerApi";
import StatusBadge from "@/components/StatusBadge";
import HashDisplay from "@/components/HashDisplay";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [ownedProperties, setOwnedProperties] = useState<PropertyRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TransferRequest[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      await seedDemoData();
      const [owned, allRequests, purchaseHistory] = await Promise.all([
        getPropertiesByOwner(user.name),
        getTransferRequests(),
        getPurchaseHistory(user.name),
      ]);
      if (cancelled) return;
      setOwnedProperties(owned);
      setPendingRequests(
        allRequests.filter(
          (r) =>
            r.buyerName.toLowerCase() === user.name.toLowerCase() &&
            r.status === "pending",
        ),
      );
      setRecentPurchases(purchaseHistory.slice(-3).reverse());
    })().catch(() => {
      // ignore backend failure
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const statCards = [
    { label: "Owned Properties", value: ownedProperties.length, icon: Building2 },
    { label: "Pending Requests", value: pendingRequests.length, icon: Clock },
    { label: "Total Purchases", value: recentPurchases.length, icon: CheckCircle },
    { label: "Available to Browse", value: "∞", icon: Search },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Your property portfolio at a glance</p>
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

      {pendingRequests.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Pending Transfer Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border">
                <div className="space-y-1">
                  <span className="text-sm font-mono text-foreground">{req.propertyId}</span>
                  <p className="text-xs text-muted-foreground">Requested {new Date(req.requestedAt).toLocaleDateString()}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ownedProperties.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">My Properties</h2>
          <div className="space-y-3">
            {ownedProperties.map((p) => (
              <div key={p.propertyId} className="p-4 bg-secondary rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-foreground">{p.propertyId}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{new Date(p.registeredAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.location}</p>
                <HashDisplay hash={p.hash} label="Property Hash" />
              </div>
            ))}
          </div>
        </div>
      )}

      {recentPurchases.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Recent Purchases</h2>
          <div className="space-y-3">
            {recentPurchases.map((tx) => (
              <div key={tx.id} className="flex items-start justify-between p-4 bg-secondary rounded-lg border border-border">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge type={tx.type} />
                    <span className="text-sm font-mono text-foreground">{tx.propertyId}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tx.from} → {tx.to}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
