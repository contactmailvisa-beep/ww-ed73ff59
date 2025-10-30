import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("PayPal IPN received");

    // Get form data from PayPal
    const formData = await req.formData();
    const ipnData: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      ipnData[key] = value.toString();
    }

    console.log("IPN Data:", ipnData);

    // Verify IPN by sending it back to PayPal
    const verifyUrl = ipnData.test_ipn === "1" 
      ? "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
      : "https://ipnpb.paypal.com/cgi-bin/webscr";

    const verifyBody = new URLSearchParams();
    verifyBody.append("cmd", "_notify-validate");
    
    for (const [key, value] of Object.entries(ipnData)) {
      verifyBody.append(key, value);
    }

    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      body: verifyBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const verifyText = await verifyResponse.text();
    console.log("PayPal verification response:", verifyText);

    if (verifyText !== "VERIFIED") {
      console.error("IPN verification failed:", verifyText);
      return new Response(JSON.stringify({ error: "IPN verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // IPN is verified, now process it
    const paymentStatus = ipnData.payment_status;
    const txnId = ipnData.txn_id;
    const customData = ipnData.custom; // This will contain our payment ID
    const payerEmail = ipnData.payer_email;
    const amount = ipnData.mc_gross;
    const currency = ipnData.mc_currency;

    console.log("Payment verified:", {
      status: paymentStatus,
      txnId,
      customData,
      amount,
      currency,
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update payment status in database
    if (paymentStatus === "Completed" && customData) {
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("id", customData)
        .single();

      if (fetchError || !payment) {
        console.error("Payment not found:", customData);
        return new Response(JSON.stringify({ error: "Payment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          payment_id: txnId,
          payer_email: payerEmail,
        })
        .eq("id", customData);

      if (updateError) {
        console.error("Error updating payment:", updateError);
        return new Response(JSON.stringify({ error: "Failed to update payment" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Payment updated successfully:", customData);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("IPN Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});