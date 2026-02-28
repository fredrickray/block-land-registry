import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollText, Blocks } from "lucide-react";
import { getAllTransactions, getBlocks, type Transaction, type Block } from "@/lib/blockchain";
import StatusBadge from "@/components/StatusBadge";
import HashDisplay from "@/components/HashDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    setTransactions(getAllTransactions().reverse());
    setBlocks(getBlocks().reverse());
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-chain" />
          Transaction History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Immutable, read-only ledger of all property transactions</p>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="transactions" className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-chain">
            Transactions ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="blocks" className="font-mono text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-chain">
            <Blocks className="w-3.5 h-3.5 mr-1.5" />
            Blocks ({blocks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 space-y-3">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge type={tx.type} />
                  <span className="text-sm font-mono text-foreground">{tx.propertyId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground">Block #{tx.blockIndex}</span>
                  <p className="text-[10px] font-mono text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-secondary px-2 py-1 rounded font-mono">{tx.from}</span>
                <span className="text-chain">→</span>
                <span className="bg-secondary px-2 py-1 rounded font-mono">{tx.to}</span>
              </div>

              <HashDisplay hash={tx.hash} label="Transaction Hash" />
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="blocks" className="mt-4 space-y-3">
          {blocks.map((block, i) => (
            <motion.div
              key={block.index}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Blocks className="w-4 h-4 text-chain" />
                  </div>
                  <div>
                    <span className="text-sm font-mono text-foreground">Block #{block.index}</span>
                    <p className="text-[10px] font-mono text-muted-foreground">{block.transactions.length} transaction(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground">Nonce: {block.nonce}</span>
                  <p className="text-[10px] font-mono text-muted-foreground">{new Date(block.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <HashDisplay hash={block.hash} label="Block Hash" />
              <HashDisplay hash={block.previousHash} label="Previous Block Hash" />
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
