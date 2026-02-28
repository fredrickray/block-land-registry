export default function StatusBadge({ type }: { type: 'REGISTER' | 'TRANSFER' }) {
  return type === 'REGISTER' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-chain border border-primary/20">
      Register
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
      Transfer
    </span>
  );
}
