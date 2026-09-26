import { Wrench } from 'lucide-react';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-sm">
          <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-navy-900 border-2 border-white" />
      </div>
      {showText && (
        <div className="leading-none">
          <span className="text-lg font-extrabold text-navy-900 tracking-tight">
            Fixora
          </span>
        </div>
      )}
    </div>
  );
}
