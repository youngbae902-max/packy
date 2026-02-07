import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Music, Package, Folder, Pin, Trash2, Edit, Check, X, Users, Gift, Disc, Send, Megaphone, Crown, Plus, ExternalLink, RotateCcw, Mic, BarChart3, Link as LinkIcon, Camera, Edit2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabasePacks, Pack } from '@/hooks/useSupabasePacks';
import { useAcapellas, Acapella } from '@/hooks/useAcapellas';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWishlist } from '@/hooks/useWishlist';
import { useAlbums, Album } from '@/hooks/useAlbums';
import { useAlbumLinks, AlbumLink } from '@/hooks/useAlbumLinks';
import { useSiteEvents } from '@/hooks/useSiteEvents';
import { useStats } from '@/hooks/useStats';
import { EditPackModal } from '@/components/EditPackModal';
import { EditAcapellaModal } from '@/components/EditAcapellaModal';
import { EditAlbumModal } from '@/components/EditAlbumModal';
import { AddAlbumModal } from '@/components/AddAlbumModal';
import { AddEventModal } from '@/components/AddEventModal';
import { AddAcapellaModal } from '@/components/AddAcapellaModal';
import { UserEditModal } from '@/components/UserEditModal';
import { AlbumLinkEditModal } from '@/components/AlbumLinkEditModal';
import { BulkLinkInput } from '@/components/BulkLinkInput';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

type MainTab = 'stats' | 'packs' | 'projetos' | 'acapellas' | 'usuarios' | 'desejos' | 'albuns' | 'eventos' | 'giftall' | 'lixeira';
type SubTab = 'pending' | 'approved' | 'rejected';

const MAIN_ADMIN_USERNAME = 'mathhewdcarmo';

export default function Admin() {
  const { isAdmin, isLoading, user } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>('stats');
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
  const [externalGiftUrl, setExternalGiftUrl] = useState('');
  const [externalGiftName, setExternalGiftName] = useState('');
  const [externalGiftCover, setExternalGiftCover] = useState('');
  const [wishResponse, setWishResponse] = useState('');
  const [respondingWish, setRespondingWish] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [showLinksEditor, setShowLinksEditor] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingLink, setEditingLink] = useState<AlbumLink | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumSubTab, setAlbumSubTab] = useState<SubTab>('pending');
  const [giftType, setGiftType] = useState<'pack' | 'external'>('pack');
  const [externalGiftUrlForUser, setExternalGiftUrlForUser] = useState('');
  const [externalGiftNameForUser, setExternalGiftNameForUser] = useState('');
  
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
  const { albums, pendingAlbums, approvedAlbums, rejectedAlbums, approveAlbum, rejectAlbum, deleteAlbum, updateAlbum } = useAlbums();
  const { getAlbumLinks, addLink, deleteLink, updateLink } = useAlbumLinks();
  const { events, deleteEvent, toggleEventActive } = useSiteEvents();
  const { stats } = useStats();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  if (!isAdmin) return <Navigate to="/conta" replace />;

  const trashPacks = rejectedPacks;
  const trashAcapellas = rejectedAcapellas;

  const getPacksContent = () => {
    const regularPacks = mainTab === 'packs' 
      ? (subTab === 'pending' ? pendingPacks.filter(p => p.pack_type !== 'project') : subTab === 'approved' ? allApprovedPacks.filter(p => p.pack_type !== 'project') : rejectedPacks.filter(p => p.pack_type !== 'project'))
      : (subTab === 'pending' ? pendingProjectPacks : subTab === 'approved' ? projectPacks : rejectedPacks.filter(p => p.pack_type === 'project'));
    return regularPacks;
  };

  const getCurrentAcapellas = () => subTab === 'pending' ? pendingAcapellas : subTab === 'approved' ? acapellas : rejectedAcapellas;
  
  const getCurrentAlbums = () => {
    if (albumSubTab === 'pending') return pendingAlbums;
    if (albumSubTab === 'approved') return approvedAlbums;
    return rejectedAlbums;
  };

  const mainTabs = [
    { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
    { id: 'packs' as const, label: 'Packs', icon: Package },
    { id: 'projetos' as const, label: 'Projetos', icon: Folder },
    { id: 'acapellas' as const, label: 'Acapellas', icon: Music },
    { id: 'usuarios' as const, label: 'Usuários', icon: Users },
    { id: 'desejos' as const, label: 'Pedidos', icon: Gift },
    { id: 'albuns' as const, label: 'Álbuns', icon: Disc },
    { id: 'eventos' as const, label: 'Eventos', icon: Megaphone },
    { id: 'giftall' as const, label: 'Gift All', icon: Send },
    { id: 'lixeira' as const, label: 'Lixeira', icon: Trash2 },
  ];

  const subTabs = [
    { id: 'pending' as const, label: 'Pendentes', icon: Clock },
    { id: 'approved' as const, label: 'Aprovados', icon: CheckCircle },
    { id: 'rejected' as const, label: 'Rejeitados', icon: XCircle },
  ];

  const handleSendGift = async () => {
    if (!giftModal) return;
    
    if (giftType === 'external') {
      if (!externalGiftNameForUser.trim() || !externalGiftUrlForUser.trim()) {
        toast.error('Preencha nome e link');
        return;
      }
      
      // Create a pack for the external gift
      const { data: newPack, error } = await supabase
        .from('packs')
        .insert({
          title: externalGiftNameForUser.trim(),
          download_url: externalGiftUrlForUser.trim(),
          author_name: 'ADM',
          is_admin_pack: true,
          status: 'approved',
        })
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar pack');
        return;
      }

      sendGift({ userId: giftModal.userId, packId: newPack.id, message: giftMessage || undefined });
    } else {
      if (!selectedGiftPack) {
        toast.error('Selecione um pack');
        return;
      }
      sendGift({ userId: giftModal.userId, packId: selectedGiftPack, message: giftMessage || undefined });
    }
    
    toast.success('Presente enviado!');
    setGiftModal(null);
    setSelectedGiftPack('');
    setGiftMessage('');
    setExternalGiftNameForUser('');
    setExternalGiftUrlForUser('');
    setGiftType('pack');
  };

  const handleSendExternalGiftToAll = async () => {
    if (!externalGiftUrl.trim() || !externalGiftName.trim()) {
      toast.error('Preencha nome e link');
      return;
    }
    
    // Create a pack for the external gift
    const { data: newPack, error } = await supabase
      .from('packs')
      .insert({
        title: externalGiftName.trim(),
        download_url: externalGiftUrl.trim(),
        cover_url: externalGiftCover.trim() || null,
        author_name: 'ADM',
        is_admin_pack: true,
        status: 'approved',
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar pack');
      return;
    }

    // Send to all users
    sendGiftToAll({ packId: newPack.id, message: giftMessage || 'Presente do admin!' });
    toast.success('Gift enviado para todos!');
    
    setExternalGiftUrl('');
    setExternalGiftName('');
    setExternalGiftCover('');
    setGiftMessage('');
  };

  const handleSendPackGiftToAll = () => {
    if (!selectedGiftPack) {
      toast.error('Selecione um pack');
      return;
    }
    sendGiftToAll({ packId: selectedGiftPack, message: giftMessage || undefined });
    toast.success('Gift enviado para todos!');
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

  const handleBulkLinksAdd = async (links: string[], albumId: string) => {
    const currentLinks = getAlbumLinks(albumId);
    const available = 10 - currentLinks.length;
    const linksToAdd = links.slice(0, available);
    
    for (let i = 0; i < linksToAdd.length; i++) {
      const url = linksToAdd[i];
      // Extract a simple name from URL
      const urlObj = new URL(url);
      const name = urlObj.hostname.replace('www.', '') + (urlObj.pathname.length > 1 ? urlObj.pathname.substring(0, 20) : '');
      
      addLink({
        album_id: albumId,
        name: `Link ${currentLinks.length + i + 1}`,
        link_url: url,
      });
    }
    
    setShowBulkInput(false);
    toast.success(`${linksToAdd.length} links adicionados!`);
  };

  const handleAddAdminPack = async (pack: any) => {
    await addPack({
      ...pack,
      is_admin_pack: true,
      status: 'approved',
    });
    toast.success('Pack adicionado!');
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
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/conta" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />Voltar
          </Link>
          <h1 className="text-xl font-black uppercase">Painel ADM</h1>
          <div className="w-16" />
        </div>

        {/* Main Tabs - Scrollable */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
          {mainTabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => { setMainTab(tab.id); setSubTab('pending'); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                mainTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {mainTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalDownloads}</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground">Curtidas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalPacks}</p>
                <p className="text-xs text-muted-foreground">Packs</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalAcapellas}</p>
                <p className="text-xs text-muted-foreground">Acapellas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">{stats.pendingPacks + stats.pendingAcapellas}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </Card>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-bold mb-3">Ações Rápidas</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowPackModal(true)}>
                  <Plus className="w-3 h-3 mr-1" />Pack
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowPremiumPackModal(true)}>
                  <Crown className="w-3 h-3 mr-1" />Premium
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAcapellaModal(true)}>
                  <Mic className="w-3 h-3 mr-1" />Acapella
                </Button>
                <Button size="sm" variant="outline" onClick={() => setMainTab('giftall')}>
                  <Send className="w-3 h-3 mr-1" />Gift All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gift All Tab */}
        {mainTab === 'giftall' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Enviar Link Externo para Todos
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Nome do Pack</Label>
                  <Input 
                    value={externalGiftName} 
                    onChange={e => setExternalGiftName(e.target.value)} 
                    placeholder="Ex: Pack Especial Vol.1"
                  />
                </div>
                <div>
                  <Label>Link de Download</Label>
                  <Input 
                    value={externalGiftUrl} 
                    onChange={e => setExternalGiftUrl(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>URL da Capa (opcional)</Label>
                  <Input 
                    value={externalGiftCover} 
                    onChange={e => setExternalGiftCover(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Mensagem (opcional)</Label>
                  <Input 
                    value={giftMessage} 
                    onChange={e => setGiftMessage(e.target.value)} 
                    placeholder="Uma mensagem especial..."
                  />
                </div>
                <Button onClick={handleSendExternalGiftToAll} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Todos
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Enviar Pack Existente para Todos
              </h3>
              <div className="space-y-3">
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
                <Button onClick={handleSendPackGiftToAll} className="w-full" disabled={!selectedGiftPack}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pack para Todos
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Sub Tabs for content moderation */}
        {(mainTab === 'packs' || mainTab === 'projetos' || mainTab === 'acapellas') && (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                if (mainTab === 'acapellas') setShowAcapellaModal(true);
                else setShowPackModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar {mainTab === 'acapellas' ? 'Acapella' : 'Pack'}
            </Button>

            <div className="flex gap-2 overflow-x-auto pb-2">
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
          </div>
        )}

        {/* Users Tab */}
        {mainTab === 'usuarios' && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="pack-card flex items-center gap-3">
                <img src={u.avatar_url || '/placeholder.svg'} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm truncate">@{u.username || 'sem-username'}</span>
                    {u.is_online && <span className="w-2 h-2 bg-success rounded-full flex-shrink-0" />}
                  </div>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {isUserAdmin(u.user_id) && <Badge className="text-[10px] px-1 py-0 bg-primary/20 text-primary">ADM</Badge>}
                    {isMainAdmin(u.user_id) && <Badge className="text-[10px] px-1 py-0 bg-warning/20 text-warning">Principal</Badge>}
                    {u.is_banned && <Badge variant="destructive" className="text-[10px] px-1 py-0">Banido</Badge>}
                    {u.has_spotify_badge && <Badge className="text-[10px] px-1 py-0 bg-success/20 text-success">Spotify</Badge>}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingUser(u)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
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

        {/* Albums Tab with Approval */}
        {mainTab === 'albuns' && (
          <div className="space-y-4">
            <Button onClick={() => setShowAlbumModal(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />Novo Álbum
            </Button>

            {/* Album Sub Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {subTabs.map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setAlbumSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                    albumSubTab === tab.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />{tab.label}
                </button>
              ))}
            </div>
            
            {getCurrentAlbums().map((a) => (
              <div key={a.id} className="pack-card">
                <div className="flex items-start gap-4 mb-4">
                  <img src={a.cover_url || '/placeholder.svg'} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{a.style}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{a.status}</Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    {albumSubTab === 'pending' && (
                      <>
                        <button onClick={() => approveAlbum(a.id)} className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => rejectAlbum(a.id)} className="p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditingAlbum(a)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteAlbum(a.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Album Links - Hidden by default with pencil icon */}
                {albumSubTab === 'approved' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Links ({getAlbumLinks(a.id).length}/10)</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowLinksEditor(showLinksEditor === a.id ? null : a.id)}
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        {showLinksEditor === a.id ? 'Fechar' : 'Editar Links'}
                      </Button>
                    </div>
                    
                    {showLinksEditor === a.id && (
                      <div className="space-y-3 animate-fade-in">
                        {/* Existing Links */}
                        <div className="space-y-2">
                          {getAlbumLinks(a.id).map((link) => (
                            <div key={link.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{link.name}</p>
                                {link.description && <p className="text-xs text-muted-foreground truncate">{link.description}</p>}
                              </div>
                              <a href={link.link_url} target="_blank" rel="noopener noreferrer" className="text-primary flex-shrink-0">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <Button size="sm" variant="ghost" onClick={() => setEditingLink(link)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteLink(link.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {getAlbumLinks(a.id).length < 10 && (
                          <div className="space-y-3 pt-2 border-t border-border">
                            {/* Toggle between single and bulk add */}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant={!showBulkInput ? 'default' : 'outline'}
                                onClick={() => { setShowBulkInput(false); setSelectedAlbum(a.id); }}
                                className="flex-1"
                              >
                                + Um link
                              </Button>
                              <Button 
                                size="sm" 
                                variant={showBulkInput ? 'default' : 'outline'}
                                onClick={() => { setShowBulkInput(true); setSelectedAlbum(a.id); }}
                                className="flex-1"
                              >
                                + Vários links
                              </Button>
                            </div>

                            {showBulkInput && selectedAlbum === a.id ? (
                              <BulkLinkInput 
                                onLinksConfirmed={(links) => handleBulkLinksAdd(links, a.id)}
                                maxLinks={10 - getAlbumLinks(a.id).length}
                              />
                            ) : selectedAlbum === a.id ? (
                              <div className="space-y-2">
                                <Input 
                                  placeholder="Nome do link (ex: Pack ZN Vol.1)" 
                                  value={newLinkName} 
                                  onChange={(e) => setNewLinkName(e.target.value)} 
                                />
                                <Input 
                                  placeholder="URL externa (https://...)" 
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
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {getCurrentAlbums().length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Nenhum álbum encontrado</p>
            )}
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  <div className="flex flex-col gap-1">
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
            {events.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">Nenhum evento criado</p>
            )}
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
          <div className="space-y-3 mt-4">
            {getPacksContent().map((pack) => (
              <div key={pack.id} className="pack-card flex gap-3">
                <img src={pack.cover_url || '/placeholder.svg'} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{pack.title}</h3>
                  <p className="text-xs text-muted-foreground">@{pack.author_name}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{pack.pack_type}</Badge>
                    {pack.is_premium && <Badge className="bg-warning/20 text-warning text-[10px]">Premium</Badge>}
                    {pack.is_pinned && <Badge className="text-[10px]"><Pin className="w-2 h-2" /></Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {subTab === 'pending' ? (
                    <>
                      <button onClick={() => approvePack(pack.id)} className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => rejectPack(pack.id)} className="p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingPack(pack)} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePack(pack.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/20">
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
          <div className="space-y-3 mt-4">
            {getCurrentAcapellas().map((a) => (
              <div key={a.id} className="pack-card flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-bold">{a.artist_name}</h3>
                </div>
                <div className="flex gap-1">
                  {subTab === 'pending' ? (
                    <>
                      <button onClick={() => approveAcapella(a.id)} className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => rejectAcapella(a.id)} className="p-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingAcapella(a)} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAcapella(a.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/20">
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

      {/* User Edit Modal */}
      <UserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        isUserAdmin={isUserAdmin}
        isMainAdmin={isMainAdmin}
        onBan={(userId, ban) => banUser({ userId, ban })}
        onToggleAdmin={(userId, makeAdmin) => toggleAdmin({ userId, makeAdmin })}
        onToggleSpotify={(userId, enabled) => toggleSpotifyBadge({ userId, enabled })}
        onDelete={handleDeleteUser}
        onSendGift={(userId, username) => setGiftModal({ userId, username })}
      />

      {/* Album Link Edit Modal */}
      <AlbumLinkEditModal
        link={editingLink}
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        onSave={(id, updates) => updateLink({ id, ...updates })}
      />

      {/* Gift Modal */}
      <Dialog open={!!giftModal} onOpenChange={() => {
        setGiftModal(null);
        setGiftType('pack');
        setExternalGiftNameForUser('');
        setExternalGiftUrlForUser('');
        setSelectedGiftPack('');
        setGiftMessage('');
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Presente para @{giftModal?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Toggle between pack and external link */}
            <div className="flex gap-2">
              <Button 
                variant={giftType === 'pack' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setGiftType('pack')}
                className="flex-1"
              >
                <Package className="w-4 h-4 mr-1" />
                Pack do Site
              </Button>
              <Button 
                variant={giftType === 'external' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setGiftType('external')}
                className="flex-1"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                Link Externo
              </Button>
            </div>

            {giftType === 'pack' ? (
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
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Nome do Pack</Label>
                  <Input 
                    value={externalGiftNameForUser} 
                    onChange={(e) => setExternalGiftNameForUser(e.target.value)} 
                    placeholder="Ex: Pack Especial Vol.1"
                  />
                </div>
                <div>
                  <Label>Link de Download</Label>
                  <Input 
                    value={externalGiftUrlForUser} 
                    onChange={(e) => setExternalGiftUrlForUser(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Mensagem (opcional)</Label>
              <Input 
                value={giftMessage} 
                onChange={(e) => setGiftMessage(e.target.value)} 
                placeholder="Uma mensagem especial..."
              />
            </div>
            <Button 
              onClick={handleSendGift} 
              disabled={giftType === 'pack' ? !selectedGiftPack : (!externalGiftNameForUser.trim() || !externalGiftUrlForUser.trim())} 
              className="w-full"
            >
              <Gift className="w-4 h-4 mr-2" />Enviar Presente
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
              <Crown className="w-5 h-5 text-warning" />
              Adicionar Pack Premium
            </DialogTitle>
          </DialogHeader>
          <AdminPackForm onSubmit={handleAddPremiumPack} onClose={() => setShowPremiumPackModal(false)} isPremium />
        </DialogContent>
      </Dialog>

      <EditPackModal isOpen={!!editingPack} pack={editingPack} onClose={() => setEditingPack(null)} onSave={async (id, updates) => { await updatePack({ id, ...updates }); }} />
      <EditAcapellaModal isOpen={!!editingAcapella} acapella={editingAcapella} onClose={() => setEditingAcapella(null)} onSave={async (id, updates) => { await updateAcapella({ id, ...updates }); }} />
      <EditAlbumModal album={editingAlbum} isOpen={!!editingAlbum} onClose={() => setEditingAlbum(null)} onSave={(id, updates) => updateAlbum({ id, ...updates })} />
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
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    
    // Upload to storage
    const fileName = `admin/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('covers').upload(fileName, file);
    if (error) {
      toast.error('Erro ao fazer upload da capa');
      return;
    }
    const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
    setCoverUrl(data.publicUrl);
    toast.success('Capa enviada!');
  };

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
        author_name: authorName.trim() || 'ADM',
        pack_type: packType,
        download_url: downloadUrl.trim(),
        cover_url: coverUrl || null,
        price: isPremium && price ? Number(price) : null,
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
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do pack" />
      </div>
      <div>
        <Label>Autor</Label>
        <Input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="ADM" />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select value={packType} onValueChange={setPackType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="samples">Samples</SelectItem>
            <SelectItem value="drumkit">Drumkit</SelectItem>
            <SelectItem value="loops">Loops</SelectItem>
            <SelectItem value="midi">MIDI</SelectItem>
            <SelectItem value="preset">Preset</SelectItem>
            <SelectItem value="project">Projeto</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Capa</Label>
        <Input type="file" accept="image/*" onChange={handleCoverUpload} />
        {coverUrl && (
          <img src={coverUrl} alt="Preview" className="mt-2 w-24 h-24 rounded-lg object-cover" />
        )}
      </div>
      <div>
        <Label>Link de Download *</Label>
        <Input value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)} placeholder="https://..." />
      </div>
      {isPremium && (
        <div>
          <Label>Preço (R$)</Label>
          <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="19.90" />
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Adicionando...' : 'Adicionar'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
