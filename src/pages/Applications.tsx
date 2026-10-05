import { ExternalLink, Smartphone } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useApplications } from '@/hooks/useApplications';

export default function Applications() {
  const { applications, isLoading } = useApplications();
  const activeApplications = applications.filter((app) => app.is_active);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <header className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">PACKy</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Aplicativos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aplicativos e ferramentas selecionados para a comunidade.
          </p>
        </header>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : activeApplications.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <Smartphone className="mx-auto h-7 w-7 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum aplicativo disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeApplications.map((app) => (
              <a
                key={app.id}
                href={app.app_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-colors hover:bg-foreground/[0.04]"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-[#1B1B1B] flex items-center justify-center">
                  {app.icon_url ? (
                    <img src={app.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Smartphone className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold truncate">{app.name}</h2>
                  {app.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{app.description}</p>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
