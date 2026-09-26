/*
# Fixora — Revoke direct grants on app_config

## Purpose
Remove all table-level privileges from anon and authenticated roles on the
app_config table. Even though RLS with no policies blocks row access, revoking
the grants is defense-in-depth — the table is completely invisible to the
frontend client. Only the table owner (and SECURITY DEFINER functions running
as owner) can access it.

## Security Changes
- REVOKE SELECT, INSERT, UPDATE, DELETE on app_config FROM anon, authenticated.
*/

REVOKE ALL PRIVILEGES ON TABLE app_config FROM anon, authenticated;
