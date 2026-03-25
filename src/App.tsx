import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RegisterProperty from "./pages/RegisterProperty";
import TransferOwnership from "./pages/TransferOwnership";
import VerifyOwnership from "./pages/VerifyOwnership";
import TransactionHistory from "./pages/TransactionHistory";
import ManageRequests from "./pages/ManageRequests";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import PropertySearch from "./pages/buyer/PropertySearch";
import TransferRequest from "./pages/buyer/TransferRequest";
import MyProperties from "./pages/buyer/MyProperties";
import PurchaseHistory from "./pages/buyer/PurchaseHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              {/* Seller routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<RegisterProperty />} />
              <Route path="/transfer" element={<TransferOwnership />} />
              <Route path="/verify" element={<VerifyOwnership />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              {/* Buyer routes */}
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/search" element={<PropertySearch />} />
              <Route path="/buyer/request" element={<TransferRequest />} />
              <Route path="/buyer/properties" element={<MyProperties />} />
              <Route path="/buyer/history" element={<PurchaseHistory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
