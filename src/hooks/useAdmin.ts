import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  return { isAdmin, loading };
}

interface AdminUser {
  id: string;
  email: string;
  role: string | null;
  status: string;
  profile_completed: boolean;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeManufacturers: number;
  activeBrands: number;
  activeInfluencers: number;
  totalTransactions: number;
  totalVolume: number;
  platformFees: number;
  totalRfqs: number;
  totalMatches: number;
  totalAnalyses: number;
}

export function useAdminDashboard() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, activeManufacturers: 0, activeBrands: 0, activeInfluencers: 0,
    totalTransactions: 0, totalVolume: 0, platformFees: 0, totalRfqs: 0,
    totalMatches: 0, totalAnalyses: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        profilesRes, txRes, milestonesRes, matchesRes, rfqsRes, analysesRes,
        mfgRes, brandRes, infRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("escrow_milestones").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("ai_matches").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("rfqs").select("*"),
        supabase.from("formulation_analyses" as any).select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("manufacturer_profiles").select("id"),
        supabase.from("brand_profiles").select("id"),
        supabase.from("influencer_profiles").select("id"),
      ]);

      const profiles = profilesRes.data || [];
      const txData = txRes.data || [];
      const milestoneData = milestonesRes.data || [];
      const matchData = matchesRes.data || [];
      const analysisData = analysesRes.data || [];

      setUsers(profiles.map((p: any) => ({
        id: p.id, email: p.email, role: p.role,
        status: p.status || "active",
        profile_completed: p.profile_completed, created_at: p.created_at,
      })));
      setTransactions(txData);
      setMilestones(milestoneData);
      setMatches(matchData);
      setAnalyses(analysisData);

      const totalVolume = txData.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const platformFees = txData.reduce((sum: number, t: any) => sum + Number(t.platform_fee || 0), 0);

      setStats({
        totalUsers: profiles.length,
        activeManufacturers: (mfgRes.data || []).length,
        activeBrands: (brandRes.data || []).length,
        activeInfluencers: (infRes.data || []).length,
        totalTransactions: txData.length,
        totalVolume,
        platformFees,
        totalRfqs: (rfqsRes.data || []).length,
        totalMatches: matchData.length,
        totalAnalyses: analysisData.length,
      });
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast({ title: "Error", description: "Failed to load admin data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { users, stats, transactions, milestones, matches, analyses, loading, refetch: fetchAll };
}

export function useAdminUserActions(onSuccess?: () => void) {
  const { toast } = useToast();
  const [acting, setActing] = useState(false);

  const updateUserStatus = useCallback(async (userId: string, action: "suspend" | "approve" | "reactivate") => {
    setActing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("admin-update-user", {
        body: { userId, action },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      const labels = { suspend: "suspended", approve: "approved", reactivate: "reactivated" };
      toast({ title: "Success", description: `User ${labels[action]} successfully.` });
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update user", variant: "destructive" });
    } finally {
      setActing(false);
    }
  }, [toast, onSuccess]);

  return { updateUserStatus, acting };
}
