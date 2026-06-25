# CATEGORÍA FOCO 121

App web estatica para registrar una evaluacion diaria de la tienda 121 con 11 categorias, promedio automatico, historial en Firebase Firestore y mensaje listo para WhatsApp.

## Configurar Firebase

1. Crea un proyecto en Firebase.
2. Activa Firestore Database.
3. En la configuracion del proyecto, crea una app web.
4. Copia los datos de Firebase y reemplaza el objeto `firebaseConfig` en `app.js`.

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Los registros se guardan en la coleccion `categoria_foco_121`, con un documento por fecha usando el formato `121_YYYY-MM-DD`.

## GitHub Pages

Publica la rama principal desde Settings > Pages. Como es HTML, CSS y JavaScript puro, no necesita npm ni build.

## Reglas Firestore de prueba

Para pruebas internas puedes usar reglas abiertas temporalmente. Ajustalas antes de usar la app en produccion.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /categoria_foco_121/{document} {
      allow read, write: if true;
    }
  }
}
```
