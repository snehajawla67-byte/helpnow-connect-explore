import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  is_emergency?: boolean;
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
      // Save user location
      const { latitude, longitude, accuracy, is_emergency }: LocationData = await req.json();
      
      if (!latitude || !longitude) {
        return new Response(JSON.stringify({ error: 'Latitude and longitude are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get address using reverse geocoding (mock for now)
      const address = `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      const { data, error } = await supabaseClient
        .from('user_locations')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          address,
          accuracy_meters: accuracy,
          is_emergency: is_emergency || false
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving location:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If emergency, check safety in the area
      let safetyData = null;
      if (is_emergency) {
        const { data: safety } = await supabaseClient
          .rpc('check_area_safety', {
            check_lat: latitude,
            check_lon: longitude,
            radius_meters: 1000
          });
        safetyData = safety?.[0] || null;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        location: data,
        safety: safetyData,
        address
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      // Get nearby places
      const url = new URL(req.url);
      const latitude = parseFloat(url.searchParams.get('latitude') || '0');
      const longitude = parseFloat(url.searchParams.get('longitude') || '0');
      const radius = parseInt(url.searchParams.get('radius') || '5000');
      const type = url.searchParams.get('type') || null;

      if (!latitude || !longitude) {
        return new Response(JSON.stringify({ error: 'Latitude and longitude are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: places, error } = await supabaseClient
        .rpc('get_nearby_places', {
          user_lat: latitude,
          user_lon: longitude,
          radius_meters: radius,
          place_type: type
        });

      if (error) {
        console.error('Error fetching nearby places:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check area safety
      const { data: safety } = await supabaseClient
        .rpc('check_area_safety', {
          check_lat: latitude,
          check_lon: longitude,
          radius_meters: 1000
        });

      return new Response(JSON.stringify({ 
        places: places || [],
        safety: safety?.[0] || null,
        location: { latitude, longitude }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in location-services function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});