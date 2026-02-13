import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

export function AboutDialog({ open, onOpenChange }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Acerca de CountCalory</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 pt-2 text-slate-300">
                    <p>Tu asistente para calcular y gestionar calorías fácilmente.</p>
                    <div>
                        <strong className="text-white">Contacto:</strong><br/>
                        <a href="mailto:andre.777.monthana@gmail.com" className="text-primary hover:underline">andres.777.monthana@gmail.com</a>
                    </div>
                    <div>
                        <strong className="text-white">Información:</strong><br/>
                        Versión 1.01
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => onOpenChange(false)}>Cerrar</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
