# CountCalory

CountCalory es una aplicación MERN (MongoDB, Express, React, Node.js) para el seguimiento de calorías, planificación de comidas y cálculo de presupuestos calóricos.

## Estructura del Proyecto

- **client/**: Frontend desarrollado con React y Vite.
- **server/**: Backend desarrollado con Node.js y Express.

## Requisitos Previos

- Node.js (v18+ recomendado)
- MongoDB (Local o Atlas)

## Configuración e Instalación

1. Clonar el repositorio.
2. Instalar dependencias para servidor y cliente:

   ```bash
   cd server
   npm install
   
   cd ../client
   npm install
   ```

3. Configurar variables de entorno:
   - Revisa `server/.env` y ajusta `MONGODB_URI` si es necesario.
   - Revisa `client/.env` para la URL de la API.

## Ejecución

### Backend
```bash
cd server
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

## Base de Datos (Semilla)

Para poblar la base de datos con una lista inicial de alimentos (obtenida de una fuente externa), ejecuta el siguiente comando:

```bash
cd server
npm run seed:foods
```

Este script se encuentra en: `/c:/Users/Admin/Documents/.atomLogic/countcalory/CountCalory/server/seed/seedFoods.js`

El script:
1. Conecta a la base de datos configurada en `.env`.
2. Descarga y procesa una tabla de calorías externa.
3. Genera variaciones de alimentos (cocido, frito, etc.).
4. Inserta los datos en la colección `foods`.

## Versión Móvil (React Native)

Este proyecto incluye una versión móvil nativa desarrollada con React Native y Expo en la carpeta `mobile/`.

### Requisitos
- Node.js
- Dispositivo Android/iOS o Emulador
- Expo Go (App en tu celular)

### Ejecución
1. Ve a la carpeta `mobile`:
   ```bash
   cd mobile
   ```
2. Instala dependencias (si es la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npx expo start
   ```
4. Escanea el código QR con Expo Go (Android) o la cámara (iOS).

### Estructura
- `src/components`: Componentes reutilizables (Header, etc.)
- `src/screens`: Pantallas principales (HomeScreen, etc.)
- `src/config`: Configuraciones (API URL)

## Generar APK (Android)

Para exportar la aplicación móvil como un archivo `.apk` instalable, sigue las instrucciones detalladas en:

[📄 mobile/SETUP_APK.md](./mobile/SETUP_APK.md)

Resumen rápido:
1. `cd mobile`
2. `npm install -g eas-cli`
3. `eas login`
4. `eas build -p android --profile preview`


