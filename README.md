# Fixora — ready-to-run fixed project

This version connects the landing page, student dashboard, report form, and admin dashboard to Supabase.

## 1. Put your existing Supabase environment file here

The archive intentionally does **not** include a Supabase secret/key. Copy the `.env` file from your current working Fixora project into this folder.

It must contain:

```env
VITE_SUPABASE_URL=https://pucgsrrdegtgmwyvgqgi.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_EXISTING_PUBLISHABLE_KEY
```

Do not send the key to anyone or paste it into chat.

## 2. Repair the Supabase permissions once

Open your correct Supabase project, open **SQL Editor**, create a new query, paste the entire contents of `supabase/FIX_NOW.sql`, and click **Run**.

This fixes the 401 / `permission denied for table issues` problem and repairs the admin update function.

## 3. Run the website

Open this folder in VS Code. The folder you open must contain `package.json` directly.

Then run:

```bash
npm install
npm run dev
```

Open the localhost URL Vite prints, normally:

`http://localhost:5173/`

## What was fixed

- Student Dashboard loads live issues from Supabase.
- Admin Dashboard loads live issues from Supabase.
- Report submission waits for the database to succeed before showing success.
- Tracking IDs come from the database instead of random browser IDs.
- Database errors are shown in the UI instead of silently showing zero reports.
- Admin saves wait for the database and show save errors.
- Timeline loading errors no longer hide the entire issue list.
- Landing-page counts and recent reports use live Supabase data.
- The SQL repair grants the permissions required by the RLS policies.
- The broken `p_new_status` SQL variable was corrected to `v_new_status`.
