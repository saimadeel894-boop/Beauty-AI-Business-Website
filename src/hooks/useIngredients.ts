import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Ingredient {
  id: string;
  name: string;
  inci_name: string;
  cas_number: string | null;
  category: string;
  functions: string[];
  safety_rating: string;
  ewg_score: number;
  origin: string;
  max_concentration: Record<string, string>;
  regulatory_status: Record<string, string>;
  restrictions: string[];
  alternatives: string[];
  description: string | null;
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchIngredients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");

      if (error) throw error;
      setIngredients((data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        inci_name: d.inci_name,
        cas_number: d.cas_number,
        category: d.category,
        functions: d.functions || [],
        safety_rating: d.safety_rating,
        ewg_score: d.ewg_score,
        origin: d.origin,
        max_concentration: d.max_concentration || {},
        regulatory_status: d.regulatory_status || {},
        restrictions: d.restrictions || [],
        alternatives: d.alternatives || [],
        description: d.description,
      })));
    } catch (err) {
      console.error("Error fetching ingredients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  const filtered = ingredients.filter((ing) => {
    const matchesSearch = !searchQuery || 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.inci_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.functions.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || ing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(ingredients.map(i => i.category))];

  return { ingredients: filtered, allIngredients: ingredients, loading, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, categories, refetch: fetchIngredients };
}
