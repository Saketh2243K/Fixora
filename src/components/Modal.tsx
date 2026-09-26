import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, title, maxWidth = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto card shadow-card-hover animate-scale-in`}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-navy-100 rounded-t-2xl">
            <h2 className="text-lg font-bold text-navy-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-900 hover:bg-navy-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-900 hover:bg-navy-50 transition-colors bg-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
