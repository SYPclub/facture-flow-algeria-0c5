
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    // Format users before returning
    const formattedUsers = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Unnamed User",
      role: user.user_metadata?.role || "viewer",
      active: user.user_metadata?.active !== false,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at,
    }));
    
    return new Response(JSON.stringify({ users: formattedUsers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error in admin-users function:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to fetch users. Make sure service role key is configured." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
