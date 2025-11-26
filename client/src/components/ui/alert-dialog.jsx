import { useEffect } from "react";

export function AlertDialog({ open, onOpenChange, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
}

export function AlertDialogTrigger({ asChild, children, onClick }) {
  return asChild ? children : (
    <button onClick={onClick} className="px-3 py-2 rounded border border-slate-700 bg-slate-800 text-slate-200">{children}</button>
  );
}

export function AlertDialogContent({ children }) {
  return (
    <div className="relative z-50 w-[92%] max-w-[480px] rounded border border-slate-700 bg-slate-900 text-slate-200 p-4 shadow-xl">
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children }) { return <div className="mb-3">{children}</div>; }
export function AlertDialogTitle({ children }) { return <div className="text-base font-semibold">{children}</div>; }
export function AlertDialogDescription({ children }) { return <div className="text-sm text-slate-400">{children}</div>; }
export function AlertDialogFooter({ children }) { return <div className="mt-3 flex gap-2 justify-end">{children}</div>; }

export function AlertDialogCancel({ children, onClick }) {
  return <button onClick={onClick} className="px-3 py-2 rounded border border-slate-700 bg-slate-800 text-slate-200">{children}</button>;
}

export function AlertDialogAction({ children, onClick }) {
  return <button onClick={onClick} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white">{children}</button>;
}

