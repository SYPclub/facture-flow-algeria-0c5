
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function would be deployed as an edge function with access to the service_role key
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client with service_role key
    const supabaseUrl = "http://198.46.199.100:8000";
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q";
    
    if (!supabaseServiceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user data from request
    const { user } = await req.json();
    
    if (!user || !user.email || !user.password) {
      throw new Error("Email and password are required");
    }
    
    // Create the user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
        active: user.active
      }
    });
    
    if (createError) {
      throw createError;
    }
    
    return new Response(JSON.stringify({ 
      message: "User created successfully", 
      user: userData.user 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
    
  } catch (error) {
    console.error("Error in admin-create-user function:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to create user" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
