# Phase 4 — Authentication
**PJHerbal Clinic · Segerea Branch**

Status: ✅ Complete.

---

## For the customer

Customers sign in with email and password (Firebase handles the actual credential storage and security). The very first time someone signs in, the system quietly creates their internal customer record — order history, saved addresses, and wishlist all attach to that record. Staff and admin accounts work the same way but carry a role that unlocks the admin dashboard (Phase 6) and are managed by an existing admin, not through public signup.

---

## For the tech team

### How the pieces fit together

```
Browser                          Next.js (apps/web)              Express (apps/api)
--------                         -----------------                -----------------
Firebase Auth SDK  ── ID token ──> AuthContext                          │
                                     │  POST /auth/sync + Bearer token  │
                                     └──────────────────────────────────>  Verify token (Firebase Admin)
                                                                          → upsert User row
                                     GET /auth/me  ─────────────────────>  return role + profile
                                     (drives UI: nav links, guards)
```

Firebase is the identity provider; our own Postgres `User` table (from Phase 2) is the authorization source of truth. This split matters: Firebase can tell us *who* someone is, but *what they're allowed to do* is a business decision that lives in our database, not in a third party's claims — that's why `requireRole` (Phase 1) checks the DB-backed `req.user.role`, not the raw token.

### Backend — `modules/auth`

```
POST   /auth/sync              any signed-in Firebase user — idempotent; creates the User row on first call
GET    /auth/me                current user's profile
PATCH  /auth/me                update own name/phone
GET    /auth/users             admin/staff — list customers/staff (SRS §10 Customer Management)
PATCH  /auth/users/:id/role    admin only — sets role in BOTH the DB and Firebase custom claims
```

`setUserRole` writes to two places deliberately: the database (what `requireRole` actually checks on every request) and Firebase custom claims (so the client's ID token also carries the role, letting the frontend make fast UI decisions — show the admin nav link — without an extra request). If the two ever disagree, **the database wins**; nothing server-side trusts the token's role claim for authorization.

### Frontend — `context/AuthContext.tsx`

A single `AuthProvider` wraps the whole app (wired into `app/layout.tsx`) and exposes:

```ts
const { firebaseUser, profile, loading, signIn, signUp, signOut, refreshProfile } = useAuth();
```

- `firebaseUser` — raw Firebase identity (or null)
- `profile` — our backend's `User` row: `{ id, email, name, phone, role }` — this is what any role check in the UI should read
- `signUp(name, phone, email, password)` — creates the Firebase account, then calls `/auth/sync` and `PATCH /auth/me` to attach name/phone (Firebase itself only knows email/password)

`onAuthStateChanged` drives everything: whenever Firebase reports a signed-in user, the provider calls `/auth/sync` (safe to call repeatedly — it's a no-op after the first time) and loads the profile.

### Route protection: `AuthGuard` and `AdminGuard`

```
app/(customer)/account/layout.tsx   → wraps in <AuthGuard>   (any signed-in user)
app/(admin)/admin/layout.tsx        → wraps in <AdminGuard>  (role === admin or staff)
```

**This is client-side only, and that's a deliberate, documented tradeoff, not an oversight.** The guards redirect an unauthorized browser away from the page — good UX, bad security boundary on its own. The actual security boundary is the API: every admin/staff/customer-only endpoint is independently protected by `requireAuth`/`requireRole` on the server (Phase 1, enforced again in every Phase 3 module). Even if someone bypassed the client guard entirely (disabled JS, hit the route directly), they'd hit 401/403 responses the moment a page tried to fetch real data. Server-side page protection via Next.js Middleware + Firebase session cookies is a reasonable hardening step for later, but isn't required for the app to be secure — it's UX polish on top of a boundary the API already enforces.

### Forms and validation (SRS "every form must include validation")

Login and signup both use `react-hook-form` + `zod` (`lib/validators/auth.ts`), matching the pattern every other form in Phase 5 will follow:

- Email format, minimum password length, Tanzanian phone number format (`0xxxxxxxxx` or `+255xxxxxxxxx`), password-confirmation match — all checked client-side before submission, and independently re-checked server-side by the Zod schemas already in `modules/auth/auth.schema.ts` (client validation is a UX convenience; server validation is what actually protects the data).
- Firebase error codes (`auth/wrong-password`, `auth/email-already-in-use`, etc.) are translated into plain-language messages rather than shown raw.

### What's intentionally out of scope this phase

- **Phone/OTP sign-in** — the SRS doesn't specify it; email/password is the baseline. Worth flagging if you want it added, since Firebase supports it and the `AuthContext` shape would extend cleanly.
- **Password reset flow** — straightforward Firebase addition (`sendPasswordResetEmail`), not yet wired into a UI page.
- **Server-side session cookies / Next.js Middleware route protection** — see the AuthGuard note above.

## Installation notes specific to this phase

You need a real Firebase project before this phase does anything:

1. Create a Firebase project → enable **Authentication → Email/Password**.
2. Web app config → fill `NEXT_PUBLIC_FIREBASE_*` in `apps/web/.env.local`.
3. Project Settings → Service Accounts → generate a private key → fill `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` in `apps/api/.env`.
4. To make your own account an admin: sign up normally through `/signup`, then run:
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'you@example.com';
   ```
   (Custom claims will sync automatically the next time `/auth/users/:id/role` is called by another admin — for the *first* admin, the direct SQL update is the standard bootstrap step.)

---

## Next: Phase 5 — Frontend

The actual customer-facing pages from the SRS site map: homepage (hero, categories, best sellers, testimonials), shop/product listing, product detail, cart, checkout, order success — built on the component system, forms, and auth layer this phase and Phase 3 established.
