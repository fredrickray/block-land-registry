import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link as LinkIcon, UserCircle2, Building2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role) return;
    login(name.trim(), email.trim(), role);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto glow-chain">
            <LinkIcon className="w-7 h-7 text-chain" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">LandChain</h1>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Blockchain Land Registry</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-display font-bold text-foreground text-center">
            {isSignup ? "Create Account" : "Sign In"}
          </h2>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-mono">I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  role === "seller"
                    ? "border-primary/50 bg-primary/10 text-chain glow-chain"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/20"
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm font-medium">Seller / Agent</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  role === "buyer"
                    ? "border-primary/50 bg-primary/10 text-chain glow-chain"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/20"
                }`}
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="text-sm font-medium">Buyer</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="bg-secondary border-border mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || !email.trim() || !role}
            className="w-full"
          >
            <UserCircle2 className="w-4 h-4 mr-2" />
            {isSignup ? "Create Account" : "Sign In"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-chain hover:underline"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>

        <p className="text-center text-[10px] text-muted-foreground font-mono">
          Simulated authentication for prototype purposes
        </p>
      </motion.div>
    </div>
  );
}
