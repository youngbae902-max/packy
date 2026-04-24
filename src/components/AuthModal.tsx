import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

type Mode = 'login' | 'signup' | 'forgot';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast.error('Não foi possível enviar o email');
        } else {
          toast.success('Se este email existir, enviaremos instruções');
          setMode('login');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Conta criada com sucesso!');
          onClose();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.success('Login realizado!');
          onClose();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const title =
    mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'forgot' && (
          <button
            onClick={() => setMode('login')}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
        </div>

        {mode === 'signup' && (
          <div className="mb-5 rounded-xl border border-border/60 bg-[hsl(0,0%,4%)] px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-muted-foreground uppercase tracking-wide font-semibold">
              Invente um email apenas para esse site, não precisa ser verificado pelo Google. E invente uma senha.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-field"
              required
            />
          </div>

          {mode !== 'forgot' && (
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
                  className="input-field pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Esqueci a senha
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading
              ? 'Carregando...'
              : mode === 'login'
              ? 'Entrar'
              : mode === 'signup'
              ? 'Criar Conta'
              : 'Enviar email'}
          </button>

          {mode !== 'forgot' && (
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
          )}
        </form>
      </div>
    </div>
  );
}
