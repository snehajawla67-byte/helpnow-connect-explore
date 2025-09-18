import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyRequest {
  latitude: number;
  longitude: number;
  emergency_type: 'medical' | 'police' | 'fire' | 'general';
  description?: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = critical
}

interface IncidentReport {
  latitude: number;
  longitude: number;
  incident_type: 'theft' | 'assault' | 'fraud' | 'harassment' | 'accident' | 'medical' | 'other';
  description?: string;
  severity: 1 | 2 | 3 | 4 | 5;
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

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    if (req.method === 'POST') {
      if (endpoint === 'emergency') {
        // Handle emergency request
        if (!user) {
          // Allow emergency requests even without authentication
          console.log('Emergency request from unauthenticated user');
        }

        const {
          latitude,
          longitude,
          emergency_type,
          description,
          severity
        }: EmergencyRequest = await req.json();

        if (!latitude || !longitude || !emergency_type) {
          return new Response(JSON.stringify({ error: 'Location and emergency type are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Save emergency location if user is authenticated
        if (user) {
          await supabaseClient
            .from('user_locations')
            .insert({
              user_id: user.id,
              latitude,
              longitude,
              is_emergency: true
            });

          // Get emergency contacts
          const { data: contacts } = await supabaseClient
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', user.id);

          console.log(`Emergency contacts to notify: ${contacts?.length || 0}`);
        }

        // Find nearby emergency services
        const { data: emergencyServices } = await supabaseClient
          .rpc('get_nearby_places', {
            user_lat: latitude,
            user_lon: longitude,
            radius_meters: 10000, // 10km radius
            place_type: emergency_type === 'medical' ? 'hospital' : 
                       emergency_type === 'police' ? 'police' :
                       emergency_type === 'fire' ? 'safety' : null
          });

        // Simulate emergency response (in real app, integrate with actual emergency services)
        const emergencyResponse = {
          request_id: `EMR-${Date.now()}`,
          status: 'dispatched',
          estimated_arrival: '8-12 minutes',
          nearest_services: emergencyServices?.slice(0, 3) || [],
          emergency_number: emergency_type === 'medical' ? '108' :
                           emergency_type === 'police' ? '100' : 
                           emergency_type === 'fire' ? '101' : '112'
        };

        console.log(`Emergency request processed: ${emergency_type} at ${latitude}, ${longitude}`);
        console.log(`Severity: ${severity}, Description: ${description}`);

        return new Response(JSON.stringify({
          success: true,
          emergency_response: emergencyResponse,
          message: `Emergency services have been notified. Response dispatched.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (endpoint === 'report-incident') {
        // Handle incident reporting
        if (!user) {
          return new Response(JSON.stringify({ error: 'Authentication required for incident reporting' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const {
          latitude,
          longitude,
          incident_type,
          description,
          severity
        }: IncidentReport = await req.json();

        if (!latitude || !longitude || !incident_type) {
          return new Response(JSON.stringify({ error: 'Location and incident type are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: incident, error } = await supabaseClient
          .from('incident_reports')
          .insert({
            reporter_id: user.id,
            latitude,
            longitude,
            incident_type,
            description,
            severity
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving incident report:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // If high severity, create a safety zone warning
        if (severity >= 4) {
          await supabaseClient
            .from('safety_zones')
            .insert({
              name: `${incident_type} incident area`,
              zone_type: 'caution',
              latitude,
              longitude,
              radius_meters: 200,
              description: `Recent ${incident_type} incident reported. Exercise caution.`,
              risk_level: severity,
              created_by: user.id,
              verified: false
            });
        }

        console.log(`Incident reported: ${incident_type} at ${latitude}, ${longitude} by user ${user.id}`);

        return new Response(JSON.stringify({
          success: true,
          incident,
          message: 'Incident report submitted successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (req.method === 'GET' && endpoint === 'emergency-contacts') {
      // Get user's emergency contacts
      if (!user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: contacts, error } = await supabaseClient
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) {
        console.error('Error fetching emergency contacts:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ contacts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint or method' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in emergency-services function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});