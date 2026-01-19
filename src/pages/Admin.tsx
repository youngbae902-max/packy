import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Music, Package, Folder, Pin, Trash2, Edit, Check, X, Users, Gift, Ban, Shield, Disc, Send, Megaphone, Crown, Plus, ExternalLink, RotateCcw, Mic } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePacks, Pack } from '@/hooks/useSupabasePacks';
import { useAcapellas, Acapella } from '@/hooks/useAcapellas';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWishlist } from '@/hooks/useWishlist';
import { useAlbums } from '@/hooks/useAlbums';
import { useAlbumLinks } from '@/hooks/useAlbumLinks';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { EditPackModal } from '@/components/EditPackModal';
import { EditAcapellaModal } from '@/components/EditAcapellaModal';
import { AddAlbumModal } from '@/components/AddAlbumModal';
import { AddEventModal } from '@/components/AddEventModal';
import { AddAcapellaModal } from '@/components/AddAcapellaModal';
import { AddPackModalV2 } from '@/components/AddPackModalV2';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

type MainTab = 'packs' | 'projetos' | 'acapellas' | 'usuarios' | 'desejos' | 'albuns' | 'eventos' | 'lixeira';
type SubTab = 'pending' | 'approved' | 'rejected';

const MAIN_ADMIN_EMAIL = 'youngbae902@gmail.com';

export default function Admin() {
  const { isAdmin, isLoading, user } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>('packs');
  const [subTab, setSubTab] = useState<SubTab>('pending');
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [editingAcapella, setEditingAcapella] = useState<Acapella | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAcapellaModal, setShowAcapellaModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showPremiumPackModal, setShowPremiumPackModal] = useState(false);
  const [giftModal, setGiftModal] = useState<{ userId: string; username: string } | null>(null);
  const [selectedGiftPack, setSelectedGiftPack] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [wishResponse, setWishResponse] = useState('');
  const [respondingWish, setRespondingWish] = useState<string | null>(null);
  const [showGiftAllModal, setShowGiftAllModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  
  const { 
    pendingPacks, allApprovedPacks, rejectedPacks, 
    pendingProjectPacks, projectPacks, 
    approvePack, rejectPack, deletePack, updatePack, pinPack, addPack 
  } = useSupabasePacks();
  
  const { 
    acapellas, pendingAcapellas, rejectedAcapellas, 
    approveAcapella, rejectAcapella, deleteAcapella, updateAcapella, addAcapella 
  } = useAcapellas();
  
  const { 
    users, isUserAdmin, banUser, sendGift, toggleAdmin, 
    sendGiftToAll, toggleSpotifyBadge, deleteUser, isMainAdmin 
  } = useUserManagement();
  
  const { pendingWishlists, respondToWish } = useWishlist();
  const { albums, deleteAlbum, updateAlbum } = useAlbums();
  const { getAlbumLinks, addLink, deleteLink } = useAlbumLinks();
  const { events, addEvent, updateEvent, deleteEvent, toggleEventActive } = useSiteEvents();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  if (!isAdmin) return <Navigate to="/conta" replace />;

  // Filter packs for trash (rejected)
  const trashPacks = rejectedPacks;
  const trashAcapellas = rejectedAcapellas;

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
    { id: 'eventos' as const, label: 'Eventos', icon: Megaphone },
    { id: 'lixeira' as const, label: 'Lixeira', icon: Trash2 },
  ];

  const subTabs = [
    { id: 'pending' as const, label: 'Pendentes', icon: Clock },
    { id: 'approved' as const, label: 'Aprovados', icon: CheckCircle },
    { id: 'rejected' as const, label: 'Rejeitados', icon: XCircle },
  ];

  const handleSendGift = () => {
    if (!giftModal || !selectedGiftPack) return;
    sendGift({ userId: giftModal.userId, packId: selectedGiftPack, message: giftMessage || undefined });
    toast.success('Presente enviado!');
    setGiftModal(null);
    setSelectedGiftPack('');
    setGiftMessage('');
  };

  const handleSendGiftToAll = () => {
    if (!selectedGiftPack) return;
    sendGiftToAll({ packId: selectedGiftPack, message: giftMessage || undefined });
    toast.success('Presente enviado para todos!');
    setShowGiftAllModal(false);
    setSelectedGiftPack('');
    setGiftMessage('');
  };

  const handleRestorePack = async (pack: Pack) => {
    await updatePack({ id: pack.id, status: 'pending' });
    toast.success('Pack restaurado para análise');
  };

  const handleRestoreAcapella = async (acapella: Acapella) => {
    await updateAcapella({ id: acapella.id, status: 'pending' });
    toast.success('Acapella restaurada para análise');
  };

  const handleAddAlbumLink = async () => {
    if (!selectedAlbum || !newLinkName.trim() || !newLinkUrl.trim()) {
      toast.error('Preencha nome e link');
      return;
    }
    
    const links = getAlbumLinks(selectedAlbum);
    if (links.length >= 10) {
      toast.error('Máximo de 10 links por álbum');
      return;
    }

    addLink({
      album_id: selectedAlbum,
      name: newLinkName.trim(),
      link_url: newLinkUrl.trim(),
      description: newLinkDesc.trim() || undefined,
    });

    setNewLinkName('');
    setNewLinkUrl('');
    setNewLinkDesc('');
  };

  const handleAddAdminPack = async (pack: any) => {
    await addPack({
      ...pack,
      is_admin_pack: true,
      status: 'approved',
    });
    toast.success('Pack adicionado com sucesso!');
  };

  const handleAddPremiumPack = async (pack: any) => {
    await addPack({
      ...pack,
      is_admin_pack: true,
      is_premium: true,
      status: 'approved',
    });
    toast.success('Pack premium adicionado!');
  };

  const handleDeleteUser = (userId: string) => {
    if (isMainAdmin(userId)) {
      toast.error('Não é possível excluir o admin principal');
      return;
    }
    deleteUser(userId);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/conta" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />Voltar
          </Link>
          <h1 className="text-xl font-black uppercase">Painel ADM</h1>
          <div className="w-16" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <Button size="sm" variant="outline" onClick={() => setShowPackModal(true)} className="text-xs">
            <Plus className="w-3 h-3 mr-1" />Pack
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowPremiumPackModal(true)} className="text-xs">
            <Crown className="w-3 h-3 mr-1" />Premium
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAcapellaModal(true)} className="text-xs">
            <Mic className="w-3 h-3 mr-1" />Acapella
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowGiftAllModal(true)} className="text-xs">
            <Send className="w-3 h-3 mr-1" />Gift All
          </Button>
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
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* Sub Tabs for content moderation */}
        {(mainTab === 'packs' || mainTab === 'projetos' || mainTab === 'acapellas') && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {subTabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                  subTab === tab.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                }`}
              >
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold truncate">@{u.username || 'sem-username'}</span>
                    {isUserAdmin(u.user_id) && <Badge className="bg-primary/20 text-primary text-xs">Admin</Badge>}
                    {isMainAdmin(u.user_id) && <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">Principal</Badge>}
                    {u.is_banned && <Badge variant="destructive" className="text-xs">Banido</Badge>}
                    {u.has_spotify_badge && <Badge className="bg-green-500/20 text-green-500 text-xs">Spotify</Badge>}
                    {u.is_online && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.artist_name || 'Sem nome'}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setGiftModal({ userId: u.user_id, username: u.username || 'usuário' })}>
                    <Gift className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={u.has_spotify_badge ? 'default' : 'outline'} 
                    onClick={() => toggleSpotifyBadge({ userId: u.user_id, enabled: !u.has_spotify_badge })}
                    className={u.has_spotify_badge ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </Button>
                  {!isMainAdmin(u.user_id) && (
                    <>
                      <Button 
                        size="sm" 
                        variant={u.is_banned ? 'default' : 'destructive'} 
                        onClick={() => banUser({ userId: u.user_id, ban: !u.is_banned })}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toggleAdmin({ userId: u.user_id, makeAdmin: !isUserAdmin(u.user_id) })}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteUser(u.user_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Tab */}
        {mainTab === 'desejos' && (
          <div className="space-y-3">
            {pendingWishlists.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum pedido pendente</p>
            ) : (
              pendingWishlists.map((w) => (
                <div key={w.id} className="pack-card">
                  <p className="mb-2">{w.request_text}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {format(new Date(w.created_at || ''), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {respondingWish === w.id ? (
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Resposta (opcional)" 
                        value={wishResponse} 
                        onChange={(e) => setWishResponse(e.target.value)} 
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { 
                          respondToWish({ id: w.id, status: 'accepted', admin_response: wishResponse }); 
                          setRespondingWish(null); 
                          setWishResponse(''); 
                        }}>
                          Aceitar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { 
                          respondToWish({ id: w.id, status: 'rejected', admin_response: wishResponse }); 
                          setRespondingWish(null); 
                          setWishResponse(''); 
                        }}>
                          Recusar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRespondingWish(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setRespondingWish(w.id)}>Responder</Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Albums Tab */}
        {mainTab === 'albuns' && (
          <div className="space-y-4">
            <Button onClick={() => setShowAlbumModal(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />Novo Álbum
            </Button>
            
            {albums.map((a) => (
              <div key={a.id} className="pack-card">
                <div className="flex items-start gap-4 mb-4">
                  <img src={a.cover_url || '/placeholder.svg'} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{a.style}</p>
                    {a.description && <p className="text-xs mt-1">{a.description}</p>}
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteAlbum(a.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Album Links */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Links ({getAlbumLinks(a.id).length}/10)</p>
                  <div className="space-y-2 mb-3">
                    {getAlbumLinks(a.id).map((link) => (
                      <div key={link.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                        <span className="flex-1 text-sm truncate">{link.name}</span>
                        <a href={link.link_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Button size="sm" variant="ghost" onClick={() => deleteLink(link.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {getAlbumLinks(a.id).length < 10 && (
                    <div className="space-y-2">
                      {selectedAlbum === a.id ? (
                        <>
                          <Input 
                            placeholder="Nome do link" 
                            value={newLinkName} 
                            onChange={(e) => setNewLinkName(e.target.value)} 
                          />
                          <Input 
                            placeholder="URL do link" 
                            value={newLinkUrl} 
                            onChange={(e) => setNewLinkUrl(e.target.value)} 
                          />
                          <Input 
                            placeholder="Descrição (opcional)" 
                            value={newLinkDesc} 
                            onChange={(e) => setNewLinkDesc(e.target.value)} 
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddAlbumLink}>Adicionar</Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedAlbum(null)}>Cancelar</Button>
                          </div>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setSelectedAlbum(a.id)} className="w-full">
                          <Plus className="w-3 h-3 mr-1" />Adicionar Link
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {mainTab === 'eventos' && (
          <div className="space-y-4">
            <Button onClick={() => setShowEventModal(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />Novo Evento/Divulgação
            </Button>

            {events.map((event) => (
              <div key={event.id} className="pack-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={event.is_active ? 'default' : 'secondary'}>
                        {event.type}
                      </Badge>
                      {!event.is_active && <Badge variant="outline">Inativo</Badge>}
                    </div>
                    <h3 className="font-bold">{event.title}</h3>
                    {event.content && <p className="text-sm text-muted-foreground mt-1">{event.content}</p>}
                    {event.link_url && (
                      <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" />{event.link_url}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant={event.is_active ? 'default' : 'outline'} 
                      onClick={() => toggleEventActive(event.id)}
                    >
                      {event.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trash Tab */}
        {mainTab === 'lixeira' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Packs Rejeitados</h3>
            {trashPacks.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Nenhum pack na lixeira</p>
            ) : (
              trashPacks.map((pack) => (
                <div key={pack.id} className="pack-card flex gap-4">
                  <img src={pack.cover_url || '/placeholder.svg'} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{pack.title}</h4>
                    <p className="text-xs text-muted-foreground">@{pack.author_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRestorePack(pack)}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deletePack(pack.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            <h3 className="font-bold text-lg mt-6">Acapellas Rejeitadas</h3>
            {trashAcapellas.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Nenhuma acapella na lixeira</p>
            ) : (
              trashAcapellas.map((a) => (
                <div key={a.id} className="pack-card flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold">{a.artist_name}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRestoreAcapella(a)}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteAcapella(a.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Packs/Projects content */}
        {(mainTab === 'packs' || mainTab === 'projetos') && (
          <div className="space-y-4">
            {getPacksContent().map((pack) => (
              <div key={pack.id} className="pack-card flex gap-4">
                <img src={pack.cover_url || '/placeholder.svg'} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{pack.title}</h3>
                  <p className="text-xs text-muted-foreground">@{pack.author_name}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{pack.pack_type}</Badge>
                    {pack.is_premium && <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">Premium</Badge>}
                    {pack.is_pinned && <Badge className="text-xs"><Pin className="w-3 h-3" /></Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {subTab === 'pending' ? (
                    <>
                      <button onClick={() => approvePack(pack.id)} className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => rejectPack(pack.id)} className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingPack(pack)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => pinPack(pack.id, !pack.is_pinned)} className={`p-2 rounded-lg ${pack.is_pinned ? 'bg-primary/20 text-primary' : 'bg-secondary'}`}>
                        <Pin className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePack(pack.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {getPacksContent().length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Nenhum item encontrado</p>
            )}
          </div>
        )}

        {/* Acapellas content */}
        {mainTab === 'acapellas' && (
          <div className="space-y-4">
            {getCurrentAcapellas().map((a) => (
              <div key={a.id} className="pack-card flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold">{a.artist_name}</h3>
                </div>
                <div className="flex gap-2">
                  {subTab === 'pending' ? (
                    <>
                      <button onClick={() => approveAcapella(a.id)} className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => rejectAcapella(a.id)} className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingAcapella(a)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAcapella(a.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {getCurrentAcapellas().length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Nenhuma acapella encontrada</p>
            )}
          </div>
        )}
      </div>

      {/* Gift Modal */}
      <Dialog open={!!giftModal} onOpenChange={() => setGiftModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Presente para @{giftModal?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecione um pack</Label>
              <Select value={selectedGiftPack} onValueChange={setSelectedGiftPack}>
                <SelectTrigger><SelectValue placeholder="Selecione um pack" /></SelectTrigger>
                <SelectContent>
                  {allApprovedPacks.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mensagem (opcional)</Label>
              <Input 
                value={giftMessage} 
                onChange={(e) => setGiftMessage(e.target.value)} 
                placeholder="Uma mensagem especial..."
              />
            </div>
            <Button onClick={handleSendGift} disabled={!selectedGiftPack} className="w-full">
              <Gift className="w-4 h-4 mr-2" />Enviar Presente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift All Modal */}
      <Dialog open={showGiftAllModal} onOpenChange={setShowGiftAllModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Presente para Todos</DialogTitle>
            <DialogDescription>
              Este presente será enviado para todos os usuários cadastrados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecione um pack</Label>
              <Select value={selectedGiftPack} onValueChange={setSelectedGiftPack}>
                <SelectTrigger><SelectValue placeholder="Selecione um pack" /></SelectTrigger>
                <SelectContent>
                  {allApprovedPacks.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mensagem (opcional)</Label>
              <Input 
                value={giftMessage} 
                onChange={(e) => setGiftMessage(e.target.value)} 
                placeholder="Uma mensagem especial..."
              />
            </div>
            <Button onClick={handleSendGiftToAll} disabled={!selectedGiftPack} className="w-full">
              <Send className="w-4 h-4 mr-2" />Enviar para Todos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Pack Modal (Admin) */}
      <Dialog open={showPackModal} onOpenChange={setShowPackModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Pack (ADM)</DialogTitle>
          </DialogHeader>
          <AdminPackForm onSubmit={handleAddAdminPack} onClose={() => setShowPackModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Premium Pack Modal */}
      <Dialog open={showPremiumPackModal} onOpenChange={setShowPremiumPackModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Adicionar Pack Premium
            </DialogTitle>
          </DialogHeader>
          <AdminPackForm onSubmit={handleAddPremiumPack} onClose={() => setShowPremiumPackModal(false)} isPremium />
        </DialogContent>
      </Dialog>

      <EditPackModal isOpen={!!editingPack} pack={editingPack} onClose={() => setEditingPack(null)} onSave={async (id, updates) => { await updatePack({ id, ...updates }); }} />
      <EditAcapellaModal isOpen={!!editingAcapella} acapella={editingAcapella} onClose={() => setEditingAcapella(null)} onSave={async (id, updates) => { await updateAcapella({ id, ...updates }); }} />
      <AddAlbumModal isOpen={showAlbumModal} onClose={() => setShowAlbumModal(false)} />
      <AddEventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} />
      <AddAcapellaModal isOpen={showAcapellaModal} onClose={() => setShowAcapellaModal(false)} onAdd={addAcapella} />
    </div>
  );
}

// Admin Pack Form Component
function AdminPackForm({ 
  onSubmit, 
  onClose, 
  isPremium = false 
}: { 
  onSubmit: (pack: any) => Promise<void>; 
  onClose: () => void;
  isPremium?: boolean;
}) {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [packType, setPackType] = useState('samples');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !downloadUrl.trim()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        author_name: authorName.trim() || 'Admin',
        pack_type: packType,
        download_url: downloadUrl.trim(),
        cover_url: coverUrl.trim() || null,
        price: isPremium && price ? parseFloat(price) : null,
        is_exclusive: false,
        is_anonymous: false,
      });
      onClose();
    } catch (error) {
      toast.error('Erro ao adicionar pack');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Título *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do pack" required />
      </div>
      <div>
        <Label>Autor</Label>
        <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nome do autor" />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select value={packType} onValueChange={setPackType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="samples">Samples</SelectItem>
            <SelectItem value="drumkit">Drumkit</SelectItem>
            <SelectItem value="loops">Loops</SelectItem>
            <SelectItem value="presets">Presets</SelectItem>
            <SelectItem value="project">Projeto</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isPremium && (
        <div>
          <Label>Preço (R$)</Label>
          <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.99" />
        </div>
      )}
      <div>
        <Label>Link da Capa (opcional)</Label>
        <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="URL da imagem" />
      </div>
      <div>
        <Label>Link de Download *</Label>
        <Input value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="URL do arquivo" required />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}
