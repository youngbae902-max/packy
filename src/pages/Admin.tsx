import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Music, Package, Folder, Pin, Trash2, Edit, Check, X, ExternalLink, Users, Gift, Ban, Shield, Disc } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePacks, Pack } from '@/hooks/useSupabasePacks';
import { useAcapellas, Acapella } from '@/hooks/useAcapellas';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWishlist } from '@/hooks/useWishlist';
import { useAlbums } from '@/hooks/useAlbums';
import { EditPackModal } from '@/components/EditPackModal';
import { EditAcapellaModal } from '@/components/EditAcapellaModal';
import { AddAlbumModal } from '@/components/AddAlbumModal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type MainTab = 'packs' | 'projetos' | 'acapellas' | 'usuarios' | 'desejos' | 'albuns';
type SubTab = 'pending' | 'approved' | 'rejected';

export default function Admin() {
  const { isAdmin, isLoading } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>('packs');
  const [subTab, setSubTab] = useState<SubTab>('pending');
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [editingAcapella, setEditingAcapella] = useState<Acapella | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [giftModal, setGiftModal] = useState<{ userId: string; username: string } | null>(null);
  const [selectedGiftPack, setSelectedGiftPack] = useState('');
  const [wishResponse, setWishResponse] = useState('');
  const [respondingWish, setRespondingWish] = useState<string | null>(null);
  
  const { pendingPacks, allApprovedPacks, rejectedPacks, pendingProjectPacks, projectPacks, approvePack, rejectPack, deletePack, updatePack, pinPack } = useSupabasePacks();
  const { acapellas, pendingAcapellas, rejectedAcapellas, approveAcapella, rejectAcapella, deleteAcapella, updateAcapella } = useAcapellas();
  const { users, isUserAdmin, banUser, sendGift, toggleAdmin } = useUserManagement();
  const { pendingWishlists, respondToWish } = useWishlist();
  const { albums, deleteAlbum } = useAlbums();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  if (!isAdmin) return <Navigate to="/conta" replace />;

  const getPacksContent = () => {
    const regularPacks = mainTab === 'packs' 
      ? (subTab === 'pending' ? pendingPacks.filter(p => p.pack_type !== 'project') : subTab === 'approved' ? allApprovedPacks.filter(p => p.pack_type !== 'project') : rejectedPacks.filter(p => p.pack_type !== 'project'))
      : (subTab === 'pending' ? pendingProjectPacks : subTab === 'approved' ? projectPacks : rejectedPacks.filter(p => p.pack_type === 'project'));
    return regularPacks;
  };

  const getCurrentAcapellas = () => subTab === 'pending' ? pendingAcapellas : subTab === 'approved' ? acapellas : rejectedAcapellas;

  const mainTabs = [
    { id: 'packs' as const, label: 'Packs', icon: Package },
    { id: 'projetos' as const, label: 'Projetos', icon: Folder },
    { id: 'acapellas' as const, label: 'Acapellas', icon: Music },
    { id: 'usuarios' as const, label: 'Usuários', icon: Users },
    { id: 'desejos' as const, label: 'Pedidos', icon: Gift },
    { id: 'albuns' as const, label: 'Álbuns', icon: Disc },
  ];

  const subTabs = [
    { id: 'pending' as const, label: 'Pendentes', icon: Clock },
    { id: 'approved' as const, label: 'Aprovados', icon: CheckCircle },
    { id: 'rejected' as const, label: 'Rejeitados', icon: XCircle },
  ];

  const handleSendGift = () => {
    if (!giftModal || !selectedGiftPack) return;
    sendGift({ userId: giftModal.userId, packId: selectedGiftPack });
    setGiftModal(null);
    setSelectedGiftPack('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/conta" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Voltar</Link>
          <h1 className="text-xl font-black uppercase">Painel ADM</h1>
          <div className="w-16" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {mainTabs.map((tab) => (
            <button key={tab.id} onClick={() => { setMainTab(tab.id); setSubTab('pending'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${mainTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {(mainTab === 'packs' || mainTab === 'projetos' || mainTab === 'acapellas') && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {subTabs.map((tab) => (
              <button key={tab.id} onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${subTab === tab.id ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}>
                <tab.icon className="w-3 h-3" />{tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {mainTab === 'usuarios' && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="pack-card flex items-center gap-4">
                <img src={u.avatar_url || '/placeholder.svg'} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">@{u.username || 'sem-username'}</span>
                    {isUserAdmin(u.user_id) && <Badge className="bg-primary/20 text-primary text-xs">Admin</Badge>}
                    {u.is_banned && <Badge variant="destructive" className="text-xs">Banido</Badge>}
                    {u.is_online && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{u.artist_name || 'Sem nome'}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setGiftModal({ userId: u.user_id, username: u.username || 'usuário' })}><Gift className="w-4 h-4" /></Button>
                  <Button size="sm" variant={u.is_banned ? 'default' : 'destructive'} onClick={() => banUser({ userId: u.user_id, ban: !u.is_banned })}><Ban className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toggleAdmin({ userId: u.user_id, makeAdmin: !isUserAdmin(u.user_id) })}><Shield className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Tab */}
        {mainTab === 'desejos' && (
          <div className="space-y-3">
            {pendingWishlists.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhum pedido pendente</p> : pendingWishlists.map((w) => (
              <div key={w.id} className="pack-card">
                <p className="mb-2">{w.request_text}</p>
                <p className="text-xs text-muted-foreground mb-3">{format(new Date(w.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                {respondingWish === w.id ? (
                  <div className="space-y-2">
                    <Textarea placeholder="Resposta (opcional)" value={wishResponse} onChange={(e) => setWishResponse(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { respondToWish({ id: w.id, status: 'accepted', admin_response: wishResponse }); setRespondingWish(null); setWishResponse(''); }}>Aceitar</Button>
                      <Button size="sm" variant="destructive" onClick={() => { respondToWish({ id: w.id, status: 'rejected', admin_response: wishResponse }); setRespondingWish(null); setWishResponse(''); }}>Recusar</Button>
                      <Button size="sm" variant="outline" onClick={() => setRespondingWish(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setRespondingWish(w.id)}>Responder</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Albums Tab */}
        {mainTab === 'albuns' && (
          <div className="space-y-3">
            <Button onClick={() => setShowAlbumModal(true)} className="w-full mb-4">+ Novo Álbum</Button>
            {albums.map((a) => (
              <div key={a.id} className="pack-card flex items-center gap-4">
                <img src={a.cover_url || '/placeholder.svg'} alt="" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.style}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteAlbum(a.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        )}

        {/* Packs/Projects/Acapellas content */}
        {(mainTab === 'packs' || mainTab === 'projetos') && (
          <div className="space-y-4">
            {getPacksContent().map((pack) => (
              <div key={pack.id} className="pack-card flex gap-4">
                <img src={pack.cover_url || '/placeholder.svg'} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{pack.title}</h3>
                  <p className="text-xs text-muted-foreground">@{pack.author_name}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {subTab === 'pending' ? (
                    <>
                      <button onClick={() => approvePack(pack.id)} className="p-2 rounded-lg bg-green-500/20 text-green-500"><Check className="w-4 h-4" /></button>
                      <button onClick={() => rejectPack(pack.id)} className="p-2 rounded-lg bg-destructive/20 text-destructive"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingPack(pack)} className="p-2 rounded-lg bg-secondary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deletePack(pack.id)} className="p-2 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {mainTab === 'acapellas' && (
          <div className="space-y-4">
            {getCurrentAcapellas().map((a) => (
              <div key={a.id} className="pack-card flex items-center gap-4">
                <div className="flex-1"><h3 className="font-bold">{a.artist_name}</h3></div>
                <div className="flex gap-2">
                  {subTab === 'pending' ? (
                    <>
                      <button onClick={() => approveAcapella(a.id)} className="p-2 rounded-lg bg-green-500/20 text-green-500"><Check className="w-4 h-4" /></button>
                      <button onClick={() => rejectAcapella(a.id)} className="p-2 rounded-lg bg-destructive/20 text-destructive"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingAcapella(a)} className="p-2 rounded-lg bg-secondary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteAcapella(a.id)} className="p-2 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gift Modal */}
      <Dialog open={!!giftModal} onOpenChange={() => setGiftModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enviar Presente para @{giftModal?.username}</DialogTitle></DialogHeader>
          <Select value={selectedGiftPack} onValueChange={setSelectedGiftPack}>
            <SelectTrigger><SelectValue placeholder="Selecione um pack" /></SelectTrigger>
            <SelectContent>{allApprovedPacks.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleSendGift} disabled={!selectedGiftPack}>Enviar Presente</Button>
        </DialogContent>
      </Dialog>

      <EditPackModal isOpen={!!editingPack} pack={editingPack} onClose={() => setEditingPack(null)} onSave={async (id, updates) => { await updatePack({ id, ...updates }); }} />
      <EditAcapellaModal isOpen={!!editingAcapella} acapella={editingAcapella} onClose={() => setEditingAcapella(null)} onSave={async (id, updates) => { await updateAcapella({ id, ...updates }); }} />
      <AddAlbumModal isOpen={showAlbumModal} onClose={() => setShowAlbumModal(false)} />
    </div>
  );
}