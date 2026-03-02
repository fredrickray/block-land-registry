import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { seedDemoData, verifyProperty, requestTransfer } from "@/lib/blockchain";

export default function TransferRequest() {
  const [propertyId, setPropertyId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [lookupDone, setLookupDone] = useState(false);
  const [propertyOwner, setPropertyOwner] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = () => {
    seedDemoData();
    const res = verifyProperty(propertyId.trim());
    if (res.found && res.property) {
      setPropertyOwner(res.property.ownerName);
      setPropertyLocation(res.property.location);
      setLookupDone(true);
      setResult(null);
    } else {
      setLookupDone(false);
      setResult({ success: false, message: "Property not found on blockchain." });
    }
  };

  const handleSubmit = () => {
    if (!buyerName.trim() || !buyerContact.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const res = requestTransfer(propertyId.trim(), buyerName.trim(), buyerContact.trim());
      setResult(res);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Request Transfer</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit a transfer request to the property owner</p>
      </div>

      {/* Step 1: Lookup */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Step 1 — Find Property</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter Property ID (e.g. PROP-001)"
            value={propertyId}
            onChange={(e) => { setPropertyId(e.target.value); setLookupDone(false); setResult(null); }}
            className="bg-secondary border-border font-mono"
          />
          <Button onClick={handleLookup} variant="outline" className="shrink-0">
            <Search className="w-4 h-4 mr-2" /> Lookup
          </Button>
        </div>
        {lookupDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary rounded-lg p-4 space-y-1 border border-border">
            <p className="text-xs font-mono text-muted-foreground">Current Owner</p>
            <p className="text-sm font-medium text-foreground">{propertyOwner}</p>
            <p className="text-xs text-muted-foreground mt-2">{propertyLocation}</p>
          </motion.div>
        )}
      </div>

      {/* Step 2: Buyer info */}
      {lookupDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Step 2 — Your Details</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="bg-secondary border-border mt-1" placeholder="Your full name" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Contact</Label>
              <Input value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} className="bg-secondary border-border mt-1" placeholder="Email or phone" />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !buyerName.trim() || !buyerContact.trim()} className="w-full">
            {loading ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Transfer Request</>}
          </Button>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-start gap-3 p-4 rounded-xl border ${result.success ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
          {result.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-sm">{result.message}</p>
        </motion.div>
      )}
    </div>
  );
}
