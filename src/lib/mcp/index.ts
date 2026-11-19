import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchPacks from "./tools/search-packs";
import listAcapellas from "./tools/list-acapellas";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "packy",
  title: "PACKY",
  version: "0.1.0",
  instructions: "Tools for PACKY, a music pack and acapella platform. Search approved packs and browse acapella MCs.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchPacks, listAcapellas],
});
