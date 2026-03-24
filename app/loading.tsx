import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-gold animate-pulse">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em] animate-pulse">
          GETBET SECURE
        </p>
      </div>
    </div>
  );
}
