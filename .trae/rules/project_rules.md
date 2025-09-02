---
description: Core rules, conventions, and architectural guidelines for the Polling App with QR Code Sharing.
globs:
alwaysApply: true
---

## Project Overview
This Polling App allows users to register, create polls, share them via unique links and QR codes, and view poll results.  
Follow these rules to ensure consistency, maintainability, and clean code.

## Technology Stack
- Language: TypeScript  
- Framework: Next.js (App Router)  
- Database & Auth: Supabase  
- Styling: Tailwind CSS with shadcn/ui components  
- Forms: react-hook-form with zod validation  
- QR Code Generation: qrcode.react  
- Deployment: Vercel  

## Architecture & Code Style
- **Directory Structure**
  - `/app/` → Next.js routes and pages  
    - `(auth)/` → Authentication-related routes  
    - `(polls)/` → Poll-related routes with grouped layouts  
    - `/api/` → API routes  
    - `/auth/` → Auth-specific pages  
    - `/dashboard/` → User dashboard  
    - `/polls/` → Poll pages  
    - `/profile/` → User profile pages  
    - `layout.tsx` → Root layout  
    - `page.tsx` → Home page  
    - `withAuth.tsx` → Authentication HOC  
  - `/components/ui/` → shadcn/ui components  
  - `/lib/` → Supabase client setup (`supabase.ts`), Server Actions (`actions.ts`), and utilities (`utils.ts`)  
  - `/public/` → Static assets  

- **Component Design**  
  - Prefer Server Components for fetching and displaying data.  
  - Use Client Components only for interactivity (forms, hooks, event listeners).  

- **Naming Conventions**  
  - Components: PascalCase (e.g., `CreatePollForm.tsx`)  
  - Utilities & Server Actions: camelCase (e.g., `submitVote.ts`)  

- **Error Handling**  
  - Wrap mutations in try/catch within Server Actions & API routes.  
  - Use Next.js `error.tsx` for route-level errors.  

- **Secrets**  
  - Never hardcode API keys.  
  - Use `.env.local` for Supabase keys and access via `process.env.*`.  

## Code Patterns
- All forms must use react-hook-form + zod validation.  
- Use Server Actions for creating polls, submitting votes, and managing poll data.  
- Fetch poll data in Server Components using the Supabase client.  
- Generate QR codes for each poll using qrcode.react.  
- Use shadcn/ui components consistently for UI elements.  

## Verification Checklist
- ✅ App Router structure followed, including grouped layouts `(auth)` and `(polls)`?  
- ✅ Server Actions used for data mutations?  
- ✅ Supabase used for authentication and database queries?  
- ✅ Polls can be shared via unique links and QR codes?  
- ✅ shadcn/ui components used consistently?  
- ✅ No hardcoded secrets?  
