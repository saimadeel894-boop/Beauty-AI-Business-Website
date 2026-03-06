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
  Building2, Edit, Save, X, Loader2, MapPin, Globe, Users, Target,
  ShoppingBag, Truck, BarChart3, Image, FileText, Briefcase,
  ArrowUp, ArrowDown, ArrowUpDown, Filter,
} from "lucide-react";

interface BrandProfileData {
  brandName: string;
  firstName?: string;
  lastName?: string;
  industry: string;
  brandStory?: string;
  targetMarket?: string;
  productCategories?: string[];
  productCategory?: string;
  ingredientPreferences?: string;
  pricingPositioning?: string;
  annualVolume?: string;
  distributionChannels?: string[];
  collaborationInterests?: string[];
  website?: string;
  location?: string;
  foundedYear?: string;
}

type SortField = "brandName" | "industry" | "location" | "foundedYear";
type SortDir = "asc" | "desc";

const INDUSTRIES = ["Skincare", "Haircare", "Makeup", "Fragrances", "Body Care", "Wellness", "Supplements", "Other"];
const LOCATIONS = ["New York, NY", "Los Angeles, CA", "London, UK", "Paris, France", "Dubai, UAE", "Singapore", "Other"];

export default function BrandProfile() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BrandProfileData | null>(null);
  const [sortField, setSortField] = useState<SortField>("brandName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");

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
        const snap = await getDoc(doc(db, "brandProfiles", user.uid));
        if (snap.exists()) {
          const d = snap.data() as BrandProfileData;
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
      await updateDoc(doc(db, "brandProfiles", user.uid), { ...formData, updatedAt: serverTimestamp() });
      setProfile(formData);
      setEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Detail cards data for sorting
  const detailCards = useMemo(() => {
    if (!profile) return [];
    const cards = [
      { key: "brandName", label: "Brand Name", value: profile.brandName, icon: Building2 },
      { key: "industry", label: "Industry", value: profile.industry, icon: Target },
      { key: "location", label: "Location", value: profile.location || "Not specified", icon: MapPin },
      { key: "foundedYear", label: "Founded Year", value: profile.foundedYear || "Not specified", icon: BarChart3 },
    ];

    // Apply filters
    let filtered = cards;
    if (filterIndustry !== "all") {
      filtered = filtered.filter((c) => c.key !== "industry" || c.value.toLowerCase().includes(filterIndustry.toLowerCase()));
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a.value.toLowerCase();
      const bVal = b.value.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [profile, sortField, sortDir, filterIndustry]);

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></DashboardLayout>;
  }

  if (!profile || !formData) {
    return <DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Profile not found</p></div></DashboardLayout>;
  }

  if (editing) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Edit Brand Profile</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setFormData(profile); setEditing(false); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Brand Name</Label><Input value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={formData.location || ""} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Founded Year</Label><Input value={formData.foundedYear || ""} onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })} placeholder="e.g., 2020" /></div>
              </div>
              <div className="space-y-2"><Label>Website</Label><Input value={formData.website || ""} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" /></div>
              <div className="space-y-2"><Label>Brand Story</Label><Textarea value={formData.brandStory || ""} onChange={(e) => setFormData({ ...formData, brandStory: e.target.value })} placeholder="Tell the story of your brand..." rows={4} /></div>
              <div className="space-y-2"><Label>Target Market</Label><Input value={formData.targetMarket || ""} onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })} placeholder="e.g., Women 25-45, luxury segment" /></div>
              <div className="space-y-2"><Label>Annual Volume</Label><Input value={formData.annualVolume || ""} onChange={(e) => setFormData({ ...formData, annualVolume: e.target.value })} placeholder="e.g., 100,000+ units" /></div>
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
            <h1 className="text-2xl font-bold text-foreground">Brand Profile</h1>
            <p className="text-muted-foreground">Manage your brand's public profile</p>
          </div>
          <Button onClick={() => setEditing(true)}><Edit className="h-4 w-4 mr-2" />Edit Profile</Button>
        </div>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-brand/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-brand" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile.brandName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary">{profile.industry}</Badge>
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>}
                  {profile.foundedYear && <span>Founded {profile.foundedYear}</span>}
                </div>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                    <Globe className="h-3 w-3" />{profile.website}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Story */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-brand" />Brand Story</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.brandStory || "No brand story added yet. Click Edit to add your brand's story."}</p>
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
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                {(["brandName", "industry", "location", "foundedYear"] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                      sortField === field ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {field === "brandName" ? "Name" : field === "foundedYear" ? "Year" : field.charAt(0).toUpperCase() + field.slice(1)}
                    <SortIcon field={field} />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Details */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-brand" />Target Market</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{profile.targetMarket || "Not specified"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-brand" />Annual Volume</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{profile.annualVolume || "Not specified"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-brand" />Product Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {(profile.productCategories?.length ?? 0) > 0 ? profile.productCategories!.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>) : <span className="text-sm text-muted-foreground">Not specified</span>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-brand" />Distribution Channels</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {(profile.distributionChannels?.length ?? 0) > 0 ? profile.distributionChannels!.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>) : <span className="text-sm text-muted-foreground">Not specified</span>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-brand" />Collaboration Interests</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {(profile.collaborationInterests?.length ?? 0) > 0 ? profile.collaborationInterests!.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>) : <span className="text-sm text-muted-foreground">Not specified</span>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4 text-brand" />Media Assets</CardTitle></CardHeader>
            <CardContent>
              <div className="h-24 rounded-lg bg-secondary/50 flex items-center justify-center border border-dashed border-border">
                <p className="text-xs text-muted-foreground">Upload media assets</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
