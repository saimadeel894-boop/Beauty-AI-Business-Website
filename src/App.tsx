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

// Platform Pages
import AIMatching from "./pages/platform/AIMatching";
import Messaging from "./pages/platform/Messaging";
import PlatformSettings from "./pages/platform/Settings";
import CampaignTracking from "./pages/platform/CampaignTracking";
import CampaignManager from "./pages/platform/CampaignManager";
import MarketIntelligence from "./pages/platform/MarketIntelligence";
import IngredientDatabase from "./pages/platform/IngredientDatabase";
import Analytics from "./pages/platform/Analytics";
import CampaignAnalytics from "./pages/platform/CampaignAnalytics";
import RegulatoryCompliance from "./pages/platform/RegulatoryCompliance";
import RfqManagement from "./pages/platform/RfqManagement";
import SampleManagement from "./pages/platform/SampleManagement";
import InfluencerDiscovery from "./pages/platform/InfluencerDiscovery";
import UserProfileManagement from "./pages/platform/UserProfileManagement";
import InvoicingPayments from "./pages/platform/InvoicingPayments";
import PaymentsWallets from "./pages/platform/PaymentsWallets";
import EscrowPayment from "./pages/platform/EscrowPayment";
import ContractGeneration from "./pages/platform/ContractGeneration";
import DisputeResolution from "./pages/platform/DisputeResolution";

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

            {/* Platform-wide routes */}
            <Route path="/messages" element={<ProtectedRoute requireRole requireProfile><Messaging /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute requireRole requireProfile><Analytics /></ProtectedRoute>} />
            <Route path="/campaign-analytics" element={<ProtectedRoute requireRole requireProfile><CampaignAnalytics /></ProtectedRoute>} />
            <Route path="/ai-matching" element={<ProtectedRoute requireRole requireProfile><AIMatching /></ProtectedRoute>} />
            <Route path="/market-intelligence" element={<ProtectedRoute requireRole requireProfile><MarketIntelligence /></ProtectedRoute>} />
            <Route path="/ingredients" element={<ProtectedRoute requireRole requireProfile><IngredientDatabase /></ProtectedRoute>} />
            <Route path="/campaign-tracking" element={<ProtectedRoute requireRole requireProfile><CampaignTracking /></ProtectedRoute>} />
            <Route path="/campaign-manager" element={<ProtectedRoute requireRole requireProfile><CampaignManager /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requireRole requireProfile><PlatformSettings /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute requireRole requireProfile><RegulatoryCompliance /></ProtectedRoute>} />
            <Route path="/rfq-management" element={<ProtectedRoute requireRole requireProfile><RfqManagement /></ProtectedRoute>} />
            <Route path="/sample-management" element={<ProtectedRoute requireRole requireProfile><SampleManagement /></ProtectedRoute>} />
            <Route path="/influencer-discovery" element={<ProtectedRoute requireRole requireProfile><InfluencerDiscovery /></ProtectedRoute>} />
            <Route path="/profile-management" element={<ProtectedRoute requireRole requireProfile><UserProfileManagement /></ProtectedRoute>} />
            <Route path="/invoicing" element={<ProtectedRoute requireRole requireProfile><InvoicingPayments /></ProtectedRoute>} />
            <Route path="/payments-wallets" element={<ProtectedRoute requireRole requireProfile><PaymentsWallets /></ProtectedRoute>} />
            <Route path="/escrow" element={<ProtectedRoute requireRole requireProfile><EscrowPayment /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute requireRole requireProfile><ContractGeneration /></ProtectedRoute>} />
            <Route path="/disputes" element={<ProtectedRoute requireRole requireProfile><DisputeResolution /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);

export default App;
