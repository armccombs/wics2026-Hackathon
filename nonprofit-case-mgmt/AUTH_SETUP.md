# Authentication & Role-Based Access Control Setup

This document explains how to set up authentication and role-based access control (RBAC) for the Nonprofit Case Management Platform.

## Overview

The authentication system uses:
- **Supabase Auth** for user authentication (Google SSO + email/password)
- **JWT-based session management** for secure authentication
- **Role-Based Access Control (RBAC)** with two roles:
  - **Admin**: Full CRUD permissions, user management, reporting
  - **Staff**: Can create and view records, limited edit permissions

## Setup Steps

### 1. Supabase Project Configuration

#### Enable Authentication Providers

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable the following providers:
   - **Email** (already enabled by default)
   - **Google OAuth** (required for Google SSO)
     - Configure Google OAuth credentials:
       - Go to [Google Cloud Console](https://console.cloud.google.com/)
       - Create a new OAuth 2.0 Credential (Web application)
       - Add authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
       - Copy the Client ID and Client Secret
       - Paste them in Supabase Authentication settings

#### Configure Authentication URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set the following:
   - **Site URL**: `http://localhost:3000` (for development) or your production domain
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`

### 2. Database Setup

Run the SQL migration to create the necessary tables and policies:

1. Open Supabase SQL Editor
2. Copy the contents of `sql/auth-setup.sql`
3. Execute the SQL script

This will create:
- `user_profiles` table with columns: `id`, `email`, `role`, `created_at`, `updated_at`
- Row-Level Security (RLS) policies for access control

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Found in Supabase Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Supabase Settings → API

### 4. Install Dependencies

```bash
npm install
```

Required packages are already in `package.json`:
- `@supabase/supabase-js`: JavaScript client library
- `@supabase/ssr`: Server-Side Rendering utilities

## User Flow

### New User Registration

1. User visits `/auth/signup`
2. Creates account with email/password or Google SSO
3. System automatically creates a `user_profile` record with role `staff`
4. User is redirected to `/dashboard`
5. Admin can later promote user to `admin` role from the dashboard

### Admin User Setup

After initial setup:
1. Manually update the first user's role to `admin` in Supabase:
   ```sql
   update public.user_profiles set role = 'admin' where email = 'admin@example.com';
   ```
2. Or use the User Management API (available to admins only)

### Login

1. User visits `/auth/login`
2. Authenticates with email/password or Google SSO
3. System retrieves user role from `user_profiles` table
4. User is redirected to `/dashboard` with full access based on their role

## API Routes

### Authentication Endpoints

- **POST** `/api/auth/callback` - OAuth callback handler
- **GET** `/api/auth/user` - Get current user profile
- **GET/POST** `/api/auth/users` - Manage users (admin only)
  - GET: List all users
  - POST: Update user role
- **POST** `/api/auth/signout` - Sign out current user

## Permission Model

### Admin Permissions
- ✅ Create clients
- ✅ Read clients
- ✅ Update clients
- ✅ Delete clients
- ✅ Create services/visits
- ✅ Read services/visits
- ✅ Update services/visits
- ✅ Delete services/visits
- ✅ View reports
- ✅ Manage users
- ✅ Export data

### Staff Permissions
- ✅ Create clients
- ✅ Read clients
- ❌ Update clients
- ❌ Delete clients
- ✅ Create services/visits
- ✅ Read services/visits
- ❌ Update services/visits
- ❌ Delete services/visits
- ❌ View reports
- ❌ Manage users
- ❌ Export data

## Middleware & Route Protection

The application uses Next.js middleware to protect routes:

**Protected Routes** (require authentication):
- `/dashboard` - User dashboard
- `/clients` - Client management
- `/services` - Service logging
- `/reports` - Reporting (admin only)
- `/admin` - Admin panel (admin only)

**Public Routes**:
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/callback` - OAuth callback

## Component Helpers

### useAuth Hook

Use the `useAuth()` hook in client components to access authentication state:

```typescript
'use client'

import { useAuth } from '@/contexts/auth'

export function MyComponent() {
  const { user, profile, isLoading, signOut } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>Role: {profile?.role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Permission Checking

Check permissions in components:

```typescript
import { hasPermission, isAdmin } from '@/lib/roles'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Component-level permission check
function AdminFeature() {
  const { profile } = useAuth()

  if (!isAdmin(profile?.role)) {
    return <div>Not authorized</div>
  }

  return <div>Admin content</div>
}

// Route-level protection with ProtectedRoute
function ClientManagement() {
  return (
    <ProtectedRoute requiredPermission="update_clients">
      <EditClientForm />
    </ProtectedRoute>
  )
}
```

### Server-Side Auth

In Server Components or API routes:

```typescript
import { requireAuth, requireAdmin } from '@/lib/auth-helpers'

export default async function AdminPage() {
  const user = await requireAdmin() // Redirects if not admin
  return <div>Admin panel</div>
}
```

## Security Best Practices

1. **Never** commit `.env.local` to version control
2. **Always** use HTTPS in production
3. **Enable** Row-Level Security (RLS) on all tables
4. **Validate** user roles on both client and server
5. **Never** trust client-side permission checks alone
6. **Use** Supabase RLS policies for data-level access control
7. **Audit** admin actions through logging

## Troubleshooting

### Users can't log in with Google

- Check that Google OAuth credentials are correctly configured in Supabase
- Verify redirect URLs match your domain (including `/auth/callback`)
- Check browser console for CORS errors

### "Unauthorized" error when accessing admin routes

- Verify user role in `user_profiles` table
- Check that auth context is initialized in app layout
- Ensure user has a role of `admin`

### Session expires unexpectedly

- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Verify middleware is properly configured
- Check browser cookie settings (3rd party cookies must be enabled)

### Database policy errors

- Run the SQL setup script again
- Ensure `user_profiles` table exists
- Check RLS is enabled on the table
- Verify JWT claims are set correctly

## Next Steps

After setting up authentication and RBAC:

1. **Client Management** - Implement client CRUD operations
2. **Service Logging** - Build service/visit tracking
3. **Reporting** - Create dashboards and reports
4. **Audit Logging** - Track user actions and changes
5. **CSV Import/Export** - Bulk client data management

See the `README.md` for overall project setup instructions.
