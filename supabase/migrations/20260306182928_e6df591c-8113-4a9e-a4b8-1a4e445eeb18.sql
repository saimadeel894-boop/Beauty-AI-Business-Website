
-- Wallets table
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  pending_balance numeric NOT NULL DEFAULT 0,
  total_received numeric NOT NULL DEFAULT 0,
  total_sent numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Escrow milestones table
CREATE TABLE public.escrow_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id text NOT NULL,
  title text NOT NULL,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  milestone_order integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  brand_id uuid NOT NULL,
  manufacturer_id uuid NOT NULL,
  funded_at timestamptz,
  approved_at timestamptz,
  released_at timestamptz,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view own milestones" ON public.escrow_milestones
  FOR SELECT USING (brand_id IN (
    SELECT id FROM brand_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Manufacturers can view own milestones" ON public.escrow_milestones
  FOR SELECT USING (manufacturer_id IN (
    SELECT id FROM manufacturer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can create milestones" ON public.escrow_milestones
  FOR INSERT WITH CHECK (brand_id IN (
    SELECT id FROM brand_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can update own milestones" ON public.escrow_milestones
  FOR UPDATE USING (brand_id IN (
    SELECT id FROM brand_profiles WHERE user_id = auth.uid()
  ));

-- Transactions ledger
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  milestone_id uuid REFERENCES public.escrow_milestones(id),
  escrow_status text NOT NULL DEFAULT 'pending',
  description text,
  transaction_type text NOT NULL DEFAULT 'escrow_deposit',
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions as payer" ON public.transactions
  FOR SELECT USING (payer_id IN (
    SELECT id FROM brand_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM manufacturer_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM influencer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own transactions as receiver" ON public.transactions
  FOR SELECT USING (receiver_id IN (
    SELECT id FROM brand_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM manufacturer_profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM influencer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_milestones_updated_at BEFORE UPDATE ON public.escrow_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
