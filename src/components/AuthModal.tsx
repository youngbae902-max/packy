import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, KeyRound } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-card border border-border rounded-[2rem] p-8 shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {mode === 'login' ? 'Email ou @usuário' : 'Email'}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'seu@email.com ou @user' : 'seu@email.com'}
              className="input-field"
              required
            />
          </div>

          {forgotByKeyword && mode === 'login' && (
            <div>
              <label className="label-field flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Palavra-chave
              </label>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Sua palavra-chave" className="input-field" />
              <p className="text-[11px] text-muted-foreground mt-1">Digite a nova senha no campo de senha acima.</p>
            </div>
          )}

          <div>
            <label className="label-field flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">Esqueci a senha</button>
              <button type="button" onClick={() => setForgotByKeyword(!forgotByKeyword)} className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">Palavra-chave</button>
            </div>
          )}

          {forgotByKeyword && mode === 'login' && (
            <button type="button" onClick={handleKeywordReset} className="btn-secondary w-full">Trocar senha com palavra-chave</button>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
                if (result.error) toast.error('Erro ao entrar com Google');
              } catch {
                toast.error('Erro ao entrar com Google');
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline font-semibold"
                >
                  Criar agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline font-semibold"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
