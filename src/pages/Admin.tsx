import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePacks } from '@/hooks/usePacks';
import { AdminPackCard } from '@/components/AdminPackCard';

type TabType = 'pending' | 'approved' | 'rejected';

const ADMIN_PASSWORD = 'admin123'; // Senha simples para demo

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  const { pendingPacks, approvedPacks, rejectedPacks, approvePack, rejectPack, deletePack } = usePacks();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const tabs = [
    { id: 'pending' as const, label: 'Pendentes', count: pendingPacks.length, icon: Clock },
    { id: 'approved' as const, label: 'Aprovados', count: approvedPacks.length, icon: CheckCircle },
    { id: 'rejected' as const, label: 'Rejeitados', count: rejectedPacks.length, icon: XCircle },
  ];

  const currentPacks = activeTab === 'pending' 
    ? pendingPacks 
    : activeTab === 'approved' 
    ? approvedPacks 
    : rejectedPacks;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="pack-card">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                Área Admin
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label-field">Senha de Acesso</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="input-field"
                  required
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full">
                Entrar
              </button>

              <Link 
                to="/"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar à Galeria
              </Link>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          
          <h1 className="text-xl font-black uppercase tracking-tight">
            Painel Admin
          </h1>
          
          <div className="w-16" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-primary-foreground/20'
                  : 'bg-foreground/10'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {currentPacks.length === 0 ? (
            <div className="pack-card text-center py-8">
              <p className="text-muted-foreground">
                Nenhum pack {activeTab === 'pending' ? 'pendente' : activeTab === 'approved' ? 'aprovado' : 'rejeitado'}.
              </p>
            </div>
          ) : (
            currentPacks.map((pack) => (
              <AdminPackCard
                key={pack.id}
                pack={pack}
                onApprove={approvePack}
                onReject={rejectPack}
                onDelete={deletePack}
                showActions={activeTab === 'pending'}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
