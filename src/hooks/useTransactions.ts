import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export function useTransactions() {
  const { user } = useFirebaseAuth();

  return useQuery({
    queryKey: ["transactions", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.uid,
  });
}
