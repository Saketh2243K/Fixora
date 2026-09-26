-- Fixora access hardening
-- Ensures the public client roles have the table privileges required by the RLS policies.

GRANT SELECT, INSERT ON TABLE public.issues TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.issue_timeline TO anon, authenticated;

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
