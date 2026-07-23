export function BallIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2.75c3 2.3 4.6 5.8 4.6 9.25s-1.6 6.95-4.6 9.25M12 2.75c-3 2.3-4.6 5.8-4.6 9.25s1.6 6.95 4.6 9.25"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3.2 9.3c2.2 1.6 5.6 2.6 8.8 2.6s6.6-1 8.8-2.6M3.2 14.7c2.2-1.6 5.6-2.6 8.8-2.6s6.6 1 8.8 2.6"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
