import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { seedDemoData, getPurchaseHistory, type Transaction } from "@/lib/blockchain";
import StatusBadge from "@/components/StatusBadge";
import HashDisplay from "@/components/HashDisplay";

export default function PurchaseHistory() {
  const [buyerName, setBuyerName] = useState("");
  const [searched, setSearched] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => { seedDemoData(); }, []);

  const handleSearch = () => {
    if (!buyerName.trim()) return;
    setTransactions(getPurchaseHistory(buyerName.trim()).reverse());
    setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Purchase History</h1>
        <p className="text-sm text-muted-foreground mt-1">View all blockchain transactions where you received property</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Enter Your Name</h2>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Fatima Bello"
            value={buyerName}
            onChange={(e) => { setBuyerName(e.target.value); setSearched(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-secondary border-border"
          />
          <Button onClick={handleSearch} variant="outline" className="shrink-0">
            <Search className="w-4 h-4 mr-2" /> Search
          </Button>
        </div>
      </div>

      {searched && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No transactions found for "{buyerName}".</div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-mono">{transactions.length} transaction{transactions.length === 1 ? '' : 's'} found</p>
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge type={tx.type} />
                      <span className="font-mono font-bold text-foreground text-sm">{tx.propertyId}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{tx.from}</span>
                    <ArrowRight className="w-3 h-3 text-chain" />
                    <span className="text-foreground font-medium">{tx.to}</span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <HashDisplay hash={tx.hash} label="Transaction Hash" />
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
