import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Music, Package, Folder, Pin, Trash2, Edit, Check, X, ExternalLink } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePacks, Pack } from '@/hooks/useSupabasePacks';
import { useAcapellas, Acapella } from '@/hooks/useAcapellas';
import { EditPackModal } from '@/components/EditPackModal';
import { EditAcapellaModal } from '@/components/EditAcapellaModal';
import { AddPremiumPackModal } from '@/components/AddPremiumPackModal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type MainTab = 'packs' | 'projetos' | 'acapellas';
type SubTab = 'pending' | 'approved' | 'rejected';

export default function Admin() {
  const { isAdmin, isLoading } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>('packs');
  const [subTab, setSubTab] = useState<SubTab>('pending');
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [editingAcapella, setEditingAcapella] = useState<Acapella | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const { 
    pendingPacks, 
    allApprovedPacks, 
    rejectedPacks,
    pendingProjectPacks,
    projectPacks,
    approvePack, 
    rejectPack, 
    deletePack,
    updatePack,
    pinPack,
  } = useSupabasePacks();

  const {
    acapellas,
    pendingAcapellas,
    rejectedAcapellas,
    approveAcapella,
    rejectAcapella,
    deleteAcapella,
    updateAcapella,
  } = useAcapellas();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/conta" replace />;
  }

  // Get current content based on tabs
  const getPacksContent = () => {
    const regularPacks = mainTab === 'packs' 
      ? (subTab === 'pending' ? pendingPacks.filter(p => p.pack_type !== 'project') : 
         subTab === 'approved' ? allApprovedPacks.filter(p => p.pack_type !== 'project') : 
         rejectedPacks.filter(p => p.pack_type !== 'project'))
      : (subTab === 'pending' ? pendingProjectPacks : 
         subTab === 'approved' ? projectPacks : 
         rejectedPacks.filter(p => p.pack_type === 'project'));
    return regularPacks;
  };

  const handleApprovePack = async (id: string) => {
    try {
      await approvePack(id);
      toast.success('Pack aprovado!');
    } catch {
      toast.error('Erro ao aprovar');
    }
  };

  const handleRejectPack = async (id: string) => {
    try {
      await rejectPack(id);
      toast.success('Pack rejeitado');
    } catch {
      toast.error('Erro ao rejeitar');
    }
  };

  const handleDeletePack = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este pack?')) return;
    try {
      await deletePack(id);
      toast.success('Pack deletado');
    } catch {
      toast.error('Erro ao deletar');
    }
  };

  const handlePinPack = async (id: string, isPinned: boolean) => {
    try {
      await pinPack(id, !isPinned);
      toast.success(isPinned ? 'Pack desafixado' : 'Pack fixado!');
    } catch {
      toast.error('Erro ao fixar');
    }
  };

  const handleApproveAcapella = async (id: string) => {
    try {
      await approveAcapella(id);
      toast.success('Acapella aprovada!');
    } catch {
      toast.error('Erro ao aprovar');
    }
  };

  const handleRejectAcapella = async (id: string) => {
    try {
      await rejectAcapella(id);
      toast.success('Acapella rejeitada');
    } catch {
      toast.error('Erro ao rejeitar');
    }
  };

  const handleDeleteAcapella = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta acapella?')) return;
    try {
      await deleteAcapella(id);
      toast.success('Acapella deletada');
    } catch {
      toast.error('Erro ao deletar');
    }
  };

  const getCurrentAcapellas = () => {
    if (subTab === 'pending') return pendingAcapellas;
    if (subTab === 'approved') return acapellas;
    return rejectedAcapellas;
  };

  const mainTabs = [
    { id: 'packs' as const, label: 'Packs', icon: Package },
    { id: 'projetos' as const, label: 'Projetos', icon: Folder },
    { id: 'acapellas' as const, label: 'Acapellas', icon: Music },
  ];

  const subTabs = [
    { id: 'pending' as const, label: 'Pendentes', icon: Clock },
    { id: 'approved' as const, label: 'Aprovados', icon: CheckCircle },
    { id: 'rejected' as const, label: 'Rejeitados', icon: XCircle },
  ];

  const getCount = (sub: SubTab) => {
    if (mainTab === 'acapellas') {
      if (sub === 'pending') return pendingAcapellas.length;
      if (sub === 'approved') return acapellas.length;
      return rejectedAcapellas.length;
    }
    if (mainTab === 'projetos') {
      if (sub === 'pending') return pendingProjectPacks.length;
      if (sub === 'approved') return projectPacks.length;
      return rejectedPacks.filter(p => p.pack_type === 'project').length;
    }
    if (sub === 'pending') return pendingPacks.filter(p => p.pack_type !== 'project').length;
    if (sub === 'approved') return allApprovedPacks.filter(p => p.pack_type !== 'project').length;
    return rejectedPacks.filter(p => p.pack_type !== 'project').length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/conta"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          
          <h1 className="text-xl font-black uppercase tracking-tight">
            Painel ADM
          </h1>
          
          <div className="w-16" />
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMainTab(tab.id); setSubTab('pending'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                mainTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                subTab === tab.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-foreground/10">
                {getCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {mainTab === 'acapellas' ? (
            getCurrentAcapellas().length === 0 ? (
              <div className="pack-card text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma acapella {subTab === 'pending' ? 'pendente' : subTab === 'approved' ? 'aprovada' : 'rejeitada'}.
                </p>
              </div>
            ) : (
              getCurrentAcapellas().map((acapella) => (
                <div key={acapella.id} className="pack-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{acapella.artist_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(acapella.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <a 
                        href={acapella.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver download
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      {subTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveAcapella(acapella.id)}
                            className="p-2 rounded-lg bg-success text-success-foreground hover:opacity-90"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectAcapella(acapella.id)}
                            className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {subTab !== 'pending' && (
                        <>
                          <button
                            onClick={() => setEditingAcapella(acapella)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAcapella(acapella.id)}
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            getPacksContent().length === 0 ? (
              <div className="pack-card text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum {mainTab === 'projetos' ? 'projeto' : 'pack'} {subTab === 'pending' ? 'pendente' : subTab === 'approved' ? 'aprovado' : 'rejeitado'}.
                </p>
              </div>
            ) : (
              getPacksContent().map((pack) => (
                <div key={pack.id} className="pack-card">
                  <div className="flex gap-4">
                    {pack.cover_url ? (
                      <img src={pack.cover_url} alt={pack.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          pack.is_premium ? 'bg-premium/20 text-premium' : 'bg-primary/20 text-primary'
                        }`}>
                          {pack.pack_type}
                        </span>
                        {pack.is_pinned && (
                          <Pin className="w-3 h-3 text-warning" />
                        )}
                      </div>
                      <h3 className="font-bold truncate">{pack.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        @{pack.is_anonymous ? 'Anônimo' : pack.author_name} • {format(new Date(pack.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {pack.is_premium && (
                        <p className="text-xs text-premium font-bold mt-1">R$ {pack.price?.toFixed(2)}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {subTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprovePack(pack.id)}
                            className="p-2 rounded-lg bg-success text-success-foreground hover:opacity-90"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectPack(pack.id)}
                            className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {subTab !== 'pending' && (
                        <>
                          <button
                            onClick={() => handlePinPack(pack.id, pack.is_pinned)}
                            className={`p-2 rounded-lg ${pack.is_pinned ? 'bg-warning/20 text-warning' : 'bg-secondary hover:bg-secondary/80'}`}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPack(pack)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePack(pack.id)}
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <EditPackModal
        isOpen={!!editingPack}
        pack={editingPack}
        onClose={() => setEditingPack(null)}
        onSave={async (id, updates) => {
          await updatePack({ id, ...updates });
          toast.success('Pack atualizado!');
        }}
      />

      <EditAcapellaModal
        isOpen={!!editingAcapella}
        acapella={editingAcapella}
        onClose={() => setEditingAcapella(null)}
        onSave={async (id, updates) => {
          await updateAcapella({ id, ...updates });
          toast.success('Acapella atualizada!');
        }}
      />

      <AddPremiumPackModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onAdd={async () => {}}
      />
    </div>
  );
}