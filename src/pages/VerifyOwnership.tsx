import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Search, CheckCircle2, XCircle } from "lucide-react";
import { verifyProperty, type PropertyRecord, type Transaction } from "@/lib/blockchain";
import HashDisplay from "@/components/HashDisplay";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyOwnership() {
  const [propertyId, setPropertyId] = useState('');
  const [searched, setSearched] = useState(false);
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [verified, setVerified] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const handleVerify = () => {
    const res = verifyProperty(propertyId);
    setSearched(true);
    if (res.found && res.property) {
      setProperty(res.property);
      setVerified(res.verified);
      setTxs(res.transactions);
    } else {
      setProperty(null);
      setVerified(false);
      setTxs([]);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-chain" />
          Verify Ownership
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verify property records against the blockchain</p>
      </div>

      <div className="flex gap-3">
        <Input
          value={propertyId}
          onChange={e => { setPropertyId(e.target.value); setSearched(false); }}
          placeholder="Enter Property ID (e.g. PROP-001)"
          className="bg-secondary border-border font-mono flex-1"
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />
        <Button onClick={handleVerify} className="font-mono">
          <Search className="w-4 h-4 mr-2" />
          Verify
        </Button>
      </div>

      {searched && !property && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-center">
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive">No property found with ID "{propertyId}"</p>
        </motion.div>
      )}

      {property && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Verification Status */}
          <div className={`rounded-xl p-5 border ${verified ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className={`w-6 h-6 ${verified ? 'text-success' : 'text-destructive'}`} />
              <span className={`text-lg font-display font-bold ${verified ? 'text-success' : 'text-destructive'}`}>
                {verified ? 'Verified on Blockchain' : 'Verification Failed'}
              </span>
            </div>
            <HashDisplay hash={property.hash} label="Blockchain Hash" />
          </div>

          {/* Property Details */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Property ID', value: property.propertyId },
                { label: 'Owner', value: property.ownerName },
                { label: 'Location', value: property.location },
                { label: 'Contact', value: property.ownerContact },
                { label: 'Registered', value: new Date(property.registeredAt).toLocaleDateString() },
              ].map(item => (
                <div key={item.label} className={item.label === 'Location' ? 'col-span-2' : ''}>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-foreground mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Trail */}
          {txs.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Ownership Trail</h2>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <StatusBadge type={tx.type} />
                      <span className="text-xs text-muted-foreground">{tx.from} → {tx.to}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
