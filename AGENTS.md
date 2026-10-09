<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All share data access goes through server code with the service role via security-definer DB functions (create_share, peek_share, consume_share, purge_shares); tables have RLS with no policies so clients can never read them directly.
- File upload/download use raw server routes under /api/public/ (multipart + XHR progress; download consumes atomically and deletes the stored file before streaming) because server functions can't stream or report upload progress.
- Keep host-derived public metadata endpoints (robots and sitemap) aligned with the request origin or the configured canonical site URL so preview and Vercel deployments do not advertise stale domains.
- Select the Nitro deployment preset from the hosting platform’s build environment so one codebase continues to build for both the editor preview and Vercel.
