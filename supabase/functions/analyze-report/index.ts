import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") 
    {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Get auth token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const memberName = formData.get("memberName") as string || "Self";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64Data = btoa(binary);

    let mimeType = file.type;
    if (!mimeType) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'png') mimeType = 'image/png';
      else mimeType = 'image/jpeg';
    }

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("health-reports")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to upload report file");
    }

    // Call Gemini Vision API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: `You are a medical lab report analyzer for Indian patients. Analyze this health report image/document and return a JSON response with exactly this structure:
{
  "report_name": "Name of the test (e.g. Complete Blood Count, Lipid Profile, Thyroid Panel)",
  "status": "normal" or "warning" or "critical",
  "summary": "A 2-3 sentence clinical summary in simple English. Mention key findings and recommendations.",
  "flags": [
    { "label": "Parameter: Value Unit", "status": "green" or "amber" or "red" }
  ]
}

Rules:
- status should be "critical" if any flag is "red", "warning" if any flag is "amber", "normal" if all flags are "green"
- flag status: "green" = normal range, "amber" = borderline/slightly abnormal, "red" = significantly abnormal
- Include all key parameters from the report as flags
- Use standard medical units
- Return ONLY valid JSON, no markdown or extra text`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (strip markdown code fences if present)
    const jsonMatch = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let analysis;
    try {
      analysis = JSON.parse(jsonMatch);
    } catch {
      console.error("Failed to parse Gemini response:", rawText);
      throw new Error("Failed to parse AI analysis. Please try with a clearer image.");
    }

    // Store in database
    const { data: record, error: insertError } = await supabase
      .from("health_records")
      .insert({
        user_id: user.id,
        member_name: memberName,
        report_name: analysis.report_name || "Health Report",
        status: analysis.status || "normal",
        summary: analysis.summary || "Analysis complete.",
        flags: analysis.flags || [],
        original_filename: file.name,
        file_path: filePath,
      })
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      throw new Error("Failed to save record");
    }

    return new Response(JSON.stringify({ success: true, record }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-report error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
