---
name: Wouter v3 prefix routing
description: How to do prefix/wildcard route matching in wouter v3 (regexparam), and pitfalls of glob-style paths.
---

## The Rule

In wouter v3 (regexparam@3.0.0), use **RegExp paths** for prefix matching. Do NOT use `/dashboard*` glob syntax.

## Why

`regexparam.parse('/dashboard*')` treats the segment `dashboard*` literally (first char is `d`, not `*`). The resulting regex is `/^\/dashboard*\/?$/i` — in regex terms that means "zero or more `d`s", so it ONLY matches `/dashboard` exactly, not `/dashboard/orders`.

The `*` wildcard only fires in regexparam when `*` is the **first character** of a path segment (i.e., a segment that is purely `*` like in `/*`).

## How to Apply

For prefix matching in App.tsx outer Switch (wrapping ProtectedRoute):

```tsx
// WRONG — does NOT match /dashboard/orders
<Route path="/dashboard*">

// CORRECT — matches /dashboard AND /dashboard/anything
<Route path={/^\/dashboard(\/|$)/i}>
```

Using a RegExp path skips regexparam entirely. Without the `nest` prop, no nested Router context is created, so:
- `useLocation()` everywhere returns the full absolute path
- Inner Switch routes can safely use full absolute paths like `/dashboard/orders`
- `Link` hrefs with absolute paths navigate correctly (no double-prefix issue)
- Layout active-state checks with `window.location.pathname` work as-is

## The `nest` prop alternative

`<Route path="/dashboard" nest>` works (loose=true → regex `/^\/dashboard(?=$|\/)/i`), but it creates a nested Router context where:
- `useLocation()` returns paths relative to `/dashboard` (e.g., `/orders` not `/dashboard/orders`)
- `Link href="/dashboard/orders"` navigates to `/dashboard/dashboard/orders` (double-prefix)
- All nav links need `~/` absolute prefix (`href="~/dashboard/orders"`)

RegExp paths are simpler when the sub-routers already use absolute paths.
