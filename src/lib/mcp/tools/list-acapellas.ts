import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_acapellas",
  title: "List acapella MCs",
  description: "List MCs in PACKY's Acapella section, optionally filtered by name.",
  inputSchema: { query: z.string().max(100).optional().describe("Filter by MC name.") },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ query }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase.from("acapellas").select("id,artist_name").limit(100);
    if (query) q = q.ilike("artist_name", `%${query}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const mcs = (data ?? []).map((m) => ({ id: String(m.id), name: String(m.artist_name ?? "") }));
    return { content: [{ type: "text", text: mcs.length ? mcs.map((m) => m.name).join("\n") : "No MCs found." }], structuredContent: { mcs } };
  },
});
