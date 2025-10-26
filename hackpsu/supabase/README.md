# Supabase Edge Functions & Database Setup

This directory contains edge functions and database configuration for dynamic notifications.

## Edge Functions

### 1. `send-notification`
Generic edge function to create notifications programmatically.

**Usage:**
```typescript
const response = await supabase.functions.invoke('send-notification', {
  body: {
    user_id: 'user-uuid',
    type: 'notification_type',
    title: 'Notification Title',
    message: 'Notification message',
    metadata: { /* optional */ }
  }
});
```

### 2. `event-reminder`
Checks for events starting within the next 30 minutes and sends reminder notifications.

**Usage:**
Call via HTTP request or schedule as a cron job:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/event-reminder
```

### 3. `badge-notification`
Creates notifications for badge earnings (alternative to database triggers).

**Usage:**
```typescript
const response = await supabase.functions.invoke('badge-notification', {
  body: {
    user_id: 'user-uuid',
    badge_name: 'Badge Name'
  }
});
```

## Database Triggers

The following database triggers automatically create notifications:

1. **`on_journal_entry_created`** - Triggers when a journal entry is created
2. **`on_badge_earned`** - Triggers when a user earns a badge
3. **`on_friend_added`** - Triggers when a friendship is created

These triggers are automatically set up in your database via migrations.

## Scheduling Event Reminders

### Option 1: Using Supabase Cron Jobs (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to Database → Cron Jobs
3. Create a new cron job:

```sql
SELECT net.http_post(
  url := 'https://your-project.supabase.co/functions/v1/event-reminder',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
  )
) as request_id;
```

4. Schedule it to run every 5 minutes: `*/5 * * * *`

### Option 2: Using External Cron Service

Schedule a cron job on your server or using a service like:
- Vercel Cron (if deployed on Vercel)
- GitHub Actions
- AWS EventBridge
- Any cron service that can make HTTP requests

Example cron schedule (runs every 5 minutes):
```bash
*/5 * * * * curl -X POST https://your-project.supabase.co/functions/v1/event-reminder
```

### Option 3: Client-side Polling (Not Recommended)

You can have your frontend periodically call the event-reminder function, though this is not efficient.

## Notification Flow

### Automatic Notifications (Database Triggers)
- ✅ Journal entry created → Notification sent automatically
- ✅ Badge earned → Notification sent automatically  
- ✅ Friend added → Notification sent to both users automatically

### Manual Notifications (Edge Functions)
- Event reminders → Call `event-reminder` function via cron job
- Custom notifications → Call `send-notification` function programmatically

## Testing

### Test Event Reminder
```bash
curl -X POST https://your-project.supabase.co/functions/v1/event-reminder \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test Send Notification
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "type": "custom",
    "title": "Test",
    "message": "This is a test notification"
  }'
```

## Environment Variables

Make sure these are set in your Supabase project settings:
- `SUPABASE_URL` - Automatically set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically set by Supabase

These are automatically available to edge functions.

