# 🐛 Debug Guide - Fix Database Saving Issues

## ⚠️ Problem: Data Not Saving to Supabase

You're getting confirmation emails, but data isn't being stored. Let's fix this!

---

## 🔧 Step 1: Fix RLS Policies (MOST IMPORTANT!)

### The Issue:
Your original SQL was **missing INSERT policies** for the `profiles` table. This blocks profile creation on signup!

### The Fix:
1. **Go to Supabase Dashboard** → SQL Editor
2. **Delete your old tables and policies:**
   ```sql
   -- Clean slate
   DROP TABLE IF EXISTS public.saved_destinations CASCADE;
   DROP TABLE IF EXISTS public.trips CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   ```

3. **Run the complete setup script:**
   - Open the file: `supabase-setup.sql`
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click "Run"

### What Changed:
✅ Added `INSERT` policy for profiles (was missing!)
✅ Added auto-create profile trigger (optional but helpful)
✅ Added proper indexes for performance
✅ Added DELETE policies
✅ Added UPDATE policies with proper checks

---

## 🔍 Step 2: Test with Debug Logging

I've added **detailed console logging** to every save operation.

### Start the app:
```bash
npm run dev
```

### Open Browser Console:
- Press `F12` or Right-click → Inspect
- Go to "Console" tab
- **Keep this open while testing!**

---

## 🧪 Step 3: Test Signup

1. **Try creating a new account**
2. **Watch the console** - you should see:

```
🔐 Starting signup process...
📧 Signup response: { data: {...}, error: null }
👤 Creating profile for user: abc-123-def
📝 Profile creation response: { data: [...], error: null }
✅ Profile created successfully!
```

### If you see an ERROR:
The console will show EXACTLY what went wrong. Common errors:

#### Error: "new row violates row-level security policy"
**Fix:** RLS policies are blocking insert. Re-run `supabase-setup.sql`

#### Error: "duplicate key value violates unique constraint"
**Fix:** User already exists. Try a different email or delete the user from Supabase.

#### Error: "permission denied for table profiles"
**Fix:** Run these in SQL Editor:
```sql
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.trips TO authenticated;
GRANT ALL ON public.saved_destinations TO authenticated;
```

---

## 🧪 Step 4: Test Save Destination

1. **Sign in** (after confirming email if needed)
2. **Fill preferences form** → Generate suggestions
3. **Click heart icon** on any destination
4. **Watch console:**

```
💾 Starting destination save...
👤 Current user: { id: "abc-123", email: "test@example.com", ... }
📝 Destination data to save: { user_id: "abc-123", name: "Paris", ... }
💾 Insert response: { data: [...], error: null }
✅ Destination saved successfully!
```

### If you see an ERROR:
The alert will show the exact error message + console has details.

#### Error: "new row violates row-level security policy for table 'saved_destinations'"
**Fix:** Missing INSERT policy. Re-run `supabase-setup.sql`

#### Error: "No user logged in"
**Fix:** Sign in first! The heart icon should only work when logged in.

---

## 🧪 Step 5: Test Save Trip

1. **Generate an itinerary**
2. **Click "Save Trip" button**
3. **Watch console:**

```
💾 Starting trip save...
👤 Current user: { id: "abc-123", ... }
📝 Trip data to save: { user_id: "abc-123", destination: "Tokyo", ... }
💾 Insert response: { data: [...], error: null }
✅ Trip saved successfully!
📊 Updating trip count...
📊 Profile query result: { profile: { trips_count: 0 }, ... }
📊 Profile update result: { error: null }
```

### If you see an ERROR:
Same as above - the console will tell you exactly what's wrong.

---

## ✅ Step 6: Verify in Supabase

### Check Tables:
1. Go to Supabase → **Table Editor**
2. Check each table:
   - `profiles` - Should have rows with user data
   - `trips` - Should have your saved trips
   - `saved_destinations` - Should have saved destinations

### Check Policies:
1. Go to Supabase → **Authentication** → **Policies**
2. You should see policies for:
   - `profiles` (3 policies: SELECT, INSERT, UPDATE)
   - `trips` (4 policies: SELECT, INSERT, UPDATE, DELETE)
   - `saved_destinations` (3 policies: SELECT, INSERT, DELETE)

### Check Users:
1. Go to Supabase → **Authentication** → **Users**
2. Should see your test user(s)

---

## 🔍 Common Issues & Fixes

### Issue 1: "Email not confirmed"
**Symptoms:** Can sign up but can't save data
**Fix:**
1. Check email for confirmation link
2. OR disable email confirmation in Supabase:
   - Settings → Authentication → Email Auth
   - Disable "Confirm email"

### Issue 2: "No profile row"
**Symptoms:** User exists but no profile
**Fix:** The trigger should auto-create it. If not:
```sql
-- Manually create profile
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

### Issue 3: "Policy is blocking"
**Symptoms:** "row-level security policy" errors
**Fix:** Re-run the FULL `supabase-setup.sql` script

### Issue 4: "User is null"
**Symptoms:** Console shows "No user logged in"
**Fix:**
1. Make sure you're signed in
2. Check session: Run in console:
   ```javascript
   supabase.auth.getSession().then(console.log)
   ```
3. If no session, sign in again

---

## 🚨 Emergency Reset

If nothing works, **complete reset**:

1. **Delete all data:**
   ```sql
   DROP TABLE IF EXISTS public.saved_destinations CASCADE;
   DROP TABLE IF EXISTS public.trips CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
   ```

2. **Delete all users:**
   - Supabase → Authentication → Users
   - Delete test users

3. **Run setup again:**
   - Copy entire `supabase-setup.sql`
   - Run in SQL Editor

4. **Test from scratch:**
   - Create new user
   - Watch console for errors

---

## 📊 Debugging Checklist

Before asking for help, check:

- [ ] Ran `supabase-setup.sql` in Supabase SQL Editor
- [ ] RLS is enabled on all tables
- [ ] INSERT policies exist for all tables
- [ ] Browser console is open (F12)
- [ ] Signed in with confirmed email
- [ ] Checked Supabase → Table Editor for data
- [ ] Checked console logs for specific error messages
- [ ] Environment variables are correct in `.env.local`

---

## 📸 Screenshot Your Console!

If still broken, send me a screenshot of:
1. Browser console showing the error logs
2. Supabase → Table Editor → Policies tab
3. Network tab showing the failed request

---

## 🎯 What Should Happen

### Successful Signup:
```
✅ User created in auth.users
✅ Profile created in profiles table
✅ Email sent (or skipped if disabled)
✅ User can log in
```

### Successful Save:
```
✅ Console shows green checkmarks
✅ Data appears in Supabase tables
✅ UI shows success state (green button/heart)
✅ Data appears in My Trips / Saved pages
```

---

## 🆘 Still Not Working?

**Run this diagnostic query in Supabase SQL Editor:**

```sql
-- Check current user's permissions
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'trips', 'saved_destinations');

-- Check trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Send me the results along with:**
- Console error messages
- Network tab errors
- What step you're stuck on

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ No red errors in console
2. ✅ Green checkmarks/success logs in console
3. ✅ Data appears in Supabase Table Editor
4. ✅ My Trips / Saved pages show your data
5. ✅ Buttons turn green after clicking

**Good luck! The detailed logging will tell us exactly what's wrong.** 🚀
