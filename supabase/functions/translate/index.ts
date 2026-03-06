import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, target_language, source_language, context } = await req.json();

    if (!text || !target_language) {
      return new Response(JSON.stringify({ error: "text and target_language are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const languageMap: Record<string, string> = {
      en: "English",
      ko: "Korean",
      zh: "Chinese (Simplified)",
      ja: "Japanese",
    };

    const targetLang = languageMap[target_language] || target_language;
    const sourceLang = source_language ? (languageMap[source_language] || source_language) : "auto-detect";

    const contextHint = context 
      ? `This is a ${context} in a B2B cosmetics manufacturing platform.` 
      : "This is text from a B2B cosmetics manufacturing platform.";

    const systemPrompt = `You are a professional translator specializing in B2B cosmetics and beauty industry communications. ${contextHint}

Rules:
- Translate naturally, preserving business tone and technical terminology
- Keep proper nouns, brand names, INCI names, and product codes untranslated
- Preserve formatting (line breaks, bullet points, numbering)
- For cosmetic/chemical terms, use the standard industry terminology in the target language
- Return ONLY the translated text, nothing else`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate the following from ${sourceLang} to ${targetLang}:\n\n${text}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI translation error:", response.status, errText);
      throw new Error("Translation failed");
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();

    if (!translated) throw new Error("No translation returned");

    return new Response(JSON.stringify({ 
      success: true, 
      translated_text: translated,
      source_language: sourceLang,
      target_language: targetLang,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
