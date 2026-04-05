import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ArrowRightLeft, Blocks, ShieldCheck, Anchor } from "lucide-react";
import {
  seedDemoData,
  getState,
  getLatestAnchor,
  anchorPendingBlocks,
  type BlockchainState,
  type Transaction,
  type LedgerAnchor,
} from "@/lib/ledgerApi";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import HashDisplay from "@/components/HashDisplay";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, transfers: 0, blocks: 0 });
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [chainHeadHash, setChainHeadHash] = useState("");
  const [latestAnchor, setLatestAnchor] = useState<LedgerAnchor | null>(null);
  const [anchorBusy, setAnchorBusy] = useState(false);
  const [anchorMsg, setAnchorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await seedDemoData();
      const state: BlockchainState = await getState();
      if (cancelled) return;
      setStats({
        properties: Object.keys(state.properties).length,
        transfers: state.transactions.filter((t) => t.type === "TRANSFER").length,
        blocks: state.blocks.length,
      });
      setRecentTx(state.transactions.slice(-3).reverse());
      setChainHeadHash(state.blocks[state.blocks.length - 1]?.hash ?? "");
      try {
        const { anchor } = await getLatestAnchor();
        if (!cancelled) setLatestAnchor(anchor);
      } catch {
        /* ignore */
      }
    })().catch(() => {
      // Keep the dashboard render stable even if the backend is down.
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (user?.role === "buyer") return <Navigate to="/buyer/dashboard" replace />;

  const handleAnchor = async () => {
    setAnchorBusy(true);
    setAnchorMsg(null);
    try {
      const res = await anchorPendingBlocks();
      if (res.success && res.anchor) {
        setLatestAnchor(res.anchor);
        setAnchorMsg(res.message);
      } else {
        setAnchorMsg(res.message ?? "Nothing to anchor.");
      }
    } catch (e) {
      setAnchorMsg(e instanceof Error ? e.message : "Anchor request failed.");
    } finally {
      setAnchorBusy(false);
    }
  };

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
        <HashDisplay hash={chainHeadHash} label="Chain Head" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Anchor className="w-4 h-4 text-chain" />
              Ledger anchoring (middle path)
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Batches new blocks, computes a Merkle root, and stores it in MongoDB. If you configure{" "}
              <span className="font-mono">ETHEREUM_RPC_URL</span> and <span className="font-mono">ANCHOR_PRIVATE_KEY</span>{" "}
              on the server, the same root is also submitted on-chain (tx data).
            </p>
          </div>
          <Button type="button" variant="secondary" className="shrink-0 font-mono" disabled={anchorBusy} onClick={handleAnchor}>
            {anchorBusy ? "Anchoring…" : "Anchor pending blocks"}
          </Button>
        </div>
        {anchorMsg && <p className="text-xs text-muted-foreground">{anchorMsg}</p>}
        {latestAnchor ? (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Latest anchor</p>
            <p className="text-xs font-mono text-foreground">
              Blocks {latestAnchor.fromBlockIndex}–{latestAnchor.toBlockIndex} ({latestAnchor.blockCount} blocks) ·{" "}
              {latestAnchor.target === "ethereum" ? "MongoDB + Ethereum" : "MongoDB only"}
            </p>
            <HashDisplay hash={latestAnchor.merkleRoot} label="Merkle root" />
            {latestAnchor.chainTxHash && (
              <p className="text-[10px] font-mono text-muted-foreground break-all">
                Tx: {latestAnchor.chainTxHash}
                {latestAnchor.chainId != null ? ` · chainId ${latestAnchor.chainId}` : ""}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No anchors yet — register or seed data, then anchor.</p>
        )}
      </div>
    </div>
  );
}
