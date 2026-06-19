import logoG from '@/assets/packy-logo-g.png';

export function Header() {
  return (
    <header className="flex flex-col items-center text-center py-10 px-4">
      <img 
        src={logoG} 
        alt="PACKY" 
        className="w-20 h-20 object-contain mb-4 select-none drop-shadow-sm grayscale contrast-125 dark:brightness-200" 
        draggable={false} 
      />
      <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter mb-3 leading-none">PACKY</h1>
      <p className="text-[15px] text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
        Plataforma feita para a comunidade de editores compartilhar, descobrir e organizar packs.
      </p>
      <button className="bg-foreground text-background font-bold py-3.5 px-8 rounded-[1.25rem] text-[15px] hover:opacity-90 transition-opacity w-full max-w-[200px]">
        Começar
      </button>
    </header>
  );
}
