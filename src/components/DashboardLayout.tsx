import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Factory,
  Building2,
  Users,
  MessageSquare,
  HelpCircle,
  Diamond,
  TrendingUp,
  Plus,
  Package,
  FileText,
  Sparkles,
  Beaker,
  Globe,
  BarChart3,
  Target,
  User,
  Shield,
  ClipboardList,
  Truck,
  UserSearch,
  UserCog,
  Receipt,
  Wallet,
  Lock,
  ScrollText,
  Gavel,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useFirebaseAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case "manufacturer": return Factory;
      case "brand": return Building2;
      case "influencer": return Users;
      default: return LayoutDashboard;
    }
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case "manufacturer": return "Manufacturer";
      case "brand": return "Brand";
      case "influencer": return "Influencer";
      default: return "User";
    }
  };

  const getNavigation = () => {
    const baseNav = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ];

    const platformNav = [
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "AI Matching", href: "/ai-matching", icon: Sparkles },
      { name: "Market Intel", href: "/market-intelligence", icon: Globe },
      { name: "Ingredients", href: "/ingredients", icon: Beaker },
      { name: "Campaign Tracking", href: "/campaign-tracking", icon: Target },
      { name: "Campaign Analytics", href: "/campaign-analytics", icon: TrendingUp },
      { name: "Campaign Manager", href: "/campaign-manager", icon: Settings },
      { name: "divider", href: "#", icon: LayoutDashboard },
      { name: "Compliance", href: "/compliance", icon: Shield },
      { name: "RFQ Manager", href: "/rfq-management", icon: ClipboardList },
      { name: "Samples", href: "/sample-management", icon: Truck },
      { name: "Creator Discovery", href: "/influencer-discovery", icon: UserSearch },
      { name: "Profile Mgmt", href: "/profile-management", icon: UserCog },
      { name: "divider", href: "#", icon: LayoutDashboard },
      { name: "Invoicing", href: "/invoicing", icon: Receipt },
      { name: "Payments & Wallets", href: "/payments-wallets", icon: Wallet },
      { name: "Escrow", href: "/escrow", icon: Lock },
      { name: "Contracts", href: "/contracts", icon: ScrollText },
      { name: "Disputes", href: "/disputes", icon: Gavel },
    ];

    switch (profile?.role) {
      case "manufacturer":
        return [
          ...baseNav,
          { name: "My Profile", href: "/manufacturer/profile", icon: Factory },
          { name: "Products", href: "/manufacturer/products", icon: Package },
          { name: "RFQs", href: "/manufacturer/rfqs", icon: FileText },
          { name: "divider", href: "#", icon: LayoutDashboard },
          ...platformNav,
        ];
      case "brand":
        return [
          ...baseNav,
          { name: "Brand Profile", href: "/brand/profile", icon: Building2 },
          { name: "Find Manufacturers", href: "/brand/manufacturers", icon: Factory },
          { name: "My RFQs", href: "/brand/rfqs", icon: FileText },
          { name: "Create Campaign", href: "/brand/campaigns/create", icon: Plus },
          { name: "Applications", href: "/brand/applications", icon: Users },
          { name: "divider", href: "#", icon: LayoutDashboard },
          ...platformNav,
        ];
      case "influencer":
        return [
          ...baseNav,
          { name: "My Profile", href: "/influencer/profile", icon: User },
          { name: "Marketplace", href: "/influencer/marketplace", icon: Diamond },
          { name: "My Applications", href: "/influencer/applications", icon: FileText },
          { name: "divider", href: "#", icon: LayoutDashboard },
          ...platformNav,
        ];
      default:
        return baseNav;
    }
  };

  const navigation = getNavigation();
  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-secondary/30">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link to="/dashboard"><Logo size="sm" /></Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item, index) => {
              if (item.name === "divider") {
                return <div key={`divider-${index}`} className="my-3 border-t border-sidebar-border mx-2" />;
              }

              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border px-3 py-3">
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === "/settings"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>

          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
                <RoleIcon className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {profile?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{getRoleLabel()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
          <button className="text-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search collaborations, messages..."
                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button className="hidden sm:flex gap-2">
              <Plus className="h-4 w-4" />
              New Collaboration
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl page-transition">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <button className="fixed right-4 top-4 z-50 rounded-full bg-background p-2 shadow-lg lg:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
