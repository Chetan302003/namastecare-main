import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicine_name, dosage, member_name, phone_number } = await req.json();

    if (!phone_number) {
      throw new Error("Phone number is required");
    }

    // Voice API Configuration (e.g., Bland AI or Twilio)
    // Note: You will need to set BLAND_AI_API_KEY in your Supabase project secrets
    const VOICE_API_KEY = Deno.env.get("BLAND_AI_API_KEY");
    
    if (!VOICE_API_KEY) {
      console.warn("BLAND_AI_API_KEY not set. Mocking call for now.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `[MOCK] Calling ${phone_number} for ${member_name}: "Time to take ${medicine_name} ${dosage}"` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Example using Bland AI (Natural AI Voice)
    const response = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        "authorization": VOICE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phone_number,
        task: `You are a helpful health assistant. Call ${member_name} and tell them it's time to take their medicine: ${medicine_name} ${dosage}. Speak in a friendly, caring tone. Use Hindi-English (Hinglish) if possible.`,
        voice: "nat", // Use a natural voice
        language: "en-US", // Better for generic Hinglish than pure Hindi sometimes
        wait_for_greeting: true,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-medicine-reminder:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
