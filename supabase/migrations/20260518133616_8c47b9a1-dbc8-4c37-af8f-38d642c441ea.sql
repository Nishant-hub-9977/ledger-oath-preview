
-- =========================================================
-- LedgerOath schema
-- =========================================================

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  company text,
  role text,
  intended_use_case text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- workspaces
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  mode text NOT NULL DEFAULT 'production',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspaces_select_own" ON public.workspaces FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "workspaces_insert_own" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "workspaces_update_own" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "workspaces_delete_own" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);
CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- workspace_members
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_select_own" ON public.workspace_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "members_insert_owner" ON public.workspace_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
  );
CREATE POLICY "members_delete_owner" ON public.workspace_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

-- payment_reviews
CREATE TABLE public.payment_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  review_id text NOT NULL,
  case_name text,
  vendor_name text,
  invoice_reference text,
  invoice_amount numeric,
  invoice_amount_display text,
  currency text NOT NULL DEFAULT 'INR',
  decision text,
  risk_score integer,
  risk_level text,
  status text,
  source_mode text NOT NULL DEFAULT 'demo',
  is_demo boolean NOT NULL DEFAULT false,
  input_payload jsonb,
  result_json jsonb,
  executive_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payment_reviews_user_created_idx ON public.payment_reviews (user_id, created_at DESC);
ALTER TABLE public.payment_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_own" ON public.payment_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reviews_insert_own" ON public.payment_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.payment_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.payment_reviews FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER payment_reviews_updated_at BEFORE UPDATE ON public.payment_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- review_files
CREATE TABLE public.review_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id uuid NOT NULL REFERENCES public.payment_reviews(id) ON DELETE CASCADE,
  file_name text,
  file_path text,
  file_type text,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.review_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files_select_own" ON public.review_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "files_insert_own" ON public.review_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "files_delete_own" ON public.review_files FOR DELETE USING (auth.uid() = user_id);

-- audit_exports
CREATE TABLE public.audit_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_review_id uuid NOT NULL REFERENCES public.payment_reviews(id) ON DELETE CASCADE,
  export_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exports_select_own" ON public.audit_exports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exports_insert_own" ON public.audit_exports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile + default workspace on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ws_id uuid;
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_company text := meta->>'company';
  v_full_name text := meta->>'full_name';
BEGIN
  INSERT INTO public.profiles (id, full_name, email, company, role, intended_use_case)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_company,
    meta->>'role',
    meta->>'intended_use_case'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.workspaces (owner_id, name, company)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(v_company, ''), COALESCE(v_full_name, NEW.email) || '''s workspace'),
    v_company
  )
  RETURNING id INTO ws_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Storage bucket for invoice uploads
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-uploads', 'invoice-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Users can manage their own files under {user_id}/...
CREATE POLICY "invoice_uploads_select_own"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoice-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "invoice_uploads_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invoice-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "invoice_uploads_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'invoice-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "invoice_uploads_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'invoice-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
