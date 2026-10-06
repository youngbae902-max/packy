import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [forgotByKeyword, setForgotByKeyword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Digite seu email primeiro');
      return;
    }
    const { error } = await resetPassword(email.trim());
    if (error) toast.error(error.message);
    else toast.success('Link de redefinição enviado para o email');
  };

  const handleKeywordReset = async () => {
    if (!email.trim() || !keyword.trim() || password.length < 6) {
      toast.error('Preencha email, palavra-chave e uma nova senha');
      return;
    }
    const { data, error } = await supabase.rpc('reset_password_with_keyword' as any, {
      account_email: email.trim(),
      keyword: keyword.trim(),
      new_password: password,
    });
    if (error || !data) toast.error('Palavra-chave incorreta');
    else {
      toast.success('Senha alterada! Agora entre com a nova senha');
      setForgotByKeyword(false);
      setKeyword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loginEmail = email.trim();

      if (mode === 'login' && !loginEmail.includes('@')) {
        const cleaned = loginEmail.replace(/^@/, '');
        const { data } = await supabase.rpc('email_for_username' as any, { uname: cleaned });
        if (data) loginEmail = data as string;
      }

      if (mode === 'signup') {
        const { error } = await signUp(loginEmail, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Conta criada! Verifique seu email para confirmar.');
          onClose();
        }
      } else {
        const { error } = await signIn(loginEmail, password);
        if (error) {
          toast.error('Login incorreto');
        } else {
          toast.success('Bem-vindo!');
          onClose();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <main className="fixed inset-0 z-[9999] min-h-[100dvh] w-screen overflow-y-auto bg-[#111111] text-foreground flex items-center justify-center px-5 py-8">
      <div className="relative z-[10000] w-full max-w-[420px]">
        <div className="mb-7">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-[11px] bg-[#1b1b1b] border border-white/[0.08] flex items-center justify-center">
              <span className="text-[15px] font-bold tracking-[-0.05em]">P</span>
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">PACKY</span>
          </div>
          <h1 className="text-[30px] font-semibold tracking-[-0.045em]">
            {mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
          </h1>
          <p className="text-[13px] text-white/40 mt-2">
            {mode === 'login' ? 'Entre para continuar na PACKY.' : 'Cadastre-se para usar os recursos da PACKY.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-white/45 ml-1">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full h-12 rounded-[14px] bg-[#151515] border border-white/[0.07] pl-10 pr-4 text-[13px] text-foreground placeholder:text-white/20 outline-none transition focus:border-white/[0.16] focus:bg-[#171717]" required />
            </div>
          </div>

          {forgotByKeyword && mode === 'login' && (
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/45 ml-1">PALAVRA-CHAVE</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Sua palavra-chave" className="w-full h-12 rounded-[14px] bg-[#151515] border border-white/[0.07] pl-10 pr-4 text-[13px] outline-none focus:border-white/[0.16]" />
              </div>
              <p className="text-[11px] text-white/30 ml-1">Digite a nova senha no campo abaixo.</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-white/45 ml-1">SENHA</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 rounded-[14px] bg-[#151515] border border-white/[0.07] pl-10 pr-12 text-[13px] outline-none focus:border-white/[0.16]" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/65" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between px-1 pt-0.5">
              <button type="button" onClick={handleForgotPassword} className="text-[11px] text-white/40 hover:text-white/70 transition">Esqueci a senha</button>
              <button type="button" onClick={() => setForgotByKeyword(v => !v)} className="text-[11px] text-white/40 hover:text-white/70 transition">{forgotByKeyword ? 'Fechar recuperação' : 'Usar palavra-chave'}</button>
            </div>
          )}

          {forgotByKeyword && mode === 'login' && (
            <button type="button" onClick={handleKeywordReset} className="w-full h-12 rounded-[14px] bg-[#1a1a1a] border border-white/[0.08] text-[13px] font-semibold hover:bg-[#202020] transition">Trocar senha</button>
          )}

          <button type="submit" disabled={isLoading} className="w-full h-12 rounded-[14px] bg-white text-black text-[13px] font-semibold hover:bg-white/90 active:scale-[0.99] transition disabled:opacity-50">
            {isLoading ? (mode === 'login' ? 'Entrando...' : 'Criando...') : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <div className="flex items-center gap-3 py-1.5">
            <div className="h-px flex-1 bg-white/[0.07]" />
            <span className="text-[10px] font-medium text-white/25">OU</span>
            <div className="h-px flex-1 bg-white/[0.07]" />
          </div>

          <button type="button" onClick={async () => {
            try {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
              });
              if (error) toast.error('Erro ao entrar com Google');
            } catch {
              toast.error('Erro ao entrar com Google');
            }
          }} className="w-full h-12 rounded-[14px] bg-[#151515] border border-white/[0.07] text-[13px] font-medium hover:bg-[#191919] transition flex items-center justify-center gap-2.5">
            <span className="font-bold text-[15px]">G</span>
            {mode === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setForgotByKeyword(false);
              setKeyword('');
              setPassword('');
            }}
            className="w-full text-[12px] text-white/40 hover:text-white/70 transition pt-1"
          >
            {mode === 'login' ? 'Ainda não tem conta? Criar conta' : 'Já tem uma conta? Entrar'}
          </button>

          <p className="text-center text-[12px] text-white/35 pt-1">
            {mode === 'login' ? 'Entre com sua conta para acessar recursos da comunidade.' : 'O cadastro é opcional.'}
          </p>
        </form>
      </div>
    </main>
  );
}
