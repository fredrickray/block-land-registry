import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function HashDisplay({ hash, label }: { hash: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-secondary rounded-lg p-3 border border-border"
    >
      {label && <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{label}</p>}
      <div className="flex items-center gap-2">
        <code className="text-xs font-mono text-chain break-all flex-1">{hash}</code>
        <button onClick={copy} className="text-muted-foreground hover:text-chain transition-colors shrink-0">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}
