import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_packs",
  title: "Search packs",
  description: "Search approved PACKY packs by title (newest first). Download links are not included.",
  inputSchema: {
    query: z.string().max(100).optional().describe("Text to search in pack titles. Omit to list the latest."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase.from("packs")
      .select("id,title,author_name,pack_type,created_at,likes_count")
      .eq("status", "approved").eq("is_private", false).is("deleted_at", null)
      .order("created_at", { ascending: false }).limit(limit ?? 20);
    if (query) q = q.ilike("title", `%${query}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const packs = (data ?? []).map((p) => ({
      id: String(p.id), title: String(p.title), author: p.author_name ? String(p.author_name) : null,
      type: p.pack_type ? String(p.pack_type) : null, created_at: p.created_at ? String(p.created_at) : null,
      likes: typeof p.likes_count === "number" ? p.likes_count : 0,
    }));
    const text = packs.length ? packs.map((p) => `${p.id}: ${p.title}${p.author ? ` — ${p.author}` : ""}`).join("\n") : "No packs found.";
    return { content: [{ type: "text", text }], structuredContent: { packs } };
  },
});
