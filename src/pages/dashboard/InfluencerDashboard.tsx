import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInfluencerMarketplace } from "@/hooks/useInfluencerMarketplace";
import { ApplicationStatusBadge } from "@/components/influencer/ApplicationStatusBadge";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Megaphone, Package, FileCheck, ArrowRight, CheckCircle, Mail,
  Loader2, User, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InfluencerProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  primaryPlatform: string;
}

export default function InfluencerDashboard() {
  const { user, profile: authProfile } = useFirebaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const { campaigns, whiteLabelOffers, applications, loading } = useInfluencerMarketplace();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const profileDoc = await getDoc(doc(db, "influencerProfiles", user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({ name: data.name, firstName: data.firstName, lastName: data.lastName, primaryPlatform: data.primaryPlatform });
        }
      } catch (error) {
        console.error("Error fetching influencer profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const displayName = profile?.firstName || profile?.name || authProfile?.email?.split("@")[0] || "User";
  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const acceptedApps = applications.filter((a) => a.status === "accepted").length;
  const rejectedApps = applications.filter((a) => a.status === "rejected").length;

  const stats = [
    { label: "Available Campaigns", value: String(campaigns.length), icon: Megaphone, color: "text-primary", href: "/influencer/marketplace" },
    { label: "White-Label Offers", value: String(whiteLabelOffers.length), icon: Package, color: "text-manufacturer", href: "/influencer/marketplace" },
    { label: "My Applications", value: String(applications.length), icon: FileCheck, color: "text-influencer", href: "/influencer/applications" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {displayName}!</h1>
            <p className="mt-1 text-muted-foreground">Here's a summary of your collaborations and marketplace opportunities.</p>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(stat.href)}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-auto p-6 justify-start" onClick={() => navigate("/influencer/marketplace")}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3"><Megaphone className="h-6 w-6 text-primary" /></div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Browse Marketplace</p>
                  <p className="text-sm text-muted-foreground">Discover campaigns & offers</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-6 justify-start" onClick={() => navigate("/influencer/applications")}>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-influencer/10 p-3"><FileCheck className="h-6 w-6 text-influencer" /></div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">My Applications</p>
                  <p className="text-sm text-muted-foreground">{pendingApps} pending · {acceptedApps} accepted</p>
                </div>
              </div>
            </Button>
          </div>

          {/* Recent Applications */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
              {applications.length > 0 && (
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/influencer/applications")}>
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            {applications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No applications yet. Browse the marketplace to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Opportunity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id} className="hover:bg-secondary/50 cursor-pointer" onClick={() => navigate("/influencer/applications")}>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{app.targetTitle}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{app.targetType === "whiteLabelOffer" ? "White-Label" : "Campaign"}</td>
                        <td className="px-6 py-4"><ApplicationStatusBadge status={app.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full xl:w-80 space-y-6">
          {/* Application summary */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Application Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /><span className="text-sm text-foreground">Accepted</span></div>
                <span className="text-sm font-bold text-foreground">{acceptedApps}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-warning" /><span className="text-sm text-foreground">Pending</span></div>
                <span className="text-sm font-bold text-foreground">{pendingApps}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /><span className="text-sm text-foreground">Rejected</span></div>
                <span className="text-sm font-bold text-foreground">{rejectedApps}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/influencer/profile")}>
                <User className="mr-3 h-4 w-4 text-influencer" />My Profile
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/influencer/marketplace")}>
                <Megaphone className="mr-3 h-4 w-4 text-primary" />Marketplace
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/influencer/applications")}>
                <FileCheck className="mr-3 h-4 w-4 text-primary" />My Applications
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/analytics")}>
                <BarChart3 className="mr-3 h-4 w-4 text-primary" />Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/campaign-tracking")}>
                <Target className="mr-3 h-4 w-4 text-primary" />Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
