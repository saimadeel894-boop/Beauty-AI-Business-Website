import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SupportedLanguage = "en" | "ko" | "zh" | "ja";

export const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

type TranslationContext = "message" | "rfq_description" | "product_specification" | "general";

interface TranslationCache {
  [key: string]: string;
}

export function useTranslation() {
  const { toast } = useToast();
  const [translating, setTranslating] = useState(false);
  const [cache] = useState<TranslationCache>({});

  const translate = useCallback(async (
    text: string,
    targetLanguage: SupportedLanguage,
    context?: TranslationContext,
    sourceLanguage?: SupportedLanguage,
  ): Promise<string | null> => {
    if (!text.trim()) return null;

    const cacheKey = `${text}:${targetLanguage}:${sourceLanguage || "auto"}`;
    if (cache[cacheKey]) return cache[cacheKey];

    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text, target_language: targetLanguage, source_language: sourceLanguage, context },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Translation Error", description: data.error, variant: "destructive" });
        return null;
      }

      const translated = data.translated_text;
      cache[cacheKey] = translated;
      return translated;
    } catch (err: any) {
      console.error("Translation error:", err);
      toast({ title: "Error", description: "Failed to translate", variant: "destructive" });
      return null;
    } finally {
      setTranslating(false);
    }
  }, [cache, toast]);

  const translateBatch = useCallback(async (
    texts: string[],
    targetLanguage: SupportedLanguage,
    context?: TranslationContext,
  ): Promise<(string | null)[]> => {
    const results = await Promise.all(
      texts.map(text => translate(text, targetLanguage, context))
    );
    return results;
  }, [translate]);

  return { translate, translateBatch, translating };
}
