import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginAuth, meAuth, registerAuth } from "@/lib/authApi";

export type UserRole = "seller" | "buyer";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("landchain_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const token = localStorage.getItem("landchain_token");
    if (!token) {
      setLoading(false);
      return;
    }
    meAuth(token)
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem("landchain_user", JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem("landchain_token");
        localStorage.removeItem("landchain_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginAuth({ email, password });
    setUser(res.user);
    localStorage.setItem("landchain_token", res.token);
    localStorage.setItem("landchain_user", JSON.stringify(res.user));
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    const res = await registerAuth({ name, email, password, role });
    setUser(res.user);
    localStorage.setItem("landchain_token", res.token);
    localStorage.setItem("landchain_user", JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("landchain_token");
    localStorage.removeItem("landchain_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
