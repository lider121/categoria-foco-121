# CATEGORÍA FOCO 121

App web estática para registrar una evaluación diaria de la tienda 121 con 11 categorías, promedio automático, historial en Firebase Firestore y mensaje listo para WhatsApp.

## Registro Diario

El módulo guarda los documentos en la colección `registros`. Cada documento usa la fecha como ID (`YYYY-MM-DD`) para evitar registros duplicados por día.

Campos guardados:

- `fecha`
- `nombre`
- `turno`
- `categorias`
- `promedio`
- `observaciones`
- `fechaHoraRegistro`
- `tienda`

## Configurar Firebase

1. Crea un proyecto en Firebase.
2. Activa Firestore Database.
3. En la configuración del proyecto, crea una app web.
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

## GitHub Pages

Publica la rama principal desde Settings > Pages. Como es HTML, CSS y JavaScript puro, no necesita npm ni build.

## Reglas Firestore de prueba

Para pruebas internas puedes usar reglas abiertas temporalmente. Ajústalas antes de usar la app en producción.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registros/{document} {
      allow read, write: if true;
    }
  }
}
```
