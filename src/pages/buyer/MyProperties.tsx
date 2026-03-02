import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { seedDemoData, getPropertiesByOwner, type PropertyRecord } from "@/lib/blockchain";
import HashDisplay from "@/components/HashDisplay";

export default function MyProperties() {
  const [ownerName, setOwnerName] = useState("");
  const [searched, setSearched] = useState(false);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);

  useEffect(() => { seedDemoData(); }, []);

  const handleSearch = () => {
    if (!ownerName.trim()) return;
    setProperties(getPropertiesByOwner(ownerName.trim()));
    setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">View properties you currently own on the blockchain</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Enter Owner Name</h2>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Fatima Bello"
            value={ownerName}
            onChange={(e) => { setOwnerName(e.target.value); setSearched(false); }}
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
          {properties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No properties found for "{ownerName}".</div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-mono">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'} found</p>
              {properties.map((p, i) => (
                <motion.div
                  key={p.propertyId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-chain" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-foreground">{p.propertyId}</p>
                      <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{p.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <HashDisplay hash={p.hash} label="Ownership Hash" />
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
