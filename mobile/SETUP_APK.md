# Generar APK de Android con Expo (React Native)

Para exportar tu aplicación como un archivo `.apk` instalable en cualquier dispositivo Android, utilizaremos **EAS Build** (Expo Application Services).

## Prerrequisitos

1.  **Cuenta de Expo**: Necesitas una cuenta gratuita en [expo.dev](https://expo.dev/signup).
2.  **EAS CLI**: Herramienta de línea de comandos de Expo.

    ```bash
    npm install -g eas-cli
    ```

## Pasos para generar el APK

### 1. Iniciar sesión

Abre una terminal en la carpeta `mobile/` e inicia sesión con tu cuenta de Expo:

```bash
cd mobile
eas login
```

### 2. Configurar el proyecto (Solo la primera vez)

Si es la primera vez, registra el proyecto:

```bash
eas build:configure
```

*(Si te pregunta por la plataforma, elige `Android` o `All`)*.

### 3. Generar el APK

Ejecuta el siguiente comando para iniciar la compilación en la nube de Expo. Hemos configurado el perfil `preview` para que genere un **APK** en lugar de un AAB (que es para la Play Store).

```bash
eas build -p android --profile preview
```

### 4. Descargar e Instalar

1.  El proceso tomará unos minutos (dependiendo de la cola gratuita de Expo).
2.  Al finalizar, la terminal te mostrará un enlace de descarga (ej. `https://expo.dev/artifacts/...`).
3.  Descarga ese archivo `.apk` en tu celular.
4.  Instálalo (es posible que debas permitir "Instalar de fuentes desconocidas").

---

## Notas Importantes

- **Conexión al Backend**: Recuerda que el APK instalado en tu celular intentará conectarse a la URL definida en `src/config/api.js`.
    - Si usas `localhost` o `10.0.2.2`, solo funcionará en el emulador del mismo PC.
    - Para un dispositivo físico, asegúrate de poner la **IP local de tu computadora** (ej. `http://192.168.1.15:5000`) y que ambos dispositivos estén en la misma red Wi-Fi.
- **Cola de Espera**: El plan gratuito de Expo tiene una cola de espera para los builds. Puede tardar desde 5 hasta 30 minutos en iniciar.
