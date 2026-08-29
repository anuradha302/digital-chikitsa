CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  doctor_name text,
  logo_url text,
  phone text,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX clinics_owner_idx ON public.clinics(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own clinic" ON public.clinics FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER t_clinics BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reg_no text,
  name text NOT NULL,
  gender text,
  age text,
  weight text,
  height text,
  education text,
  occupation text,
  birth_place text,
  birth_datetime text,
  email text,
  address text,
  whatsapp text,
  mobile text,
  reference text,
  visit_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patients_owner_visit_idx ON public.patients(owner_id, visit_date DESC);
CREATE INDEX patients_name_idx ON public.patients(owner_id, lower(name));
CREATE INDEX patients_reg_idx ON public.patients(owner_id, reg_no);
CREATE INDEX patients_mobile_idx ON public.patients(owner_id, mobile);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own patients" ON public.patients FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER t_patients BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.case_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  section_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, section_key)
);
CREATE INDEX case_sections_patient_idx ON public.case_sections(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_sections TO authenticated;
GRANT ALL ON public.case_sections TO service_role;
ALTER TABLE public.case_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own case sections" ON public.case_sections FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER t_case_sections BEFORE UPDATE ON public.case_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.patient_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patient_notes_patient_idx ON public.patient_notes(patient_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_notes TO authenticated;
GRANT ALL ON public.patient_notes TO service_role;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.patient_notes FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER t_patient_notes BEFORE UPDATE ON public.patient_notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.patient_drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  storage_path text,
  strokes jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patient_drawings_patient_idx ON public.patient_drawings(patient_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_drawings TO authenticated;
GRANT ALL ON public.patient_drawings TO service_role;
ALTER TABLE public.patient_drawings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own drawings" ON public.patient_drawings FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER t_patient_drawings BEFORE UPDATE ON public.patient_drawings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "drawings owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'drawings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "drawings owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'drawings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "drawings owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'drawings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "drawings owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'drawings' AND (storage.foldername(name))[1] = auth.uid()::text);