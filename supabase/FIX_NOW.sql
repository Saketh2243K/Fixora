-- Fixora one-time Supabase repair
-- Run this entire file in Supabase -> SQL Editor for the Fixora project.
-- It repairs the public table grants/RLS used by the browser and fixes the
-- admin update function used by the dashboard.

GRANT SELECT, INSERT ON TABLE public.issues TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.issue_timeline TO anon, authenticated;

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issues_select_all" ON public.issues;
CREATE POLICY "issues_select_all"
  ON public.issues FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "issues_insert_all" ON public.issues;
CREATE POLICY "issues_insert_all"
  ON public.issues FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "timeline_select_all" ON public.issue_timeline;
CREATE POLICY "timeline_select_all"
  ON public.issue_timeline FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "timeline_insert_all" ON public.issue_timeline;
CREATE POLICY "timeline_insert_all"
  ON public.issue_timeline FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT EXECUTE ON FUNCTION public.generate_issue_id() TO anon, authenticated;

-- Ensure the private admin-key table exists and is not directly readable.
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.app_config FROM anon, authenticated;
INSERT INTO public.app_config (key, value)
VALUES ('admin_key', 'Fixora-admin-2026')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_issue_admin(
  p_admin_key text,
  p_issue_id text,
  p_status text DEFAULT NULL,
  p_priority text DEFAULT NULL,
  p_assigned_team text DEFAULT NULL,
  p_resolution_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_key text;
  v_current public.issues%ROWTYPE;
  v_new_status text;
  v_new_notes text;
BEGIN
  SELECT value INTO v_stored_key
  FROM public.app_config
  WHERE key = 'admin_key';

  IF p_admin_key IS NULL OR p_admin_key IS DISTINCT FROM v_stored_key THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid admin key');
  END IF;

  SELECT * INTO v_current
  FROM public.issues
  WHERE id = p_issue_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Issue not found');
  END IF;

  v_new_status := COALESCE(p_status, v_current.status);
  v_new_notes := COALESCE(p_resolution_notes, v_current.resolution_notes);

  UPDATE public.issues
  SET
    status = v_new_status,
    priority = COALESCE(p_priority, v_current.priority),
    assigned_team = COALESCE(p_assigned_team, v_current.assigned_team),
    resolution_notes = v_new_notes
  WHERE id = p_issue_id;

  IF p_status IS NOT NULL AND p_status <> v_current.status THEN
    INSERT INTO public.issue_timeline (issue_id, status, note, actor)
    VALUES (
      p_issue_id,
      v_new_status,
      CASE WHEN v_new_notes IS NOT NULL AND p_status = 'Resolved' THEN v_new_notes ELSE NULL END,
      'Admin'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_issue_admin(text, text, text, text, text, text)
  TO anon, authenticated;
