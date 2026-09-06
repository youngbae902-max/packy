export function QrCodeDecoration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`shrink-0 ${className}`}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Position markers */}
      <rect x="4" y="4" width="18" height="18" rx="2" />
      <rect x="10" y="10" width="6" height="6" fill="hsl(var(--background))" />
      <rect x="42" y="4" width="18" height="18" rx="2" />
      <rect x="48" y="10" width="6" height="6" fill="hsl(var(--background))" />
      <rect x="4" y="42" width="18" height="18" rx="2" />
      <rect x="10" y="48" width="6" height="6" fill="hsl(var(--background))" />
      {/* Data modules */}
      <rect x="28" y="4" width="6" height="6" />
      <rect x="28" y="14" width="6" height="6" />
      <rect x="28" y="28" width="6" height="6" />
      <rect x="28" y="38" width="6" height="6" />
      <rect x="28" y="48" width="6" height="6" />
      <rect x="28" y="54" width="6" height="6" />
      <rect x="4" y="28" width="6" height="6" />
      <rect x="14" y="28" width="6" height="6" />
      <rect x="42" y="28" width="6" height="6" />
      <rect x="54" y="28" width="6" height="6" />
      <rect x="42" y="38" width="6" height="6" />
      <rect x="52" y="38" width="6" height="6" />
      <rect x="42" y="48" width="6" height="6" />
      <rect x="52" y="54" width="6" height="6" />
      <rect x="54" y="42" width="6" height="6" />
      <rect x="44" y="54" width="6" height="6" />
    </svg>
  );
}
