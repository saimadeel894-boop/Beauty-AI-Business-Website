import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export function useWallet() {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ["wallet", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.uid,
  });

  const initWallet = useMutation({
    mutationFn: async () => {
      if (!user?.uid) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("wallets")
        .upsert({ user_id: user.uid, balance: 0, pending_balance: 0, total_received: 0, total_sent: 0 }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] }),
  });

  return { wallet: walletQuery.data, isLoading: walletQuery.isLoading, initWallet };
}
