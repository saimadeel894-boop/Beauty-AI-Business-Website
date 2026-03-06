
CREATE TABLE public.ai_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL,
  candidate_id text NOT NULL,
  candidate_type text NOT NULL CHECK (candidate_type IN ('manufacturer', 'influencer')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  explanation text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert matches" ON public.ai_matches
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Authenticated users can view their matches" ON public.ai_matches
  FOR SELECT TO authenticated
  USING (brand_id IN (
    SELECT id FROM brand_profiles WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_ai_matches_brand_id ON public.ai_matches (brand_id);
CREATE INDEX idx_ai_matches_created_at ON public.ai_matches (created_at DESC);
