import logoG from '@/assets/packy-logo-g.png';

export function PackImagePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full bg-[hsl(0,0%,6%)] flex items-center justify-center ${className}`}>
      <img
        src={logoG}
        alt=""
        aria-hidden
        className="w-1/3 max-w-[80px] opacity-40 select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
