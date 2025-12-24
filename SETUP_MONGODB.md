# Configuración de MongoDB Local en Windows

Actualmente, el proyecto está configurado para conectarse a una base de datos local en:
`mongodb://127.0.0.1:27017/countcalory`

Para que esto funcione, necesitas tener **MongoDB Community Server** instalado y ejecutándose en tu máquina.

## Paso 1: Descargar e Instalar

1. Visita el centro de descargas oficial de MongoDB:
   [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

2. Selecciona la versión actual (Current), plataforma **Windows**, y paquete **msi**. Haz clic en **Download**.

3. Ejecuta el archivo `.msi` descargado.

4. Sigue el asistente de instalación:
   - Elige el tipo de instalación **Complete**.
   - **IMPORTANTE:** Asegúrate de dejar marcada la opción **"Install MongoDB as a Service"**. Esto hará que MongoDB se inicie automáticamente cada vez que enciendas tu PC.
   - (Opcional) Puedes dejar marcada la opción para instalar **MongoDB Compass** (una interfaz gráfica muy útil para ver tus datos).

5. Finaliza la instalación.

## Paso 2: Verificar la instalación

1. Abre una nueva terminal (PowerShell o CMD).
2. Verifica que el servicio esté corriendo con el comando:
   ```powershell
   Get-Service MongoDB
   ```
   Debería decir `Status: Running`.

## Paso 3: Ejecutar el proyecto

Una vez instalado MongoDB, vuelve a tu terminal de VS Code y ejecuta el servidor nuevamente:

```bash
cd server
npm run dev
```

Si todo es correcto, verás el mensaje:
`✅ MongoDB Connected to: ...`

---

## Alternativa: MongoDB Atlas (Nube)

Si prefieres no instalar nada en tu computadora, puedes usar una base de datos gratuita en la nube con MongoDB Atlas.

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un Cluster gratuito (M0).
3. Obtén tu "Connection String" (elige conectar con tu aplicación -> Driver Node.js).
4. Reemplaza la variable `MONGODB_URI` en el archivo `server/.env` con tu nueva cadena de conexión.
