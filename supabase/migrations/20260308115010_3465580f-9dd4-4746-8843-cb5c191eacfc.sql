
-- Admin SELECT on campaign_performance
CREATE POLICY "Admins can view all campaign_performance"
ON public.campaign_performance FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin SELECT on engagement_metrics
CREATE POLICY "Admins can view all engagement_metrics"
ON public.engagement_metrics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin SELECT on conversion_metrics
CREATE POLICY "Admins can view all conversion_metrics"
ON public.conversion_metrics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin SELECT on influencer_profiles
CREATE POLICY "Admins can view all influencer_profiles_admin"
ON public.influencer_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin SELECT on products
CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
