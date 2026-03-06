import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Edit, Save, X, Loader2, Heart, Eye, BarChart3, Star,
  FileText, Image, Globe, Briefcase, ArrowUp, ArrowDown, ArrowUpDown,
  Filter, MapPin,
} from "lucide-react";

interface InfluencerProfileData {
  name: string;
  firstName?: string;
  lastName?: string;
  primaryPlatform: string;
  bio?: string;
  niche?: string;
  audienceSize?: string;
  followerCount?: number;
  engagementRate?: string;
  engagementRateNumeric?: number;
  audienceDemographics?: string;
  audienceGeography?: Record<string, number>;
  followerDemographics?: Record<string, any>;
  pastCollaborations?: string[];
  portfolioLinks?: string[];
  website?: string;
  location?: string;
  platforms?: { name: string; followers: string; engagement: string }[];
}

type SortField = "name" | "niche" | "audienceSize" | "location";
type SortDir = "asc" | "desc";

const NICHES = ["Skincare", "Clean Beauty", "Haircare", "Makeup", "Wellness", "Fitness", "Fashion", "Lifestyle", "Other"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Twitter/X", "LinkedIn", "Other"];
const LOCATIONS = ["New York, NY", "Los Angeles, CA", "London, UK", "Paris, France", "Dubai, UAE", "Singapore", "Other"];

export default function InfluencerProfile() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<InfluencerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<InfluencerProfileData | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterNiche, setFilterNiche] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "influencerProfiles", user.uid));
        if (snap.exists()) {
          const d = snap.data() as InfluencerProfileData;
          setProfile(d);
          setFormData(d);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user || !formData) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "influencerProfiles", user.uid), { ...formData, updatedAt: serverTimestamp() });
      setProfile(formData);
      setEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></DashboardLayout>;
  if (!profile || !formData) return <DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Profile not found</p></div></DashboardLayout>;

  if (editing) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setFormData(profile); setEditing(false); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Display Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Primary Platform</Label>
                  <Select value={formData.primaryPlatform} onValueChange={(v) => setFormData({ ...formData, primaryPlatform: v })}>
                    <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Niche / Category</Label>
                  <Select value={formData.niche || ""} onValueChange={(v) => setFormData({ ...formData, niche: v })}>
                    <SelectTrigger><SelectValue placeholder="Select niche" /></SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={formData.location || ""} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={formData.bio || ""} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell brands about yourself..." rows={4} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Audience Size</Label><Input value={formData.audienceSize || ""} onChange={(e) => setFormData({ ...formData, audienceSize: e.target.value })} placeholder="e.g., 150K" /></div>
                <div className="space-y-2"><Label>Engagement Rate</Label><Input value={formData.engagementRate || ""} onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })} placeholder="e.g., 4.5%" /></div>
              </div>
              <div className="space-y-2"><Label>Audience Demographics</Label><Input value={formData.audienceDemographics || ""} onChange={(e) => setFormData({ ...formData, audienceDemographics: e.target.value })} placeholder="e.g., Women 18-34, 70% US-based" /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={formData.website || ""} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" /></div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Influencer Profile</h1>
            <p className="text-muted-foreground">Manage your creator profile</p>
          </div>
          <Button onClick={() => setEditing(true)}><Edit className="h-4 w-4 mr-2" />Edit Profile</Button>
        </div>

        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-influencer/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-influencer" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <Badge className="bg-influencer/10 text-influencer border-influencer/20">{profile.primaryPlatform}</Badge>
                  {profile.niche && <Badge variant="secondary">{profile.niche}</Badge>}
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-influencer" />Bio</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.bio || "No bio added yet. Click Edit to add your bio."}</p>
          </CardContent>
        </Card>

        {/* Filters & Sorting Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              <Select value={filterNiche} onValueChange={setFilterNiche}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Niche" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Niches</SelectItem>
                  {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                {(["name", "niche", "audienceSize", "location"] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                      sortField === field ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {field === "audienceSize" ? "Audience" : field.charAt(0).toUpperCase() + field.slice(1)}
                    <SortIcon field={field} />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Eye className="h-4 w-4" />Audience Size</div>
              <p className="mt-1 text-2xl font-bold text-foreground">{profile.audienceSize || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Heart className="h-4 w-4" />Engagement Rate</div>
              <p className="mt-1 text-2xl font-bold text-foreground">{profile.engagementRate || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" />Demographics</div>
              <p className="mt-1 text-sm font-medium text-foreground">{profile.audienceDemographics || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Star className="h-4 w-4" />Past Collaborations</div>
              <p className="mt-1 text-2xl font-bold text-foreground">{profile.pastCollaborations?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Media Kit & Portfolio */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-influencer" />Media Kit</CardTitle></CardHeader>
            <CardContent>
              <div className="h-32 rounded-lg bg-secondary/50 flex items-center justify-center border border-dashed border-border">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">Upload your media kit</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4 text-influencer" />Portfolio Gallery</CardTitle></CardHeader>
            <CardContent>
              <div className="h-32 rounded-lg bg-secondary/50 flex items-center justify-center border border-dashed border-border">
                <div className="text-center">
                  <Image className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">Add portfolio images</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
