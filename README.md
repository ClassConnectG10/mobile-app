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

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=<firebase api key>
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase auth domain>
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=<firebase project id>
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<firebase storage bucket>
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<firebase messaging sender id>
   EXPO_PUBLIC_FIREBASE_APP_ID=<firebase app id>

   EXPO_PUBLIC_MIDDLEEND_BASE_URL=<middleend url>
   ```

3. Iniciar la aplicación:

   ```bash
    npm run start
   ```
