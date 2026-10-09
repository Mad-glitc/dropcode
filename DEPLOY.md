# Deploying DropCode to Vercel

When Vercel builds this repo, the app selects Nitro’s Vercel preset and emits a Vercel-ready bundle. `vercel.json` uses the existing Bun lockfile for a repeatable install.

## Steps

1. Push this project to GitHub (Lovable → GitHub → Connect).
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Other** (vercel.json sets the commands).
3. Add the environment variables listed in `.env.example`.
4. Deploy.

## Backend requirements

The server needs `SUPABASE_SERVICE_ROLE_KEY` to create/read shares, upload files and save contact messages.
The Lovable Cloud backend does not expose that key, so for Vercel you need your **own Supabase project**:

1. Create a free project at supabase.com.
2. Run the SQL in `drizzle/migrations/` (SQL editor) to create tables and functions.
3. Create a **private** storage bucket named `drops` with a 10 MB file limit.
4. Optional cleanup job (SQL editor):
   ```sql
   create extension if not exists pg_cron;
   select cron.schedule('dropcode-cleanup-text', '0 * * * *',
     $$ delete from public.shares where kind = 'text' and (expires_at < now() or consumed);
        delete from public.rate_limits where window_start < now() - interval '1 day'; $$);
   ```
5. Add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` to Vercel.
6. Set `VITE_SITE_URL` to the final app URL (for example `https://dropcode.vercel.app`) so canonical links and social metadata use your deployed domain.

## Notes

- The robots file uses the incoming deployed origin. The sitemap, canonical links, and social metadata use `VITE_SITE_URL`.
- Vercel’s serverless request body limit can be below the configured 10 MB file maximum (especially on Hobby).
  Test with your plan after deploying; if requests are rejected, reduce `MAX_FILE_BYTES` and the private bucket limit together,
  or use a hosting plan/path that supports larger bodies.
- Do not commit `.env` or service-role credentials. The service-role key must be set only as a Vercel server environment variable.
