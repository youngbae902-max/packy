import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const { user, isLoading } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const returnPath = window.location.pathname + window.location.search;

  useEffect(() => {
    if (!authorizationId) { setError("Pedido de autorização inválido."); return; }
    if (isLoading || !user) return;
    let active = true;
    (async () => {
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId, user, isLoading]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("O servidor não retornou um destino."); }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "um app";
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      {!isLoading && !user && authorizationId && (
        <AuthModal isOpen onClose={() => {}} returnTo={returnPath} />
      )}
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4">
        {error ? (
          <p className="text-sm text-muted-foreground">Não foi possível carregar este pedido: {error}</p>
        ) : !details ? (
          <p className="text-sm text-muted-foreground animate-pulse">Carregando…</p>
        ) : (
          <>
            <h1 className="font-display text-xl font-semibold">Conectar {clientName} ao PACKY</h1>
            <p className="text-sm text-muted-foreground">Isso permite que {clientName} use o PACKY como você ({user?.email}).</p>
            {details?.redirect_uri && <p className="text-xs text-muted-foreground break-all">{details.redirect_uri}</p>}
            {details?.scope && <p className="text-xs text-muted-foreground">Permissões: {details.scope}</p>}
            <p className="text-xs text-muted-foreground">Isso não ignora as permissões do PACKY.</p>
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => decide(false)} className="flex-1 h-11 rounded-xl border border-border text-sm">Cancelar</button>
              <button disabled={busy} onClick={() => decide(true)} className="flex-1 h-11 rounded-xl bg-foreground text-background text-sm font-semibold">Aprovar</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
