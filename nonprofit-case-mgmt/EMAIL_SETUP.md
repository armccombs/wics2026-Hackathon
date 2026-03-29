# Email Configuration for Testing

## Issue: Email Confirmation Rate Limits

When testing authentication, Supabase may enforce email rate limits or try to send confirmation emails to test addresses. To fix this for development/testing, you can disable email confirmation.

## Solution: Disable Email Confirmation in Supabase

### For Testing (Development)

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find the "Confirm email" option and set it to **OFF**
   - This makes new email/password signups auto-confirmed
   - Users can sign in immediately without email verification
4. Save changes

### Alternative: Use Magic Link (No Password)

If you want to keep email verification but avoid passwords:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **Enable Email Provider**
3. Choose "Magic Link" instead of password-based auth
4. No passwords needed - users get a login link via email

## Testing Accounts

With email confirmation disabled, you can create unlimited test accounts:

```
Username: testuser1
Password: password123

Username: testuser2
Password: password123

Username: admin
Password: password123
```

## Database Auto-Population

When a user signs up through the form:

1. **Signup API Route** (`/api/auth/signup`) handles the signup
2. User is created in Supabase `auth.users` table
3. **User profile is automatically created** in `user_profiles` table with:
   - `id`: User's unique ID
   - `email`: Generated test email (username@test.local)
   - `role`: Automatically set to 'staff'
   - `created_at`: Current timestamp
   - `updated_at`: Current timestamp

### Verify Database Population

You can check if profiles were created:

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Select `user_profiles` table
4. You should see rows for each signed-up user

## For Production

⚠️ **Important**: Always enable email confirmation in production:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle "Confirm email" to **ON**
3. This ensures only verified email addresses can create accounts
4. Protects against spam and invalid emails

## Testing Workflow

1. **Disable email confirmation** in Supabase (for testing only)
2. Go to `http://localhost:3000/auth/signup`
3. Enter:
   - Username: `john`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click **Sign Up**
5. You'll be redirected to login page
6. Sign in with same username + password
7. Check Supabase **user_profiles** table - new user should be there!

## Troubleshooting

### Still getting "email rate exceeded"?

1. Make sure email confirmation is **OFF**
2. Clear browser cookies and try new username
3. Check Supabase logs for any errors:
   - Dashboard → **Logs** → **Auth logs**

### User not in database after signup?

1. Check **user_profiles** table in Supabase
2. Check Supabase auth logs for errors
3. Verify the signup API route is being called correctly

### Can't log in after signup?

1. Make sure email confirmation is disabled
2. Use the exact username you signed up with (case-insensitive)
3. Check password is at least 6 characters
