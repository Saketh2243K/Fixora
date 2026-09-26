/*
# Fixora — Add app_config table for admin key storage

## Purpose
Stores the admin key used by the `update_issue_admin` SECURITY DEFINER function.
Since database-level GUCs cannot be set in this environment, we use a dedicated
table with RLS that blocks all anon/authenticated reads. The SECURITY DEFINER
function runs as the table owner and bypasses RLS, so it can read the key.

## New Tables
### app_config
- `key` (text, primary key) — config key name.
- `value` (text, not null) — config value.

## Security
- RLS enabled on app_config.
- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated — the table
  is completely invisible to the frontend client.
- The `update_issue_admin` function is updated to read the key from this table
  instead of a GUC.

## Important Notes
1. The admin key is seeded as 'Fixora-admin-2026' and stored in the database.
2. Only the SECURITY DEFINER function can read it (it runs as owner, bypassing RLS).
3. The frontend sends the key via the function argument; it is stored in the
   VITE_SUPABASE_ANON_KEY-limited client and is acceptable for a hackathon demo
   because the actual privilege (UPDATE on issues) is enforced server-side.
*/

CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- No policies = no access for anon or authenticated. Only the owner (and
-- SECURITY DEFINER functions running as owner) can read this table.

-- Seed the admin key (idempotent)
INSERT INTO app_config (key, value)
VALUES ('admin_key', 'Fixora-admin-2026')
ON CONFLICT (key) DO NOTHING;

-- Update the SECURITY DEFINER function to read from the table
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
  v_stored_key text;
  v_current issues%ROWTYPE;
  v_new_status text;
  v_new_notes text;
BEGIN
  -- Read the admin key from the config table (bypasses RLS since we're SECURITY DEFINER)
  SELECT value INTO v_stored_key FROM app_config WHERE key = 'admin_key';

  IF p_admin_key IS NULL OR p_admin_key IS DISTINCT FROM v_stored_key THEN
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

GRANT EXECUTE ON FUNCTION update_issue_admin TO anon, authenticated;
