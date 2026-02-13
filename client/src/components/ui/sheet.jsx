import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({ open, onOpenChange, children, side = "right", className }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const variants = {
    initial: { x: side === "right" ? "100%" : "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: side === "right" ? "100%" : "-100%", opacity: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-50 flex", side === "right" ? "justify-end" : "justify-start")}>
           {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange?.(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Sheet Panel */}
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative z-50 h-full w-3/4 max-w-sm bg-slate-950 border-l border-slate-800 shadow-2xl p-6 flex flex-col gap-4",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
             {/* Close Button */}
             <button
                onClick={() => onOpenChange?.(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary text-slate-400 hover:text-white"
             >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
             </button>
             {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
