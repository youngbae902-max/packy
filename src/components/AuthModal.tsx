import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

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
      // Permite login com @username
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

  if (!isOpen) return null;

  return (
    <main className="min-h-[100dvh] w-full bg-[#111111] text-foreground flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.04em]">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
          <p className="text-[13px] text-muted-foreground mt-2">{mode === 'login' ? 'Entre na sua conta PACKY' : 'Crie sua conta e faça parte da PACKY'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="label-field flex items-center gap-1"><Mail className="w-3 h-3" />{mode === 'login' ? 'Email ou @usuário' : 'Email'}</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={mode === 'login' ? 'seu@email.com ou @user' : 'seu@email.com'} className="input-field bg-[#151515] border-white/[0.08] rounded-xl h-11 px-3.5 focus:border-white/[0.18] focus:ring-0" required />
          </div>
          {forgotByKeyword && mode === 'login' && <div><label className="label-field flex items-center gap-1"><KeyRound className="w-3 h-3" /> Palavra-chave</label><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Sua palavra-chave" className="input-field bg-[#151515] border-white/[0.08] rounded-xl h-11 px-3.5" /><p className="text-[11px] text-muted-foreground mt-1">Digite a nova senha no campo de senha acima.</p></div>}
          <div>
            <label className="label-field flex items-center gap-1"><Lock className="w-3 h-3" /> Senha</label>
            <div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pr-12 bg-[#151515] border-white/[0.08] rounded-xl h-11 px-3.5 focus:border-white/[0.18] focus:ring-0" required minLength={6} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
          </div>
          {mode === 'login' && <div className="flex items-center justify-between pt-1"><button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Esqueci a senha</button><button type="button" onClick={() => setForgotByKeyword(!forgotByKeyword)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Palavra-chave</button></div>}
          {forgotByKeyword && mode === 'login' && <button type="button" onClick={handleKeywordReset} className="btn-secondary w-full h-11 rounded-xl font-semibold">Trocar senha com palavra-chave</button>}
          <button type="submit" className="btn-primary w-full h-11 rounded-xl font-semibold" disabled={isLoading}>{isLoading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
          <div className="flex items-center gap-3 py-1"><div className="flex-1 h-px bg-border" /><span className="text-[11px] text-muted-foreground">OU</span><div className="flex-1 h-px bg-border" /></div>
          <button type="button" onClick={async () => { try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin }); if (result.error) toast.error('Erro ao entrar com Google'); } catch { toast.error('Erro ao entrar com Google'); } }} className="w-full flex items-center justify-center gap-2 bg-white/[0.06] text-foreground border border-white/[0.08] font-semibold h-11 rounded-xl hover:bg-white/[0.1]">Entrar com Google</button>
          <p className="text-center text-[13px] text-muted-foreground pt-2">{mode === 'login' ? <>Não tem conta? <button type="button" onClick={() => setMode('signup')} className="text-primary hover:underline font-semibold">Criar agora</button></> : <>Já tem conta? <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline font-semibold">Entrar</button></>}</p>
        </form>
      </div>
    </main>
  );

}
