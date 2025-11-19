# Testing Guide - Saved & My Trips Features

## Prerequisites - IMPORTANT!

### 1. Update Supabase Database Schema

**YOU MUST RUN THIS FIRST** or the features won't work!

1. Open your Supabase project: https://wjypyeltcnbjowzqfiev.supabase.co
2. Go to SQL Editor
3. Copy and paste the entire content of `supabase-setup.sql`
4. Click "Run" to execute

This will:
- Add `itinerary_data` and `preferences` columns to the `trips` table
- Create the new `saved_itineraries` table
- Update all indexes and RLS policies

## Features to Test

### Feature 1: Save Complete Itineraries

**How to Test:**
1. Go to Home page
2. Fill out preferences form and submit
3. Select a destination from suggestions
4. Wait for the itinerary to generate
5. You'll see TWO save buttons:
   - **"Add to My Trips"** (Red) - Saves to trips table with dates and status
   - **"Save for Later"** (Purple) - Saves to saved_itineraries for bookmarking

**What Gets Saved:**
- Complete itinerary with all days and activities
- All costs and budget breakdown
- Flight and hotel options
- Original preferences

### Feature 2: Saved Page (Purple Theme)

**How to Test:**
1. After saving an itinerary with "Save for Later", go to "Saved" from sidebar
2. You should see cards showing:
   - Destination name and image
   - Trip duration (e.g., "5 Days")
   - Estimated cost
   - Summary text
   - Quick stats: days, activities, flights, hotels
3. Click **"View Full Itinerary"** to see the complete generated page
4. Close button (X) at top-right to return to list
5. Delete button (trash icon) to remove saved items

**Expected Behavior:**
- Empty state if no saved itineraries
- Purple-themed cards
- Full itinerary view with all days, activities, and booking options

### Feature 3: My Trips Page (Red Theme)

**How to Test:**
1. After saving with "Add to My Trips", go to "My Trips" from sidebar
2. You should see:
   - Filter tabs: All, Upcoming, Draft, Completed
   - Trip cards with status badges
   - Dates (if provided) or "Dates TBD"
   - Full trip information
3. Click **"View Full Itinerary"** to see complete details
4. Delete button (trash icon) to remove trips

**Expected Behavior:**
- Trips are filterable by status
- Shows complete itinerary data
- Updates profile trip count when deleting
- Empty state messages per filter

## Verification Checklist

### Database:
- [ ] SQL script executed successfully in Supabase
- [ ] `trips` table has `itinerary_data` and `preferences` columns
- [ ] `saved_itineraries` table exists

### Saved Page:
- [ ] Can save itinerary with "Save for Later"
- [ ] Saved items appear in grid
- [ ] Can view full itinerary
- [ ] Can delete saved items
- [ ] Shows proper empty state

### My Trips Page:
- [ ] Can save trip with "Add to My Trips"
- [ ] Trips appear with correct status
- [ ] Filter tabs work (All, Upcoming, Draft, Completed)
- [ ] Can view full itinerary
- [ ] Can delete trips
- [ ] Shows proper empty state per filter

### ItineraryView:
- [ ] Two save buttons are visible
- [ ] "Add to My Trips" saves to trips table
- [ ] "Save for Later" saves to saved_itineraries table
- [ ] Success messages show after saving
- [ ] Can't click buttons while saving

## Common Issues & Solutions

### Issue: Save buttons don't work
**Solution:** Make sure you:
1. Are signed in
2. Ran the SQL script in Supabase
3. Check browser console for errors

### Issue: Empty states showing even after saving
**Solution:**
1. Check Supabase Data Editor to verify data was saved
2. Verify you're viewing the correct page (Saved vs My Trips)
3. Check browser console for RLS policy errors

### Issue: View Full Itinerary shows error
**Solution:**
1. Verify `itinerary_data` column is jsonb type
2. Check that the data was saved correctly
3. Verify RLS policies are set up correctly

## Testing Without Mock Data

All data is fetched from real Supabase tables:
- `saved_itineraries` - Stores saved itineraries
- `trips` - Stores planned trips

No mock data is used anywhere in the implementation.

## Database Verification

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check trips table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trips';

-- Check saved_itineraries table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'saved_itineraries';

-- Check saved data
SELECT id, destination, created_at
FROM saved_itineraries
ORDER BY created_at DESC;

-- Check trips data
SELECT id, destination, status, created_at
FROM trips
ORDER BY created_at DESC;
```

## Next Steps After Testing

Once verified:
1. Update trip status manually in Supabase if needed
2. Test date filtering with different trip statuses
3. Test with multiple saved items
4. Test delete functionality thoroughly
