import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTransferRequestsForSeller,
  approveTransferRequest,
  rejectTransferRequest,
  getState,
  type TransferRequest,
} from "@/lib/blockchain";

export default function ManageRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<TransferRequest[]>([]);

  const loadRequests = () => {
    if (user) setRequests(getTransferRequestsForSeller(user.name));
  };

  useEffect(loadRequests, [user]);

  const handleApprove = (id: string) => {
    const result = approveTransferRequest(id);
    toast({
      title: result.success ? "Approved" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    loadRequests();
  };

  const handleReject = (id: string) => {
    const result = rejectTransferRequest(id);
    toast({
      title: result.success ? "Rejected" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    loadRequests();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  const getPropertyLocation = (propertyId: string) => {
    const state = getState();
    return state.properties[propertyId]?.location || "Unknown";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Transfer Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve or reject buyer transfer requests</p>
      </div>

      {/* Pending Requests */}
      <div>
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-warning/30 rounded-xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-chain" />
                      <span className="text-sm font-mono font-semibold text-foreground">{req.propertyId}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{getPropertyLocation(req.propertyId)}</p>
                    <p className="text-xs text-muted-foreground">
                      Buyer: <span className="text-foreground font-medium">{req.buyerName}</span> · {req.buyerContact}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Requested {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleApprove(req.id)} className="gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} className="gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Requests */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
            Resolved ({resolved.length})
          </h2>
          <div className="space-y-3">
            {resolved.map((req) => (
              <div key={req.id} className="bg-card border border-border rounded-xl p-5 opacity-75">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground">{req.propertyId}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                          req.status === "approved"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Buyer: {req.buyerName} · {new Date(req.resolvedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
