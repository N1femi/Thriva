import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and time 30 minutes from now
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

    // Find events starting within the next 30 minutes
    const { data: upcomingEvents, error } = await supabase
      .from('events')
      .select('id, user_id, title, start_time')
      .gte('start_time', now.toISOString())
      .lte('start_time', in30Minutes.toISOString());

    if (error) {
      console.error('Error fetching events:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No upcoming events', sent: 0 }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Send notifications for each upcoming event
    let notificationsSent = 0;
    for (const event of upcomingEvents) {
      // Check if notification already sent for this event
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', event.user_id)
        .eq('type', 'calendar_event')
        .contains('metadata', { event_id: event.id })
        .gte('created_at', new Date(now.getTime() - 60 * 60 * 1000).toISOString()) // Last hour
        .maybeSingle();

      // Skip if notification already sent recently
      if (existingNotification) continue;

      // Check user notification preferences
      const { data: preference } = await supabase
        .from('notification_preferences')
        .select('enabled')
        .eq('user_id', event.user_id)
        .eq('notification_type', 'calendar_event')
        .maybeSingle();

      // If preference is explicitly disabled, don't send notification
      if (preference && !preference.enabled) {
        continue;
      }

      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: event.user_id,
          type: 'calendar_event',
          title: 'Event Starting Soon',
          message: `Your event "${event.title}" is starting in 30 minutes!`,
          read: false,
          metadata: { event_id: event.id },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (!notifError) {
        notificationsSent++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${upcomingEvents.length} events, sent ${notificationsSent} notifications`,
        sent: notificationsSent 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

