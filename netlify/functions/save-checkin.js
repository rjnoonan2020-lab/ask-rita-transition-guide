import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const json = (statusCode, obj) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(obj)
});

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        body: ""
      };
    }

    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();
    const focus = (body.focus || "").trim();
    const reminder = (body.reminder || "").trim();
    const step = (body.step || "").trim();
    const reflection = (body.reflection || "").trim();

    if (!email || !email.includes("@")) return json(400, { error: "Valid email required." });
    if (!focus || !reminder || !step || !reflection) return json(400, { error: "Missing required fields." });

    const { error } = await supabase
      .from("rita_checkins")
      .insert([{ email, focus, reminder, step, reflection }]);

    if (error) throw error;

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: err?.message || String(err) });
  }
};
