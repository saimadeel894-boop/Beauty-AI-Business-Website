import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Deterministic weighted scoring ---

interface ScoringResult {
  candidateId: string;
  matchScore: number;
  explanation: string;
}

function scoreManufacturerDeterministic(brand: any, mfg: any): ScoringResult {
  const brandCats = [
    ...(brand?.categories || brand?.productCategories || []),
    ...(brand?.productCategory ? [brand.productCategory] : []),
    ...(brand?.product_category ? [brand.product_category] : []),
  ].map((c: string) => c.toLowerCase()).filter(Boolean);

  const brandCerts = (brand?.certifications || []).map((c: string) => c.toLowerCase());
  const brandLoc = (brand?.location || "").toLowerCase();
  const brandIngredients = (brand?.ingredientPreferences || brand?.ingredient_preferences || "").toLowerCase();

  const mfgCats = (mfg.categories || []).map((c: string) => c.toLowerCase());
  const mfgCerts = (mfg.certifications || []).map((c: string) => c.toLowerCase());
  const mfgLoc = (mfg.location || "").toLowerCase();
  const mfgExpertise = (mfg.formulationExpertise || mfg.formulation_expertise || []).map((e: string) => e.toLowerCase());

  // 1. Formulation compatibility (30%)
  let formulationScore = 0;
  const catOverlap = brandCats.length > 0
    ? mfgCats.filter((c: string) => brandCats.some((bc: string) => bc.includes(c) || c.includes(bc))).length / brandCats.length
    : mfgCats.length > 0 ? 0.4 : 0.2;
  const expertiseBonus = brandIngredients && mfgExpertise.length > 0
    ? mfgExpertise.some((e: string) => brandIngredients.includes(e) || e.includes(brandIngredients)) ? 0.3 : 0.1
    : mfgExpertise.length > 0 ? 0.2 : 0;
  formulationScore = Math.min(100, (formulationScore + catOverlap * 70 + expertiseBonus * 100));

  // 2. MOQ compatibility (20%)
  const moqScore = mfg.moq ? 70 : 40;

  // 3. Certification match (15%)
  const certOverlap = brandCerts.length > 0
    ? mfgCerts.filter((c: string) => brandCerts.some((bc: string) => bc === c)).length / brandCerts.length
    : mfgCerts.length > 0 ? 0.5 : 0.2;
  const certScore = Math.min(100, certOverlap * 100);

  // 4. Location proximity (10%)
  const locScore = brandLoc && mfgLoc
    ? (mfgLoc.includes(brandLoc) || brandLoc.includes(mfgLoc) ? 90 : 40)
    : 50;

  // 5. Lead time compatibility (10%)
  const leadTimeScore = mfg.leadTime || mfg.lead_time ? 70 : 40;

  // 6. Historical performance (15%) — placeholder until campaign data available
  const histScore = 50;

  const weighted = formulationScore * 0.30 + moqScore * 0.20 + certScore * 0.15 + locScore * 0.10 + leadTimeScore * 0.10 + histScore * 0.15;
  const finalScore = Math.round(Math.min(100, Math.max(0, weighted)));

  const parts: string[] = [];
  if (formulationScore >= 60) parts.push(`strong formulation fit (${mfgCats.slice(0, 2).join(", ")})`);
  if (certScore >= 60) parts.push(`${mfgCerts.length} matching certifications`);
  if (locScore >= 80) parts.push("location aligned");
  const explanation = parts.length > 0
    ? `Score driven by ${parts.join("; ")}.`
    : `${mfgCats.length} categories, ${mfgCerts.length} certifications available.`;

  return { candidateId: mfg.id, matchScore: finalScore, explanation };
}

function scoreInfluencerDeterministic(brand: any, inf: any): ScoringResult {
  const brandIndustry = (brand?.industry || brand?.productCategory || brand?.product_category || brand?.niche || "").toLowerCase();
  const brandLoc = (brand?.location || brand?.targetMarket || brand?.target_market || "").toLowerCase();

  const niche = (inf.niche || "").toLowerCase();
  const infLoc = (inf.location || "").toLowerCase();
  const engRate = inf.engagementRate || inf.engagement_rate || 0;
  const followers = inf.followerCount || inf.follower_count || 0;
  const platform = (inf.primaryPlatform || inf.primary_platform || "").toLowerCase();

  // 1. Niche alignment (30%)
  const nicheScore = brandIndustry && niche
    ? (niche.includes(brandIndustry) || brandIndustry.includes(niche) ? 90 : 45)
    : niche ? 50 : 30;

  // 2. Engagement rate (25%)
  let engScore: number;
  if (engRate > 0) {
    engScore = Math.min(100, engRate * 15);
  } else if (followers > 0) {
    engScore = Math.min(100, 40 + Math.log10(followers) * 12);
  } else {
    engScore = 30;
  }

  // 3. Location & audience geography (20%)
  const locScore = brandLoc && infLoc
    ? (infLoc.includes(brandLoc) || brandLoc.includes(infLoc) ? 90 : 40)
    : 50;

  // 4. Platform match (15%)
  const platformScore = platform ? 60 : 30;

  // 5. Historical performance (10%) — placeholder
  const histScore = 50;

  const weighted = nicheScore * 0.30 + engScore * 0.25 + locScore * 0.20 + platformScore * 0.15 + histScore * 0.10;
  const finalScore = Math.round(Math.min(100, Math.max(0, weighted)));

  const parts: string[] = [];
  parts.push(`${inf.primaryPlatform || inf.primary_platform || "Unknown"} creator`);
  if (inf.niche) parts.push(`niche: ${inf.niche}`);
  if (engRate > 0) parts.push(`${engRate}% engagement`);
  if (followers > 0) parts.push(`${followers.toLocaleString()} followers`);
  const explanation = parts.join(", ") + ". Score based on weighted criteria.";

  return { candidateId: inf.id, matchScore: finalScore, explanation };
}

// --- Edge function ---

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429 && attempt < retries - 1) {
      const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.log(`Rate limited, retrying in ${Math.round(waitMs)}ms (attempt ${attempt + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    return response;
  }
  throw new Error("Max retries exceeded");
}

async function persistMatches(supabaseAdmin: any, brandId: string, results: ScoringResult[], candidateType: string) {
  if (!results.length) return;
  const rows = results.map((r) => ({
    brand_id: brandId,
    candidate_id: r.candidateId,
    candidate_type: candidateType,
    score: r.matchScore,
    explanation: r.explanation,
  }));
  const { error } = await supabaseAdmin.from("ai_matches").insert(rows);
  if (error) console.error("Failed to persist matches:", error.message);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, brandProfile, candidates } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const brandId = brandProfile?.id || "";

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "manufacturer-match") {
      systemPrompt = `You are a deterministic AI matching engine for a B2B beauty supply chain platform. Score each manufacturer using these EXACT weights:
- Formulation Compatibility (30%): Category overlap between brand needs and manufacturer capabilities. Consider product_category, ingredient_preferences, and formulation_expertise.
- MOQ Compatibility (20%): Does the manufacturer's MOQ align with the brand's volume expectations and pricing_positioning?
- Certification Match (15%): Overlap between brand-required and manufacturer-held certifications (GMP, ISO, organic, cruelty-free, etc.).
- Location Proximity (10%): Geographic alignment for logistics efficiency.
- Lead Time Compatibility (10%): Can the manufacturer meet expected timelines?
- Historical Performance (15%): Based on available campaign/order history. If none, use neutral score of 50.

Calculate weighted score 0-100. Be deterministic: same inputs must produce same outputs. Return JSON array sorted by matchScore descending.`;
      userPrompt = `Brand profile: ${JSON.stringify(brandProfile)}\n\nManufacturer candidates:\n${JSON.stringify(candidates)}\n\nReturn ONLY valid JSON array (no markdown): [{ "candidateId": "...", "matchScore": number, "explanation": "1-2 sentences citing which criteria drove the score" }]`;
    } else if (type === "influencer-match") {
      systemPrompt = `You are a deterministic AI matching engine for influencer marketing. Score each influencer using these EXACT weights:
- Niche Alignment (30%): How well does the influencer's niche match the brand's industry/product_category?
- Engagement Rate (25%): Use actual engagement_rate and follower_count. Higher genuine engagement = higher score.
- Location & Audience Geography (20%): Does the influencer's location/audience_geography align with brand's target_market?
- Platform Match (15%): Is the influencer on the right platform for the brand?
- Historical Performance (10%): Based on campaign_performance data if available. Otherwise neutral 50.

Calculate weighted score 0-100. Be deterministic. Return JSON array sorted by matchScore descending.`;
      userPrompt = `Brand campaign: ${JSON.stringify(brandProfile)}\n\nInfluencer candidates:\n${JSON.stringify(candidates)}\n\nReturn ONLY valid JSON array (no markdown): [{ "candidateId": "...", "matchScore": number, "explanation": "1-2 sentences citing which criteria drove the score" }]`;
    } else if (type === "summary") {
      systemPrompt = `You are a professional business analyst. Generate concise summaries. Be factual and professional.`;
      userPrompt = candidates;
    } else if (type === "contract") {
      systemPrompt = `You are a legal document assistant for influencer marketing and manufacturing agreements. Generate professional contract text.`;
      userPrompt = candidates;
    }

    // For matching types, attempt AI then fallback to deterministic
    if (type === "manufacturer-match" || type === "influencer-match") {
      let results: ScoringResult[] = [];
      let usedAI = false;

      try {
        const response = await callOpenAI(OPENAI_API_KEY, systemPrompt, userPrompt);
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            results = parsed.map((p: any) => ({
              candidateId: p.candidateId,
              matchScore: Math.min(100, Math.max(0, Math.round(p.matchScore))),
              explanation: p.explanation || "",
            }));
            usedAI = true;
          }
        }
      } catch (e) {
        console.log("AI scoring failed, using deterministic fallback:", e);
      }

      // Deterministic fallback
      if (!usedAI) {
        if (type === "manufacturer-match") {
          results = (candidates || []).map((c: any) => scoreManufacturerDeterministic(brandProfile, c));
        } else {
          results = (candidates || []).map((c: any) => scoreInfluencerDeterministic(brandProfile, c));
        }
      }

      results.sort((a, b) => b.matchScore - a.matchScore);

      // Persist to ai_matches table
      const candidateType = type === "manufacturer-match" ? "manufacturer" : "influencer";
      await persistMatches(supabaseAdmin, brandId, results, candidateType);

      return new Response(JSON.stringify({ result: JSON.stringify(results), method: usedAI ? "ai" : "deterministic" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Non-matching types (summary, contract)
    const response = await callOpenAI(OPENAI_API_KEY, systemPrompt, userPrompt);
    if (!response.ok) {
      const t = await response.text();
      console.error("OpenAI API error:", response.status, t);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
