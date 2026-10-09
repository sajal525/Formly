---
trigger: always_on
---

# FLASHMODE WORKFLOW RULE

Whenever the user mentions:
- "use flashmode"
- "flashmode"
- "run in flashmode"
- "start flashmode"

You MUST immediately execute the Flashmode sequence:
1. **Free Port 3000:** Stop any running Next.js instance or background tasks using port 3000.
2. **Compile Optimized Production Build:** Run `npx next build` to compile minified server and static client bundles.
3. **Launch Production Server:** Run `npx next start -p 3000` as a daemon on port 3000.
4. **Health Check:** Verify that `http://localhost:3000/` responds with HTTP 200 and sub-100ms latency.
5. **Report to User:** Share the live link `http://localhost:3000` with the user and confirm that Flashmode is active.
