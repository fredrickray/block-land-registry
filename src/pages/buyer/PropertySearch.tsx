import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, User, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { seedDemoData, searchProperties, type PropertyRecord } from "@/lib/blockchain";
import HashDisplay from "@/components/HashDisplay";

export default function PropertySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertyRecord[]>([]);

  useEffect(() => {
    seedDemoData();
    setResults(searchProperties(""));
  }, []);

  useEffect(() => {
    setResults(searchProperties(query));
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Property Search</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and search registered properties</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by property ID, location, or owner..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No properties found.</div>
        ) : (
          results.map((p, i) => (
            <motion.div
              key={p.propertyId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-chain" />
                    <span className="font-mono font-bold text-foreground">{p.propertyId}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{p.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{p.ownerName}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Registered {new Date(p.registeredAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <HashDisplay hash={p.hash} label="Property Hash" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
