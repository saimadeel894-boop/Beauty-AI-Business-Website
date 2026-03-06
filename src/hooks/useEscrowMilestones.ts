import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export function useEscrowMilestones(contractId?: string) {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();

  const milestonesQuery = useQuery({
    queryKey: ["escrow-milestones", contractId],
    queryFn: async () => {
      if (!contractId) return [];
      const { data, error } = await supabase
        .from("escrow_milestones")
        .select("*")
        .eq("contract_id", contractId)
        .order("milestone_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.uid && !!contractId,
  });

  const updateMilestoneStatus = useMutation({
    mutationFn: async ({ milestoneId, status }: { milestoneId: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "funded") updates.funded_at = new Date().toISOString();
      if (status === "approved") updates.approved_at = new Date().toISOString();
      if (status === "released") updates.released_at = new Date().toISOString();

      const { error } = await supabase
        .from("escrow_milestones")
        .update(updates)
        .eq("id", milestoneId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["escrow-milestones"] }),
  });

  const createMilestones = useMutation({
    mutationFn: async (milestones: Array<{
      contract_id: string; title: string; description?: string;
      amount: number; milestone_order: number; brand_id: string; manufacturer_id: string; due_date?: string;
    }>) => {
      const { data, error } = await supabase
        .from("escrow_milestones")
        .insert(milestones)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["escrow-milestones"] }),
  });

  return {
    milestones: milestonesQuery.data ?? [],
    isLoading: milestonesQuery.isLoading,
    updateMilestoneStatus,
    createMilestones,
  };
}
