# ClassConnect - Mobile App

Aplicación móvil del trabajo práctico grupal ClassConnect de la materia [Ingeniería de Software II](https://ingenieria-del-software-2.github.io/) (TA049), curso Rojas. Realizada con:

- [React Native](https://reactnative.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Expo](https://expo.dev)
- [Axios](https://axios-http.com/es/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## Ejecución (modo desarrollo)

1. Instalar las dependencias necesarias:

   ```bash
   npm install
   ```

2. Incluir en el directorio raíz del proyecto un archivo `.env` con las siguientes variables de entorno:

   ```ini
   EXPO_PUBLIC_FIREBASE_API_KEY=<firebase api key>
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase auth domain>
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=<firebase project id>
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<firebase storage bucket>
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<firebase messaging sender id>
   EXPO_PUBLIC_FIREBASE_APP_ID=<firebase app id>

   EXPO_PUBLIC_MIDDLEEND_BASE_URL=<middleend url>
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android client id>
   EXPO_PUBLIC_EXPO_GO_CLIENT_ID=<expo go client id>
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web client id>
   ```

3. Incluir en el directorio raíz del proyecto el archivo `google-services.json` provisto por Firebase
   (información sobre cómo obtenerlo [acá](https://firebase.google.com/docs/android/setup?hl=es-419#add-config-file))

4. Generar una prebuild:

   ```bash
   npx expo prebuild --clean --platform android
   ```

5. Iniciar la aplicación:

   ```bash
   npx expo run:android
   ```
