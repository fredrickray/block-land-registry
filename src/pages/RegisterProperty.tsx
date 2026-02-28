import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Hash, CheckCircle2 } from "lucide-react";
import { registerProperty, generateHash } from "@/lib/blockchain";
import HashDisplay from "@/components/HashDisplay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterProperty() {
  const [form, setForm] = useState({ propertyId: '', location: '', ownerName: '', ownerContact: '' });
  const [previewHash, setPreviewHash] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; hash?: string } | null>(null);

  const update = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (next.propertyId && next.location && next.ownerName) {
      setPreviewHash(generateHash(JSON.stringify(next)));
    } else {
      setPreviewHash('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerProperty(form.propertyId, form.location, form.ownerName, form.ownerContact);
    setResult(res);
    if (res.success) {
      setForm({ propertyId: '', location: '', ownerName: '', ownerContact: '' });
      setPreviewHash('');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Building2 className="w-6 h-6 text-chain" />
          Register Property
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Store a tamper-proof property record on the blockchain</p>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Property ID</Label>
            <Input
              value={form.propertyId}
              onChange={e => update('propertyId', e.target.value)}
              placeholder="e.g. PROP-004"
              required
              className="bg-secondary border-border font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Owner Name</Label>
            <Input
              value={form.ownerName}
              onChange={e => update('ownerName', e.target.value)}
              placeholder="Full legal name"
              required
              className="bg-secondary border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Location</Label>
          <Textarea
            value={form.location}
            onChange={e => update('location', e.target.value)}
            placeholder="Plot number, street, area, city"
            required
            className="bg-secondary border-border resize-none"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Owner Contact</Label>
          <Input
            value={form.ownerContact}
            onChange={e => update('ownerContact', e.target.value)}
            placeholder="Email or phone"
            className="bg-secondary border-border"
          />
        </div>

        {previewHash && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-chain" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Generated Hash Preview</span>
            </div>
            <HashDisplay hash={previewHash} />
          </div>
        )}

        <Button type="submit" className="w-full font-mono tracking-wider">
          Register on Blockchain
        </Button>
      </form>
    </div>
  );
}
