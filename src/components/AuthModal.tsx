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
      } else if (mode === 'login' && loginEmail.startsWith('@')) {
        const { data } = await supabase.rpc('email_for_username' as any, { uname: loginEmail.slice(1) });
        if (data) loginEmail = data as string;
      }

      if (mode === 'signup') {
        const { error } = await signUp(loginEmail, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Conta criada!');
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

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) toast.error(`Erro ao entrar com ${provider === 'apple' ? 'Apple' : 'Google'}`);
    } catch {
      toast.error(`Erro ao entrar com ${provider === 'apple' ? 'Apple' : 'Google'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <main className="fixed inset-0 z-[9999] min-h-[100dvh] w-screen overflow-y-auto bg-black text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[694px] px-0 sm:px-2">
        <div className="text-center mb-14">
          <div className="flex justify-center mb-12">
            <span className="text-[48px] leading-none font-serif font-black tracking-[-0.12em] text-white/30">𐌆</span>
          </div>

          <h1 className="text-[34px] sm:text-[38px] leading-none font-bold tracking-[-0.04em]">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-5 text-[19px] sm:text-[21px] leading-none text-white/45 tracking-[-0.02em]">
            {mode === 'login' ? 'Entre na sua conta PACKY' : 'Crie sua conta PACKY'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'Seu email ou usuário' : 'Seu email'}
              className="w-full h-[92px] rounded-[23px] bg-transparent border border-white/[0.20] pl-[84px] pr-7 text-[22px] text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.38]"
              required
            />
          </div>

          {forgotByKeyword && mode === 'login' && (
            <div className="relative">
              <KeyRound className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Sua palavra-chave"
                className="w-full h-[92px] rounded-[23px] bg-transparent border border-white/[0.20] pl-[84px] pr-7 text-[22px] text-white placeholder:text-white/35 outline-none focus:border-white/[0.38]"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full h-[92px] rounded-[23px] bg-transparent border border-white/[0.20] pl-[84px] pr-16 text-[22px] text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.38]"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="flex justify-center gap-5 pt-0">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[20px] text-white/45 hover:text-white/75 transition"
              >
                Esqueceu a senha?
              </button>
              <span className="text-white/15 text-[20px]">·</span>
              <button
                type="button"
                onClick={() => setForgotByKeyword(v => !v)}
                className="text-[20px] text-white/45 hover:text-white/75 transition"
              >
                {forgotByKeyword ? 'Fechar' : 'Palavra-chave'}
              </button>
            </div>
          )}

          {forgotByKeyword && mode === 'login' && (
            <button
              type="button"
              onClick={handleKeywordReset}
              className="w-full h-[76px] rounded-[22px] bg-[#171717] border border-white/[0.12] text-[21px] font-semibold hover:bg-[#202020] transition"
            >
              Trocar senha
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[92px] rounded-[46px] bg-white text-black text-[25px] font-bold hover:bg-white/90 active:scale-[0.995] transition disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <div className="flex items-center gap-5 py-3">
            <div className="h-px flex-1 bg-white/[0.15]" />
            <span className="text-[20px] text-white/35">OU</span>
            <div className="h-px flex-1 bg-white/[0.15]" />
          </div>

          <button
            type="button"
            onClick={() => handleOAuth('apple')}
            className="w-full h-[92px] rounded-[46px] bg-[#1b1b1d] border border-white/[0.14] text-[24px] font-semibold hover:bg-[#222224] transition flex items-center justify-center gap-5"
          >
            <span className="text-[31px] leading-none"></span>
            Entrar com a Apple
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full h-[92px] rounded-[46px] bg-[#1b1b1d] border border-white/[0.14] text-[24px] font-semibold hover:bg-[#222224] transition flex items-center justify-center gap-5"
          >
            <span className="text-[25px] font-bold text-[#4285F4]">G</span>
            Entrar com o Google
          </button>

          <p className="text-center text-[21px] text-white/45 pt-7 pb-2">
            {mode === 'login' ? (
              <>Não tem conta? <button type="button" onClick={() => setMode('signup')} className="text-white font-semibold hover:text-white/80 transition">Criar conta</button></>
            ) : (
              <>Já tem conta? <button type="button" onClick={() => setMode('login')} className="text-white font-semibold hover:text-white/80 transition">Entrar</button></>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
