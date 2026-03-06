import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Zap, Target, TrendingUp, Brain, Beaker, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MatchResult {
  candidateId: string;
  candidateName: string;
  matchScore: number;
  explanation: string;
  categories: string[];
  location: string;
  role: string;
}

// Weighted rule-based scoring for manufacturer fallback
function scoreManufacturer(brand: any, mfg: any): { score: number; explanation: string } {
  const brandCategories: string[] = brand?.categories || brand?.productCategories || [];
  const brandCerts: string[] = brand?.certifications || [];
  const brandLocation: string = (brand?.location || "").toLowerCase();
  const brandMoq: string = brand?.moq || brand?.annualVolume || "";

  // Category overlap (30%)
  const mfgCats: string[] = mfg.categories || [];
  const catOverlap = brandCategories.length > 0
    ? mfgCats.filter((c: string) => brandCategories.some((bc: string) => bc.toLowerCase() === c.toLowerCase())).length / Math.max(brandCategories.length, 1)
    : mfgCats.length > 0 ? 0.5 : 0.3;
  const catScore = Math.min(1, catOverlap) * 100;

  // Certifications match (25%)
  const mfgCerts: string[] = mfg.certifications || [];
  const certOverlap = brandCerts.length > 0
    ? mfgCerts.filter((c: string) => brandCerts.some((bc: string) => bc.toLowerCase() === c.toLowerCase())).length / Math.max(brandCerts.length, 1)
    : mfgCerts.length > 0 ? 0.6 : 0.2;
  const certScore = Math.min(1, certOverlap) * 100;

  // Location proximity (20%)
  const mfgLoc = (mfg.location || "").toLowerCase();
  const locScore = brandLocation && mfgLoc
    ? (mfgLoc.includes(brandLocation) || brandLocation.includes(mfgLoc) ? 100 : 40)
    : 50;

  // MOQ compatibility (15%)
  const moqScore = mfg.moq ? 70 : 50; // Basic: has MOQ info = better

  // Capacity signal (10%) - based on having description/lead time
  const capScore = (mfg.description ? 50 : 20) + (mfg.leadTime ? 30 : 0) + (mfg.categories?.length > 2 ? 20 : 0);

  const weighted = catScore * 0.3 + certScore * 0.25 + locScore * 0.2 + moqScore * 0.15 + Math.min(100, capScore) * 0.1;
  const final = Math.round(Math.min(100, Math.max(0, weighted)));

  const parts: string[] = [];
  if (catScore >= 70) parts.push(`strong category match (${mfgCats.slice(0, 2).join(", ")})`);
  if (certScore >= 70) parts.push(`${mfgCerts.length} relevant certifications`);
  if (locScore >= 80) parts.push("location aligned");
  const explanation = parts.length > 0 ? `Score driven by ${parts.join("; ")}.` : `${mfgCats.length} categories, ${mfgCerts.length} certifications available.`;

  return { score: final, explanation };
}

// Weighted rule-based scoring for influencer fallback
function scoreInfluencer(brand: any, inf: any): { score: number; explanation: string } {
  const brandIndustry = (brand?.industry || brand?.productCategory || brand?.niche || "").toLowerCase();
  const brandLocation = (brand?.location || brand?.targetMarket || "").toLowerCase();
  const brandPlatform = (brand?.targetPlatform || "").toLowerCase();

  // Niche alignment (30%)
  const niche = (inf.niche || "").toLowerCase();
  const nicheScore = brandIndustry && niche
    ? (niche.includes(brandIndustry) || brandIndustry.includes(niche) ? 90 : 45)
    : niche ? 50 : 30;

  // Engagement rate (25%) - use real data when available
  const engRate = inf.engagementRate || 0;
  const followerCount = inf.followerCount || 0;
  let engScore: number;
  if (engRate > 0) {
    // Real engagement data: 1-3% = decent, 3-6% = good, 6%+ = excellent
    engScore = Math.min(100, engRate * 15);
  } else if (followerCount > 0) {
    engScore = Math.min(100, 40 + Math.log10(followerCount) * 12);
  } else {
    engScore = 30;
  }

  // Location & audience geography (20%)
  const infLoc = (inf.location || "").toLowerCase();
  const locScore = brandLocation && infLoc
    ? (infLoc.includes(brandLocation) || brandLocation.includes(infLoc) ? 100 : 40)
    : 50;

  // Platform match (15%)
  const platform = (inf.primaryPlatform || "").toLowerCase();
  const platformScore = brandPlatform
    ? (platform === brandPlatform ? 100 : 40)
    : platform ? 60 : 30;

  // Audience demographics fit (10%)
  const hasDemographics = inf.followerDemographics && Object.keys(inf.followerDemographics).length > 0;
  const demoScore = hasDemographics ? 70 : (niche && niche !== "general" ? 50 : 30);

  const weighted = nicheScore * 0.3 + engScore * 0.25 + locScore * 0.2 + platformScore * 0.15 + demoScore * 0.1;
  const final = Math.round(Math.min(100, Math.max(0, weighted)));

  const parts: string[] = [];
  parts.push(`${inf.primaryPlatform || "Unknown"} creator`);
  if (inf.niche) parts.push(`niche: ${inf.niche}`);
  if (engRate > 0) parts.push(`${engRate}% engagement`);
  if (followerCount > 0) parts.push(`${followerCount.toLocaleString()} followers`);
  const explanation = parts.join(", ") + ". Score based on weighted criteria alignment.";
  return { score: final, explanation };
}

export default function AIMatching() {
  const { user, profile } = useFirebaseAuth();
  const { toast } = useToast();
  const [manufacturerMatches, setManufacturerMatches] = useState<MatchResult[]>([]);
  const [influencerMatches, setInfluencerMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runMatching = async () => {
    if (!user || !profile) return;
    setLoading(true);

    try {
      // Fetch brand profile for context
      let brandContext: any = {};
      if (profile.role === "brand") {
        const brandSnap = await getDocs(collection(db, "brandProfiles"));
        brandSnap.forEach(d => {
          if (d.id === user.uid) brandContext = { ...d.data(), id: d.id };
        });
      }

      // Fetch manufacturers
      const mfgSnap = await getDocs(collection(db, "manufacturerProfiles"));
      const manufacturers = mfgSnap.docs.map(d => ({
        id: d.id,
        companyName: d.data().companyName,
        categories: d.data().categories || [],
        certifications: d.data().certifications || [],
        moq: d.data().moq,
        location: d.data().location,
        description: d.data().description,
      }));

      // Fetch influencers with expanded metrics
      const infSnap = await getDocs(collection(db, "influencerProfiles"));
      const influencers = infSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
        primaryPlatform: d.data().primaryPlatform,
        niche: d.data().niche || "General",
        location: d.data().location || "Unknown",
        followerCount: d.data().followerCount || d.data().follower_count || 0,
        engagementRate: d.data().engagementRate || d.data().engagement_rate || 0,
        audienceGeography: d.data().audienceGeography || d.data().audience_geography || {},
        followerDemographics: d.data().followerDemographics || d.data().follower_demographics || {},
      }));

      // AI match manufacturers
      if (manufacturers.length > 0) {
        try {
          const { data: mfgData, error: mfgError } = await supabase.functions.invoke("ai-match", {
            body: {
              type: "manufacturer-match",
              brandProfile: brandContext,
              candidates: manufacturers,
            },
          });

          if (!mfgError && mfgData?.result) {
            try {
              const parsed = JSON.parse(mfgData.result);
              const results: MatchResult[] = parsed.map((p: any) => {
                const mfg = manufacturers.find(m => m.id === p.candidateId);
                return {
                  candidateId: p.candidateId,
                  candidateName: mfg?.companyName || p.candidateId,
                  matchScore: Math.min(100, Math.max(0, p.matchScore)),
                  explanation: p.explanation,
                  categories: mfg?.categories || [],
                  location: mfg?.location || "Unknown",
                  role: "Manufacturer",
                };
              });
              setManufacturerMatches(results.sort((a, b) => b.matchScore - a.matchScore));
            } catch {
              // Fallback: deterministic weighted scoring
              const fallback = manufacturers.map(m => {
                const { score, explanation } = scoreManufacturer(brandContext, m);
                return {
                  candidateId: m.id,
                  candidateName: m.companyName,
                  matchScore: score,
                  explanation,
                  categories: m.categories,
                  location: m.location || "Unknown",
                  role: "Manufacturer",
                };
              });
              setManufacturerMatches(fallback.sort((a, b) => b.matchScore - a.matchScore));
            }
          }
        } catch {
          // Rule-based weighted fallback
          const fallback = manufacturers.map(m => {
            const { score, explanation } = scoreManufacturer(brandContext, m);
            return {
              candidateId: m.id,
              candidateName: m.companyName,
              matchScore: score,
              explanation,
              categories: m.categories,
              location: m.location || "Unknown",
              role: "Manufacturer",
            };
          });
          setManufacturerMatches(fallback.sort((a, b) => b.matchScore - a.matchScore));
        }
      }

      // AI match influencers
      if (influencers.length > 0) {
        try {
          const { data: infData, error: infError } = await supabase.functions.invoke("ai-match", {
            body: {
              type: "influencer-match",
              brandProfile: brandContext,
              candidates: influencers,
            },
          });

          if (!infError && infData?.result) {
            try {
              const parsed = JSON.parse(infData.result);
              const results: MatchResult[] = parsed.map((p: any) => {
                const inf = influencers.find(i => i.id === p.candidateId);
                return {
                  candidateId: p.candidateId,
                  candidateName: inf?.name || p.candidateId,
                  matchScore: Math.min(100, Math.max(0, p.matchScore)),
                  explanation: p.explanation,
                  categories: [inf?.primaryPlatform || "Unknown"],
                  location: inf?.location || "Unknown",
                  role: "Influencer",
                };
              });
              setInfluencerMatches(results.sort((a, b) => b.matchScore - a.matchScore));
            } catch {
              const fallback = influencers.map(i => {
                const { score, explanation } = scoreInfluencer(brandContext, i);
                return {
                  candidateId: i.id,
                  candidateName: i.name,
                  matchScore: score,
                  explanation,
                  categories: [i.primaryPlatform],
                  location: i.location,
                  role: "Influencer",
                };
              });
              setInfluencerMatches(fallback.sort((a, b) => b.matchScore - a.matchScore));
            }
          }
        } catch {
          const fallback = influencers.map(i => {
            const { score, explanation } = scoreInfluencer(brandContext, i);
            return {
              candidateId: i.id,
              candidateName: i.name,
              matchScore: score,
              explanation,
              categories: [i.primaryPlatform],
              location: i.location,
              role: "Influencer",
            };
          });
          setInfluencerMatches(fallback.sort((a, b) => b.matchScore - a.matchScore));
        }
      }

      setLastRun(new Date());
      toast({ title: "Analysis Complete", description: "AI matching results updated." });
    } catch (err) {
      console.error("Matching error:", err);
      toast({ title: "Error", description: "Failed to run matching analysis", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const allMatches = useMemo(() =>
    [...manufacturerMatches, ...influencerMatches].sort((a, b) => b.matchScore - a.matchScore),
    [manufacturerMatches, influencerMatches]
  );

  const avgScore = allMatches.length > 0
    ? Math.round(allMatches.reduce((s, m) => s + m.matchScore, 0) / allMatches.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Matching & Formulation</h1>
                <p className="text-sm text-muted-foreground">
                  {lastRun ? `Last analysis: ${lastRun.toLocaleTimeString()}` : "Run analysis to see matches"}
                </p>
              </div>
            </div>
          </div>
          <Button className="gap-2" onClick={runMatching} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Match Score Avg", value: avgScore ? `${avgScore}%` : "—", icon: Target, color: "text-primary" },
            { label: "Manufacturers", value: String(manufacturerMatches.length), icon: Beaker, color: "text-manufacturer" },
            { label: "Influencers", value: String(influencerMatches.length), icon: TrendingUp, color: "text-influencer" },
            { label: "Total Matches", value: String(allMatches.length), icon: Zap, color: "text-warning" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Manufacturer Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Manufacturer Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {manufacturerMatches.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">Run analysis to see manufacturer matches</p>
              )}
              {loading && manufacturerMatches.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              {manufacturerMatches.map(match => (
                <div key={match.candidateId} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{match.candidateName}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{match.explanation}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {match.categories.slice(0, 3).map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                      {match.location && (
                        <Badge variant="outline" className="text-xs">{match.location}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">{match.matchScore}%</div>
                    <Progress value={match.matchScore} className="w-20 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Influencer Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-influencer" />
                Influencer Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {influencerMatches.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">Run analysis to see influencer matches</p>
              )}
              {loading && influencerMatches.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-influencer" />
                </div>
              )}
              {influencerMatches.map(match => (
                <div key={match.candidateId} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{match.candidateName}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{match.explanation}</p>
                    <div className="flex gap-1 mt-2">
                      {match.categories.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-influencer">{match.matchScore}%</div>
                    <Progress value={match.matchScore} className="w-20 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
