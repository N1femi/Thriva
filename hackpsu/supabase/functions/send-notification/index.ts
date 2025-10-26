import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  try {
    const { user_id, type, title, message, metadata } = await req.json() as NotificationPayload;

    if (!user_id || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check user notification preferences
    const { data: preference } = await supabase
      .from('notification_preferences')
      .select('enabled')
      .eq('user_id', user_id)
      .eq('notification_type', type)
      .maybeSingle();

    // If preference is explicitly disabled, don't send notification
    if (preference && !preference.enabled) {
      return new Response(
        JSON.stringify({ success: true, message: 'Notification disabled by user preference' }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        metadata: metadata || {},
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
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

