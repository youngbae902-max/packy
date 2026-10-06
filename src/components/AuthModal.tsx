
  if (!isOpen) return null;

  return (
    <main className="fixed inset-0 z-[9999] h-[100svh] w-full overflow-x-hidden overflow-y-auto bg-black text-white">
      <div className="mx-auto flex min-h-full w-full max-w-[420px] items-center px-5 py-4 sm:px-6 sm:py-6">
        <div className="w-full">
          <div className="text-center mb-5 sm:mb-7">
            <div className="flex justify-center mb-5 sm:mb-6">
              <span className="text-[28px] sm:text-[32px] leading-none font-serif font-black tracking-[-0.12em] text-white/30">𐌆</span>
            </div>

            <h1 className="text-[23px] sm:text-[26px] leading-none font-bold tracking-[-0.04em]">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>

            <p className="mt-2 sm:mt-3 text-[14px] sm:text-[15px] leading-tight text-white/45 tracking-[-0.02em]">
              {mode === 'login' ? 'Entre na sua conta PACKY' : 'Crie sua conta PACKY'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'Seu email ou usuário' : 'Seu email'}
                className="w-full h-[46px] sm:h-[50px] rounded-[14px] sm:rounded-[15px] bg-transparent border border-white/[0.20] pl-[50px] sm:pl-[54px] pr-4 text-[14px] sm:text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.38]"
                required
              />
            </div>

            {forgotByKeyword && mode === 'login' && (
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Sua palavra-chave"
                  className="w-full h-[46px] sm:h-[50px] rounded-[14px] sm:rounded-[15px] bg-transparent border border-white/[0.20] pl-[50px] sm:pl-[54px] pr-4 text-[14px] sm:text-[15px] text-white placeholder:text-white/35 outline-none focus:border-white/[0.38]"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full h-[46px] sm:h-[50px] rounded-[14px] sm:rounded-[15px] bg-transparent border border-white/[0.20] pl-[50px] sm:pl-[54px] pr-14 sm:pr-16 text-[14px] sm:text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-white/[0.38]"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <button type="button" onClick={handleForgotPassword} className="text-[13px] sm:text-[14px] text-white/45 hover:text-white/75 transition">
                  Esqueceu a senha?
                </button>
                <span className="text-white/15 text-[15px]">·</span>
                <button type="button" onClick={() => setForgotByKeyword(v => !v)} className="text-[13px] sm:text-[14px] text-white/45 hover:text-white/75 transition">
                  {forgotByKeyword ? 'Fechar' : 'Palavra-chave'}
                </button>
              </div>
            )}

            {forgotByKeyword && mode === 'login' && (
              <button type="button" onClick={handleKeywordReset} className="w-full h-[46px] sm:h-[50px] rounded-[14px] sm:rounded-[15px] bg-[#171717] border border-white/[0.12] text-[13px] sm:text-[14px] font-semibold hover:bg-[#202020] transition">
                Trocar senha
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] sm:h-[50px] rounded-full bg-white text-black text-[13px] sm:text-[14px] font-bold hover:bg-white/90 active:scale-[0.995] transition disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>

            <div className="flex items-center gap-3 py-0">
              <div className="h-px flex-1 bg-white/[0.15]" />
              <span className="text-[13px] sm:text-[14px] text-white/35">OU</span>
              <div className="h-px flex-1 bg-white/[0.15]" />
            </div>

            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              className="w-full h-[46px] sm:h-[50px] rounded-full bg-[#1b1b1d] border border-white/[0.14] text-[14px] sm:text-[15px] font-semibold hover:bg-[#222224] transition flex items-center justify-center gap-4 sm:gap-5"
            >
              <span className="text-[18px] sm:text-[19px] leading-none"></span>
              Entrar com a Apple
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="w-full h-[46px] sm:h-[50px] rounded-full bg-[#1b1b1d] border border-white/[0.14] text-[14px] sm:text-[15px] font-semibold hover:bg-[#222224] transition flex items-center justify-center gap-4 sm:gap-5"
            >
              <span className="text-[18px] sm:text-[19px] font-bold text-[#4285F4]">G</span>
              Entrar com o Google
            </button>

            <p className="text-center text-[13px] sm:text-[14px] text-white/45 pt-2 pb-0">
              {mode === 'login' ? (
                <>Não tem conta? <button type="button" onClick={() => setMode('signup')} className="text-white font-semibold hover:text-white/80 transition">Criar conta</button></>
              ) : (
                <>Já tem conta? <button type="button" onClick={() => setMode('login')} className="text-white font-semibold hover:text-white/80 transition">Entrar</button></>
              )}
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}