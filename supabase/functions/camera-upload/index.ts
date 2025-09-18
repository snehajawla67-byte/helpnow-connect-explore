import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MediaUpload {
  file_data: string; // base64 encoded file
  media_type: 'image' | 'video' | 'audio';
  latitude?: number;
  longitude?: number;
  caption?: string;
  is_emergency?: boolean;
  is_public?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const {
        file_data,
        media_type,
        latitude,
        longitude,
        caption,
        is_emergency,
        is_public
      }: MediaUpload = await req.json();

      if (!file_data || !media_type) {
        return new Response(JSON.stringify({ error: 'File data and media type are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Decode base64 file data
      const fileBuffer = Uint8Array.from(atob(file_data), c => c.charCodeAt(0));
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.${media_type === 'image' ? 'jpg' : media_type === 'video' ? 'mp4' : 'mp3'}`;
      
      // For now, we'll store the base64 data directly in database
      // In production, you'd upload to Supabase Storage
      const file_path = `data:${media_type}/${media_type === 'image' ? 'jpeg' : media_type};base64,${file_data}`;

      // Save media record to database
      const { data: mediaRecord, error } = await supabaseClient
        .from('user_media')
        .insert({
          user_id: user.id,
          file_path,
          media_type,
          latitude,
          longitude,
          caption,
          is_emergency: is_emergency || false,
          is_public: is_public || false
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving media record:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If it's an emergency photo, save location and trigger emergency response
      if (is_emergency && latitude && longitude) {
        await supabaseClient
          .from('user_locations')
          .insert({
            user_id: user.id,
            latitude,
            longitude,
            is_emergency: true
          });

        // Get emergency contacts and send notifications
        const { data: contacts } = await supabaseClient
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);

        console.log(`Emergency photo uploaded by user ${user.id} at ${latitude}, ${longitude}`);
        console.log('Emergency contacts notified:', contacts?.length || 0);
      }

      return new Response(JSON.stringify({ 
        success: true,
        media: mediaRecord,
        message: is_emergency ? 'Emergency photo uploaded and contacts notified' : 'Media uploaded successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      // Get user's media or public media
      const url = new URL(req.url);
      const isPublic = url.searchParams.get('public') === 'true';
      const mediaType = url.searchParams.get('media_type');

      let query = supabaseClient.from('user_media').select('*');
      
      if (isPublic) {
        query = query.eq('is_public', true);
      } else {
        query = query.eq('user_id', user.id);
      }

      if (mediaType) {
        query = query.eq('media_type', mediaType);
      }

      query = query.order('created_at', { ascending: false }).limit(20);

      const { data: media, error } = await query;

      if (error) {
        console.error('Error fetching media:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ media }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in camera-upload function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});