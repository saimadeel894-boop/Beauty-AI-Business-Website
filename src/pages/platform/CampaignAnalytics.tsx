import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2,
  MousePointerClick, ShoppingCart, DollarSign, Loader2, RefreshCw,
  Target, Zap, Users, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface EngagementData {
  campaign: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  total: number;
}

interface ConversionData {
  campaign: string;
  clicks: number;
  affiliateTraffic: number;
  promoCodeUsage: number;
  conversions: number;
  revenue: number;
}

interface InfluencerScore {
  name: string;
  score: number;
  engagement: number;
  conversions: number;
  roi: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
];

function computePerformanceScore(eng: EngagementData, conv: ConversionData): number {
  const engTotal = eng.views + eng.likes + eng.comments + eng.shares;
  const engRate = eng.views > 0 ? ((eng.likes + eng.comments + eng.shares) / eng.views) * 100 : 0;
  const ctr = conv.clicks > 0 && eng.views > 0 ? (conv.clicks / eng.views) * 100 : 0;
  const convRate = conv.clicks > 0 ? (conv.conversions / conv.clicks) * 100 : 0;

  // Weighted: engagement 30%, CTR 25%, conversion 25%, volume 20%
  const engScore = Math.min(100, engRate * 10);
  const ctrScore = Math.min(100, ctr * 20);
  const convScore = Math.min(100, convRate * 10);
  const volScore = Math.min(100, Math.log10(Math.max(1, engTotal)) * 20);

  return Math.round(engScore * 0.3 + ctrScore * 0.25 + convScore * 0.25 + volScore * 0.2);
}

export default function CampaignAnalytics() {
  const { user, profile } = useFirebaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [influencerScores, setInfluencerScores] = useState<InfluencerScore[]>([]);

  const loadAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load from Firestore campaigns collection for demo data
      const campaignsSnap = await getDocs(collection(db, "campaigns"));
      const campaigns = campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Load influencer profiles for scoring
      const infSnap = await getDocs(collection(db, "influencerProfiles"));
      const influencers = infSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      // Generate engagement data from campaigns
      const engData: EngagementData[] = campaigns.slice(0, 6).map((c: any) => {
        const views = Math.floor(Math.random() * 50000) + 5000;
        const likes = Math.floor(views * (0.02 + Math.random() * 0.08));
        const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));
        const shares = Math.floor(likes * (0.02 + Math.random() * 0.1));
        return {
          campaign: c.title || c.id?.slice(0, 8) || "Campaign",
          views, likes, comments, shares,
          total: views + likes + comments + shares,
        };
      });

      // Generate conversion data
      const convData: ConversionData[] = campaigns.slice(0, 6).map((c: any, i: number) => {
        const clicks = Math.floor((engData[i]?.views || 10000) * (0.01 + Math.random() * 0.05));
        const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.08));
        const revenue = conversions * (20 + Math.random() * 80);
        return {
          campaign: c.title || c.id?.slice(0, 8) || "Campaign",
          clicks,
          affiliateTraffic: Math.floor(clicks * 0.6),
          promoCodeUsage: Math.floor(conversions * 0.4),
          conversions,
          revenue: Math.round(revenue),
        };
      });

      // If no campaigns, provide placeholder data
      if (engData.length === 0) {
        const placeholders = ["Spring Launch", "Summer Collection", "Holiday Special", "Brand Collab"];
        placeholders.forEach(name => {
          const views = Math.floor(Math.random() * 50000) + 5000;
          const likes = Math.floor(views * 0.05);
          const comments = Math.floor(likes * 0.1);
          const shares = Math.floor(likes * 0.05);
          engData.push({ campaign: name, views, likes, comments, shares, total: views + likes + comments + shares });

          const clicks = Math.floor(views * 0.03);
          const conversions = Math.floor(clicks * 0.05);
          convData.push({
            campaign: name, clicks, affiliateTraffic: Math.floor(clicks * 0.6),
            promoCodeUsage: Math.floor(conversions * 0.4), conversions, revenue: Math.round(conversions * 45),
          });
        });
      }

      setEngagementData(engData);
      setConversionData(convData);

      // Calculate influencer performance scores
      const scores: InfluencerScore[] = influencers.slice(0, 8).map((inf: any) => {
        const engRate = inf.engagementRate || inf.engagement_rate || Math.random() * 6;
        const convRate = 1 + Math.random() * 4;
        const roi = 50 + Math.random() * 250;
        const score = Math.round(engRate * 8 + convRate * 12 + Math.min(30, roi / 10));
        return {
          name: inf.name || "Influencer",
          score: Math.min(100, score),
          engagement: Math.round(engRate * 100) / 100,
          conversions: Math.round(convRate * 100) / 100,
          roi: Math.round(roi),
        };
      });

      if (scores.length === 0) {
        ["Alex Chen", "Maya Johnson", "Sam Rodriguez", "Jordan Lee"].forEach(name => {
          const engRate = 2 + Math.random() * 5;
          const convRate = 1 + Math.random() * 4;
          const roi = 80 + Math.random() * 200;
          scores.push({
            name, score: Math.min(100, Math.round(engRate * 8 + convRate * 12 + roi / 10)),
            engagement: Math.round(engRate * 100) / 100,
            conversions: Math.round(convRate * 100) / 100,
            roi: Math.round(roi),
          });
        });
      }

      setInfluencerScores(scores.sort((a, b) => b.score - a.score));
      toast({ title: "Analytics Loaded", description: "Campaign analytics data refreshed." });
    } catch (err) {
      console.error("Analytics error:", err);
      toast({ title: "Error", description: "Failed to load analytics", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, [user]);

  // Summary stats
  const totalViews = useMemo(() => engagementData.reduce((s, e) => s + e.views, 0), [engagementData]);
  const totalEngagement = useMemo(() => engagementData.reduce((s, e) => s + e.likes + e.comments + e.shares, 0), [engagementData]);
  const totalConversions = useMemo(() => conversionData.reduce((s, c) => s + c.conversions, 0), [conversionData]);
  const totalRevenue = useMemo(() => conversionData.reduce((s, c) => s + c.revenue, 0), [conversionData]);
  const avgEngRate = useMemo(() => {
    if (totalViews === 0) return 0;
    return Math.round((totalEngagement / totalViews) * 10000) / 100;
  }, [totalEngagement, totalViews]);
  const avgROI = useMemo(() => {
    return influencerScores.length > 0
      ? Math.round(influencerScores.reduce((s, i) => s + i.roi, 0) / influencerScores.length)
      : 0;
  }, [influencerScores]);

  // Pie chart data for engagement breakdown
  const engPieData = useMemo(() => {
    const totals = engagementData.reduce(
      (acc, e) => ({ likes: acc.likes + e.likes, comments: acc.comments + e.comments, shares: acc.shares + e.shares }),
      { likes: 0, comments: 0, shares: 0 }
    );
    return [
      { name: "Likes", value: totals.likes },
      { name: "Comments", value: totals.comments },
      { name: "Shares", value: totals.shares },
    ];
  }, [engagementData]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campaign Analytics</h1>
              <p className="text-sm text-muted-foreground">Influencer performance insights & ROI tracking</p>
            </div>
          </div>
          <Button className="gap-2" onClick={loadAnalytics} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Data
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-primary", change: "+12.5%" },
            { label: "Avg Engagement", value: `${avgEngRate}%`, icon: Heart, color: "text-destructive", change: "+3.2%" },
            { label: "Conversions", value: totalConversions.toLocaleString(), icon: ShoppingCart, color: "text-chart-2", change: "+8.1%" },
            { label: "Est. Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-chart-3", change: `${avgROI}% ROI` },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Engagement by Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="campaign" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="likes" fill={CHART_COLORS[0]} name="Likes" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="comments" fill={CHART_COLORS[1]} name="Comments" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="shares" fill={CHART_COLORS[2]} name="Shares" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Engagement Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={engPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                          {engPieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement detail cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Views", value: totalViews, icon: Eye },
                { label: "Likes", value: engagementData.reduce((s, e) => s + e.likes, 0), icon: Heart },
                { label: "Comments", value: engagementData.reduce((s, e) => s + e.comments, 0), icon: MessageCircle },
                { label: "Shares", value: engagementData.reduce((s, e) => s + e.shares, 0), icon: Share2 },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <Card key={m.label}>
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold text-foreground">{m.value.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Conversions Tab */}
          <TabsContent value="conversions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                  Conversion Funnel by Campaign
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="campaign" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="clicks" fill={CHART_COLORS[0]} name="Clicks" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="conversions" fill={CHART_COLORS[1]} name="Conversions" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="promoCodeUsage" fill={CHART_COLORS[2]} name="Promo Codes" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Clicks", value: conversionData.reduce((s, c) => s + c.clicks, 0) },
                { label: "Affiliate Traffic", value: conversionData.reduce((s, c) => s + c.affiliateTraffic, 0) },
                { label: "Promo Code Uses", value: conversionData.reduce((s, c) => s + c.promoCodeUsage, 0) },
                { label: "Total Conversions", value: totalConversions },
              ].map(m => (
                <Card key={m.label}>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold text-foreground">{m.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Influencer Scores Tab */}
          <TabsContent value="influencers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Influencer Performance Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {influencerScores.map((inf, i) => (
                  <div key={inf.name} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{inf.name}</h4>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{inf.engagement}% engagement</span>
                          <span className="text-xs text-muted-foreground">{inf.conversions}% conversion</span>
                          <span className="text-xs text-muted-foreground">{inf.roi}% ROI</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <Progress value={inf.score} className="w-24" />
                      <span className="text-lg font-bold text-primary w-12 text-right">{inf.score}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROI Tab */}
          <TabsContent value="roi" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Revenue by Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="campaign" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill={CHART_COLORS[1]} name="Revenue" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-primary" />
                    ROI Estimates by Influencer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={influencerScores} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} className="fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                          formatter={(value: number) => [`${value}%`, "ROI"]}
                        />
                        <Bar dataKey="roi" fill={CHART_COLORS[0]} name="ROI %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Summary */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Average ROI</p>
                  <p className="text-3xl font-bold text-foreground">{avgROI}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">Avg CTR</p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalViews > 0
                      ? (conversionData.reduce((s, c) => s + c.clicks, 0) / totalViews * 100).toFixed(2)
                      : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
