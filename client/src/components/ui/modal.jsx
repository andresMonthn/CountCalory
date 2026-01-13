import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Componente Modal genérico reutilizable con animaciones y backdrop
 */
export function Modal({ open, onOpenChange, children, className, title }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center isolate p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange?.(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative w-full max-w-lg overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-white/10",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
                {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
