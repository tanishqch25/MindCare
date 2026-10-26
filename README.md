# MindCare AI — React dashboard starter

A responsive cognitive wellness dashboard built with React, Vite, and Tailwind. It starts in demo mode with illustrative data. When Supabase is configured, people can create an account, sign in, save mood check-ins and completed exercises, and see their own history after a reload.

## Run the app

```powershell
npm install
npm run dev
```

Open the local address Vite prints (usually `http://localhost:5173`). Without Supabase settings, the app stays in demo mode and does not save check-ins.

## Connect Supabase for accounts and saved check-ins

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. In the project’s Connect/API settings, copy the **Project URL** and the **Publishable key**.
3. In this project folder, create a file named `.env.local` with:

   ```env
   VITE_SUPABASE_URL=paste-your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=paste-your-publishable-key
   ```

   Use the publishable key in the browser. Never put a Supabase secret or service-role key in a `VITE_` variable or browser code.

4. In Supabase, open **SQL Editor**, copy the contents of `supabase/schema.sql`, and run it. It creates the `mood_checkins` table and row-level security rules so signed-in users can only read, add, or delete their own entries. Then run `supabase/add_exercise_sessions.sql` to enable saved exercise completions.
5. In Supabase Authentication URL settings, set the local Site URL to `http://localhost:5173` and add `http://localhost:5173/**` to the allowed redirect URLs. Make sure email sign-ups are enabled. Email confirmation can stay enabled; new users will need to follow the confirmation email before signing in.
6. Restart the Vite server after creating `.env.local`. Sign up with an email, confirm it if prompted, and sign in. Save a mood check-in, then complete an exercise. Reload and check **Mood check-in** and **My progress** to confirm your records remain.

`.env.local` is excluded from Git by `.gitignore`. The checked-in `.env.example` is a template only and contains no keys.

## Main files

- `src/App.jsx` — dashboard layout, tab navigation, and Supabase session handling.
- `src/components/AuthScreen.jsx` — email and password sign-up/sign-in screen.
- `src/components/WorkspacePage.jsx` — separate tab pages and the mood check-in save/history view.
- `src/supabaseClient.js` — browser client configured from environment variables.
- supabase/schema.sql — mood check-in table and per-user database policies.
- supabase/add_exercise_sessions.sql — exercise completion table and per-user database policies.
- `src/data/mockData.js` — illustrative dashboard chart and activity data.

Mood check-ins store the selected mood and timestamp. Exercise sessions store an exercise identifier, estimated duration, and timestamp. No free-text health notes or performance scores are collected. Don’t enter sensitive details in this learning demo; it is not a clinical record or diagnostic tool.



