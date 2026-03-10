import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SelectRole from "./pages/SelectRole";
import CreateProfile from "./pages/CreateProfile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Manufacturer Pages
import ManufacturerProfile from "./pages/manufacturer/ManufacturerProfile";
import ManufacturerProducts from "./pages/manufacturer/ManufacturerProducts";
import ManufacturerRfqs from "./pages/manufacturer/ManufacturerRfqs";

// Brand Pages
import ManufacturerDiscovery from "./pages/brand/ManufacturerDiscovery";
import ManufacturerProfileView from "./pages/brand/ManufacturerProfileView";
import BrandRfqs from "./pages/brand/BrandRfqs";
import CreateRfq from "./pages/brand/CreateRfq";
import BrandProfile from "./pages/brand/BrandProfile";
import CreateCampaign from "./pages/brand/CreateCampaign";
import BrandApplications from "./pages/brand/BrandApplications";

// Influencer Pages
import InfluencerMarketplace from "./pages/influencer/InfluencerMarketplace";
import InfluencerApplications from "./pages/influencer/InfluencerApplications";
import InfluencerProfile from "./pages/influencer/InfluencerProfile";

// Platform Pages (Phase 1 only)
import Messaging from "./pages/platform/Messaging";
import PlatformSettings from "./pages/platform/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Protected onboarding routes */}
            <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />
            <Route path="/create-profile" element={<ProtectedRoute requireRole><CreateProfile /></ProtectedRoute>} />

            {/* Protected dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute requireRole requireProfile><Dashboard /></ProtectedRoute>} />

            {/* Manufacturer routes */}
            <Route path="/manufacturer/profile" element={<ProtectedRoute requireRole requireProfile><ManufacturerProfile /></ProtectedRoute>} />
            <Route path="/manufacturer/products" element={<ProtectedRoute requireRole requireProfile><ManufacturerProducts /></ProtectedRoute>} />
            <Route path="/manufacturer/rfqs" element={<ProtectedRoute requireRole requireProfile><ManufacturerRfqs /></ProtectedRoute>} />

            {/* Brand routes */}
            <Route path="/brand/profile" element={<ProtectedRoute requireRole requireProfile><BrandProfile /></ProtectedRoute>} />
            <Route path="/brand/manufacturers" element={<ProtectedRoute requireRole requireProfile><ManufacturerDiscovery /></ProtectedRoute>} />
            <Route path="/brand/manufacturers/:manufacturerId" element={<ProtectedRoute requireRole requireProfile><ManufacturerProfileView /></ProtectedRoute>} />
            <Route path="/brand/rfqs" element={<ProtectedRoute requireRole requireProfile><BrandRfqs /></ProtectedRoute>} />
            <Route path="/brand/rfqs/create" element={<ProtectedRoute requireRole requireProfile><CreateRfq /></ProtectedRoute>} />
            <Route path="/brand/campaigns/create" element={<ProtectedRoute requireRole requireProfile><CreateCampaign /></ProtectedRoute>} />
            <Route path="/brand/applications" element={<ProtectedRoute requireRole requireProfile><BrandApplications /></ProtectedRoute>} />

            {/* Influencer routes */}
            <Route path="/influencer/profile" element={<ProtectedRoute requireRole requireProfile><InfluencerProfile /></ProtectedRoute>} />
            <Route path="/influencer/marketplace" element={<ProtectedRoute requireRole requireProfile><InfluencerMarketplace /></ProtectedRoute>} />
            <Route path="/influencer/applications" element={<ProtectedRoute requireRole requireProfile><InfluencerApplications /></ProtectedRoute>} />

            {/* Platform-wide routes (Phase 1) */}
            <Route path="/messages" element={<ProtectedRoute requireRole requireProfile><Messaging /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requireRole requireProfile><PlatformSettings /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);

export default App;