# Authentication Debugging Guide

## Current Issue
Getting "You must be logged in to create a poll" even when logged in.

## Quick Fixes to Try (in order)

### 1. Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd alx_polly
npm run dev
```

### 2. Clear Browser Data
- Open DevTools (F12)
- Go to Application tab
- Clear all cookies for localhost:3000
- Clear localStorage and sessionStorage
- Refresh and log in again

### 3. Check Authentication Test Page
- Visit: `http://localhost:3000/auth-test`
- Both client and server should show the same user
- If they differ, there's a sync issue

### 4. Verify Environment Variables
Check your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Manual Login Test
1. Go to `/login`
2. Log in with valid credentials
3. Check browser console for "Session found: [email]"
4. Try creating a poll immediately after login

### 6. Check Supabase Dashboard
- Go to your Supabase project
- Check Authentication > Users
- Verify your user exists and is confirmed

## If Still Not Working

### Temporary Workaround
You can temporarily disable the auth check by commenting out the auth validation in the createPoll function:

In `lib/actions.ts`, comment out lines 63-65:
```typescript
// if (authError || !user) {
//   throw new Error('You must be logged in to create a poll')
// }
```

This will let you test poll creation while we debug the auth issue.

## Expected Behavior
- Client and server auth should match
- User should be available in both contexts
- Poll creation should work after login

## Debug Output Locations
- Browser console: Client-side auth logs
- Terminal/Server console: Server-side auth logs
- Auth test page: Side-by-side comparison
