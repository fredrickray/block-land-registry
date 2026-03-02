import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import RegisterProperty from "./pages/RegisterProperty";
import TransferOwnership from "./pages/TransferOwnership";
import VerifyOwnership from "./pages/VerifyOwnership";
import TransactionHistory from "./pages/TransactionHistory";
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
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterProperty />} />
            <Route path="/transfer" element={<TransferOwnership />} />
            <Route path="/verify" element={<VerifyOwnership />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/buyer/search" element={<PropertySearch />} />
            <Route path="/buyer/request" element={<TransferRequest />} />
            <Route path="/buyer/properties" element={<MyProperties />} />
            <Route path="/buyer/history" element={<PurchaseHistory />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
