import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Primitives ---

export function AlertDialog({ open, onOpenChange, children }) {
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
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-[5px]"
            onClick={() => onOpenChange?.(false)}
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function AlertDialogContent({ children, className = "", ...props }) {
  return (
    <motion.div
      role="alertdialog"
      aria-modal="true"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "relative z-50 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 text-slate-200 p-6 shadow-2xl",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AlertDialogHeader({ children, className }) { 
    return <div className={cn("flex flex-col space-y-2 text-center sm:text-left mb-4", className)}>{children}</div>; 
}

export function AlertDialogTitle({ children, className }) { 
    return <div className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</div>; 
}

export function AlertDialogDescription({ children, className }) { 
    return <div className={cn("text-sm text-slate-400", className)}>{children}</div>; 
}

export function AlertDialogFooter({ children, className }) { 
    return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4", className)}>{children}</div>; 
}

export function AlertDialogTrigger({ asChild, children, onClick }) {
  return asChild ? children : (
    <button onClick={onClick} className="px-3 py-2 rounded border border-slate-700 bg-slate-800 text-slate-200">{children}</button>
  );
}

export function AlertDialogCancel({ children, onClick, className }) {
  return <button onClick={onClick} className={cn("px-4 py-2 rounded-md border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200 transition-colors text-sm font-medium", className)}>{children}</button>;
}

export function AlertDialogAction({ children, onClick, className }) {
  return <button onClick={onClick} className={cn("px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-sm font-medium", className)}>{children}</button>;
}

// --- Enhanced System Alert Component ---

const ALERT_STYLES = {
    success: { icon: CheckCircle, color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
    warning: { icon: AlertTriangle, color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    error: { icon: XCircle, color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/10" },
    info: { icon: Info, color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10" }
};

export function Alert({ type = 'info', title, children, open, onOpenChange, autoClose = 0, onConfirm, confirmText = "Aceptar", showCancel = false, cancelText = "Cancelar" }) {
    
    useEffect(() => {
        if (open && autoClose > 0) {
            const timer = setTimeout(() => onOpenChange(false), autoClose);
            return () => clearTimeout(timer);
        }
    }, [open, autoClose, onOpenChange]);

    const style = ALERT_STYLES[type] || ALERT_STYLES.info;
    const Icon = style.icon;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={cn("border-l-4", style.border)}>
                <button 
                    onClick={() => onOpenChange(false)} 
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-slate-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-800"
                >
                    <X className="h-4 w-4 text-slate-400" />
                    <span className="sr-only">Close</span>
                </button>
                
                <AlertDialogHeader className="sm:text-left">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", style.bg)}>
                            <Icon className={cn("h-6 w-6", style.color)} />
                        </div>
                        <AlertDialogTitle className={style.color}>{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-2 text-slate-300">
                        {children}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter>
                    {showCancel && (
                        <AlertDialogCancel onClick={() => onOpenChange(false)}>{cancelText}</AlertDialogCancel>
                    )}
                    <AlertDialogAction 
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onOpenChange(false);
                        }}
                        className={cn(
                            type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                            type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 
                            type === 'info' ? 'bg-blue-600 hover:bg-blue-700' : 
                            'bg-emerald-600 hover:bg-emerald-700'
                        )}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
