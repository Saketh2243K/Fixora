/*
# Fixora — Create issues and issue_timeline tables

## Purpose
Stores campus issue reports submitted by students and the status timeline events
for each report. Designed for a shared, single-tenant app with no sign-in screen:
all visitors can read all reports and submit new ones. Admin-level mutations
(changing status, priority, assigned team, resolution notes) are gated behind a
SECURITY DEFINER function that requires an admin secret key, so the frontend's
"admin mode" toggle alone cannot grant privileged writes.

## New Tables

### issues
- `id` (text, primary key) — human-readable unique ID like "CF-2026-001",
  generated from a Postgres sequence.
- `title` (text, not null) — short summary of the issue.
- `description` (text, not null) — detailed description.
- `category` (text, not null) — one of: Plumbing, Electrical, Furniture,
  Cleanliness, Internet, Safety, Other.
- `location` (text, not null) — campus building / location name.
- `priority` (text, not null, default 'Medium') — Low, Medium, High, Urgent.
- `status` (text, not null, default 'Reported') — Reported, In Progress, Resolved.
- `photo_url` (text, nullable) — optional photo (data URL or storage path).
- `reported_by` (text, not null) — name of the student who reported it.
- `assigned_team` (text, not null, default 'Unassigned') — maintenance team name.
- `resolution_notes` (text, nullable) — notes added when resolving.
- `created_at` (timestamptz, not null, default now()) — when the report was filed.
- `updated_at` (timestamptz, not null, default now()) — last modification time.

### issue_timeline
- `id` (bigint, primary key, generated identity) — row ID.
- `issue_id` (text, not null, references issues(id) on delete cascade) — parent issue.
- `status` (text, not null) — the status this event represents.
- `note` (text, nullable) — optional note for this timeline event.
- `actor` (text, not null) — who made the change.
- `created_at` (timestamptz, not null, default now()) — when the event occurred.

### issue_id_seq
- A standalone sequence used to generate the numeric portion of issue IDs.

## Security

### RLS
- Both tables have RLS enabled.
- `issues`: SELECT and INSERT are open to anon + authenticated (shared data).
  UPDATE and DELETE are denied by default (no policy) — admin updates go through
  the SECURITY DEFINER function `update_issue_admin`.
- `issue_timeline`: SELECT and INSERT are open to anon + authenticated.
  UPDATE and DELETE are denied by default.

### SECURITY DEFINER function: update_issue_admin
- Takes an admin key, issue ID, and optional new values for status, priority,
  assigned_team, and resolution_notes.
- Validates the admin key against the `Fixora_ADMIN_KEY` project secret.
- Updates the issue row and inserts a new timeline event if status changed.
- Callable by anon + authenticated (the key check is the gate, not the role).

## Important Notes
1. The `Fixora_ADMIN_KEY` secret must be set in the Supabase project for admin
   updates to work. The frontend sends it via the function argument.
2. Issue IDs are generated as "CF-YYYY-NNN" using the sequence and current year.
3. The `updated_at` column is auto-maintained by a trigger on every UPDATE.
4. Sample data is NOT inserted by this migration — it remains available only as
   optional demo data in the frontend.
*/

-- =========================================================
-- Sequence for issue ID generation
-- =========================================================
CREATE SEQUENCE IF NOT EXISTS issue_id_seq START 1;

-- =========================================================
-- issues table
-- =========================================================
CREATE TABLE IF NOT EXISTS issues (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (
    category IN ('Plumbing','Electrical','Furniture','Cleanliness','Internet','Safety','Other')
  ),
  location text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium' CHECK (
    priority IN ('Low','Medium','High','Urgent')
  ),
  status text NOT NULL DEFAULT 'Reported' CHECK (
    status IN ('Reported','In Progress','Resolved')
  ),
  photo_url text,
  reported_by text NOT NULL,
  assigned_team text NOT NULL DEFAULT 'Unassigned',
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone (anon + authenticated) can read all reports
DROP POLICY IF EXISTS "issues_select_all" ON issues;
CREATE POLICY "issues_select_all"
  ON issues FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: anyone can submit a new report
DROP POLICY IF EXISTS "issues_insert_all" ON issues;
CREATE POLICY "issues_insert_all"
  ON issues FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No UPDATE or DELETE policies — admin updates go through the SECURITY DEFINER function.

-- =========================================================
-- issue_timeline table
-- =========================================================
CREATE TABLE IF NOT EXISTS issue_timeline (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  issue_id text NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (
    status IN ('Reported','In Progress','Resolved')
  ),
  note text,
  actor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issue_timeline_issue_id ON issue_timeline(issue_id);

ALTER TABLE issue_timeline ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone can read timeline events
DROP POLICY IF EXISTS "timeline_select_all" ON issue_timeline;
CREATE POLICY "timeline_select_all"
  ON issue_timeline FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: anyone can add a timeline event (e.g. the initial "Reported" event)
DROP POLICY IF EXISTS "timeline_insert_all" ON issue_timeline;
CREATE POLICY "timeline_insert_all"
  ON issue_timeline FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =========================================================
-- updated_at trigger for issues
-- =========================================================
CREATE OR REPLACE FUNCTION update_issues_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_issues_updated_at();

-- =========================================================
-- Function to generate the next issue ID
-- =========================================================
CREATE OR REPLACE FUNCTION generate_issue_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'CF-' || EXTRACT(YEAR FROM now())::text || '-' ||
         LPAD(nextval('issue_id_seq')::text, 3, '0')
$$;

-- =========================================================
-- SECURITY DEFINER: admin update function
-- Gates privileged mutations behind an admin key check.
-- =========================================================
CREATE OR REPLACE FUNCTION update_issue_admin(
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
  v_current issues%ROWTYPE;
  v_new_status text;
  v_new_notes text;
BEGIN
  -- Validate admin key against the project secret
  IF p_admin_key IS NULL OR p_admin_key != current_setting('app.Fixora_admin_key', true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid admin key');
  END IF;

  -- Fetch the current row
  SELECT * INTO v_current FROM issues WHERE id = p_issue_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Issue not found');
  END IF;

  -- Determine effective new values
  v_new_status := COALESCE(p_status, v_current.status);
  v_new_notes := COALESCE(p_resolution_notes, v_current.resolution_notes);

  -- Update the issue
  UPDATE issues SET
    status = v_new_status,
    priority = COALESCE(p_priority, v_current.priority),
    assigned_team = COALESCE(p_assigned_team, v_current.assigned_team),
    resolution_notes = v_new_notes
  WHERE id = p_issue_id;

  -- Insert a timeline event if status changed
  IF p_status IS NOT NULL AND p_status != v_current.status THEN
    INSERT INTO issue_timeline (issue_id, status, note, actor)
    VALUES (p_issue_id, v_new_status, CASE WHEN v_new_notes IS NOT NULL AND p_status = 'Resolved' THEN v_new_notes ELSE NULL END, 'Admin');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION update_issue_admin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_issue_id TO anon, authenticated;
