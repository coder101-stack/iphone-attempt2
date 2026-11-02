# Connect your AREM / KICKVAULT app to Supabase on Windows

The Home feed **still uses real Supabase** for member posts, profiles, comments and Rock It. No backend has been removed or replaced by mock persistence. The included sneaker photos are sample content only.

## 1. Open the right Supabase project

Visit https://supabase.com/dashboard and open the Supabase project associated with your AREM app. The uploaded `supabase/config.toml` references project **`ayisevkcvxvxeqolquss`**, corresponding to `https://ayisevkcvxvxeqolquss.supabase.co`. Confirm that this project is yours and accessible before using that URL; otherwise use the Project URL provided by your own dashboard.

Find the **publishable** (`sb_publishable_...`) key in **Project Settings -> API Keys**, or use the legacy anon public key if that is what your project provides. **Do not send anyone a service-role or secret key.**

## 2. Set local environment variables

In VS Code, open the same root folder as `package.json`. Copy `.env.example` to a file named `.env.local` (not `.env.local.txt`):

```powershell
Copy-Item .env.example .env.local
```

Replace `PASTE_YOUR_PUBLISHABLE_KEY_HERE` on **both** lines with your project's public publishable key. Verify both URL lines match the project where you obtained the key.

Keep `.env.local` on your own computer. It's excluded by `.gitignore` and intentionally not shipped in downloads. Do **not** use a `sb_secret_...` key or a service-role JWT for any `VITE_` variable.

## 3. Restart the app

In VS Code terminal, press Ctrl+C to stop the current server, then run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the localhost URL Vite prints. The Home page will load with Supabase-backed auth/posts/comments once the credentials are valid and the corresponding tables and Storage bucket exist in your project.

## 4. Verify the database

The existing app expects Supabase tables `profiles`, `posts`, `comments`, `rock_its`, etc., and a Storage bucket named `posts` (private, with relevant RLS policies). The TypeScript database types describe those tables but **do not automatically create them**. Check **Supabase -> Database -> Tables** and **Storage** in your project. If you're connecting a new empty project, you'll need the original schema/migrations and RLS policies before uploads, likes, or comments can work. Don't disable RLS as a workaround.

## 5. About remaining errors

- The old Lovable-only demo `feed-video-1.mp4` was not present as a playable local file. That **demo** item now uses the included still image. Real member video uploads are still played from Supabase Storage.
- A browser CSP warning about an external stylesheet is separate from Supabase configuration; don't relax CSP blindly.
- If authentication still doesn't work after the URL/key are correct, review your Supabase Auth URL configuration and permitted redirect URLs for your localhost origin.
- Server-side account deletion uses `SUPABASE_SERVICE_ROLE_KEY` if enabled; that credential must be server-only, private and never shared. This is separate from normal browsing, posting, and login.
