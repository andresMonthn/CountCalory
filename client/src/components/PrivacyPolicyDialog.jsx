import React from 'react';
import { Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./ui/alert-dialog";

export function PrivacyPolicyDialog({ open, onOpenChange }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-slate-800 bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Política de Privacidad
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 space-y-4 pt-4 text-justify text-sm">
            <p><strong>Última actualización: Enero 2026</strong></p>
            
            <p>En CountCalory, valoramos y respetamos tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.</p>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">1. Responsable del tratamiento</h3>
              <p>El responsable del tratamiento de tus datos es <strong>CountCalory</strong>.</p>
              <p>Correo de contacto: <a href="mailto:andres.777.monthana@gmail.com" className="text-emerald-400 hover:underline">andres.777.monthana@gmail.com</a></p>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">2. Información que recopilamos</h3>
              <p>Recopilamos información que nos proporcionas directamente, como tu dirección de correo electrónico para la autenticación y datos físicos (peso, altura, edad, género) necesarios para el cálculo de requerimientos calóricos.</p>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">3. Base legal del procesamiento</h3>
              <p>El tratamiento de los datos se basa en el consentimiento del usuario al utilizar la aplicación.</p>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">4. Uso de la información</h3>
              <p>Utilizamos tu información exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Proporcionar y mantener el servicio de conteo de calorías.</li>
                <li>Personalizar tu plan nutricional y objetivos.</li>
                <li>Mejorar la funcionalidad de la aplicación.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">5. Servicios de terceros</h3>
              <p>La aplicación puede utilizar servicios de terceros (como servicios de autenticación, análisis o infraestructura) que procesan datos conforme a sus propias políticas de privacidad. Estos servicios solo acceden a la información necesaria para su funcionamiento.</p>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">6. Protección de datos</h3>
              <p>Implementamos medidas de seguridad para proteger tu información personal contra acceso no autorizado, alteración o divulgación. Los datos se almacenan en bases de datos seguras y solo son accesibles por el sistema de la aplicación. Tus datos no se venden a terceros.</p>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">7. Eliminación de datos</h3>
              <p>Tienes derecho a solicitar la eliminación completa de tu cuenta y todos los datos asociados.</p>
              <p>Puedes solicitar la eliminación de tu cuenta y datos escribiendo a: <a href="mailto:andres.777.monthana@gmail.com" className="text-emerald-400 hover:underline">andres.777.monthana@gmail.com</a></p>
            </div>

            <div>
              <h3 className="text-slate-200 font-semibold mb-1">8. Tus derechos</h3>
              <p>Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Puedes contactarnos a través del correo proporcionado si deseas ejercer estos derechos.</p>
              <p className="mt-2">También puedes revocar tu consentimiento en cualquier momento dejando de utilizar la aplicación.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700">
            Entendido
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
