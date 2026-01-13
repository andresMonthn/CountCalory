# Generar Build de Android (APK / AAB) con Expo

Para exportar tu aplicación, utilizaremos **EAS Build** (Expo Application Services). Tenemos dos perfiles configurados:

*   **Preview**: Genera un `.apk` instalable directamente (para testers y uso personal).
*   **Production**: Genera un `.aab` (Android App Bundle) optimizado para subir a Google Play Console.

## Prerrequisitos

1.  **Cuenta de Expo**: Necesitas una cuenta gratuita en [expo.dev](https://expo.dev/signup).
2.  **EAS CLI**: Herramienta de línea de comandos de Expo.

    ```bash
    npm install -g eas-cli
    ```

## Pasos para generar el Build

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

### 3. Seleccionar el tipo de Build

#### Opción A: Versión de Prueba (APK)
Ideal para probar en tu dispositivo sin subir a la tienda.

```bash
eas build -p android --profile preview
```

1.  Al finalizar, obtendrás un enlace de descarga.
2.  Descarga el `.apk` e instálalo en tu Android.

#### Opción B: Versión de Producción (AAB)
Ideal para publicar en Google Play Store.

```bash
eas build -p android --profile production
```

1.  Al finalizar, descarga el archivo `.aab`.
2.  Sube este archivo a tu cuenta de Google Play Console.

---

## Notas Importantes

- **Conexión al Backend**: Recuerda que el APK instalado en tu celular intentará conectarse a la URL definida en `src/config/api.js`.
    - Si usas `localhost` o `10.0.2.2`, solo funcionará en el emulador del mismo PC.
    - Para un dispositivo físico, asegúrate de poner la **IP local de tu computadora** (ej. `http://192.168.1.15:5000`) y que ambos dispositivos estén en la misma red Wi-Fi.
- **Cola de Espera**: El plan gratuito de Expo tiene una cola de espera para los builds. Puede tardar desde 5 hasta 30 minutos en iniciar.
