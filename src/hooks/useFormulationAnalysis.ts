import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ParsedIngredient {
  name: string;
  inci_name: string;
  category?: string;
  detected_concentration?: string;
  safety_rating: string;
  regulatory_status: Record<string, string>;
  flags?: string[];
  alternatives?: string[];
}

export interface ComplianceResults {
  overall_status: "compliant" | "warnings" | "non_compliant";
  market_readiness: Record<string, { status: string; issues: string[] }>;
  banned_ingredients: string[];
  restricted_ingredients: string[];
  warnings: string[];
}

export interface Suggestion {
  type: "replacement" | "compatibility" | "concentration" | "labeling";
  severity: "info" | "warning" | "critical";
  ingredient?: string;
  message: string;
  suggested_alternative?: string;
}

export interface AnalysisResult {
  parsed_ingredients: ParsedIngredient[];
  compliance_results: ComplianceResults;
  suggestions: Suggestion[];
}

export function useFormulationAnalysis() {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = async (formulation_text: string, target_markets: string[], product_name?: string) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-formulation", {
        body: { formulation_text, target_markets, product_name },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Analysis Error", description: data.error, variant: "destructive" });
        return null;
      }

      const analysisResult: AnalysisResult = {
        parsed_ingredients: data.parsed_ingredients,
        compliance_results: data.compliance_results,
        suggestions: data.suggestions,
      };
      setResult(analysisResult);
      toast({ title: "Analysis Complete", description: `Found ${analysisResult.parsed_ingredients.length} ingredients` });
      return analysisResult;
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ title: "Error", description: "Failed to analyze formulation", variant: "destructive" });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyze, analyzing, result, setResult };
}
