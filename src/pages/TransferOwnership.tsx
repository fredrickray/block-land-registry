import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, CheckCircle2, Search } from "lucide-react";
import { getAllProperties, seedDemoData, transferOwnership, type PropertyRecord, verifyProperty } from "@/lib/ledgerApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TransferOwnership() {
  const [propertyId, setPropertyId] = useState('');
  const [currentOwner, setCurrentOwner] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newContact, setNewContact] = useState('');
  const [found, setFound] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await seedDemoData();
      const all = await getAllProperties();
      if (cancelled) return;
      setProperties(all);
    })().catch(() => {
      // backend down / first run, keep form usable
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const lookupProperty = async () => {
    const res = await verifyProperty(propertyId);
    if (res.found && res.property) {
      setCurrentOwner(res.property.ownerName);
      setFound(true);
      setResult(null);
    } else {
      setCurrentOwner('');
      setFound(false);
      setResult({ success: false, message: 'Property not found on blockchain.' });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await transferOwnership(propertyId, newOwner, newContact);
    setResult(res);
    if (res.success) {
      setFound(false);
      setPropertyId('');
      setCurrentOwner('');
      setNewOwner('');
      setNewContact('');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <ArrowRightLeft className="w-6 h-6 text-chain" />
          Transfer Ownership
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Execute a smart contract to transfer property ownership</p>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${result.success ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${result.success ? 'text-success' : 'text-destructive'}`} />
            <span className={`text-sm ${result.success ? 'text-success' : 'text-destructive'}`}>{result.message}</span>
          </div>
        </motion.div>
      )}

      {/* Step 1: Lookup */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Step 1 — Lookup Property</h2>
        <div className="flex gap-3">
          <Input
            value={propertyId}
            onChange={e => { setPropertyId(e.target.value); setFound(false); }}
            placeholder="Enter Property ID"
            className="bg-secondary border-border font-mono flex-1"
            list="property-ids"
          />
          <datalist id="property-ids">
            {properties.map(p => <option key={p.propertyId} value={p.propertyId} />)}
          </datalist>
          <Button onClick={lookupProperty} variant="secondary" className="font-mono">
            <Search className="w-4 h-4 mr-2" />
            Lookup
          </Button>
        </div>

        {found && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary rounded-lg p-4 border border-border">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Current Owner</p>
            <p className="text-sm font-display text-foreground">{currentOwner}</p>
          </motion.div>
        )}
      </div>

      {/* Step 2: Transfer */}
      {found && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleTransfer}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Step 2 — New Owner Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">New Owner Name</Label>
              <Input value={newOwner} onChange={e => setNewOwner(e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Contact</Label>
              <Input value={newContact} onChange={e => setNewContact(e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>
          <Button type="submit" className="w-full font-mono tracking-wider">
            Execute Transfer Contract
          </Button>
        </motion.form>
      )}
    </div>
  );
}
