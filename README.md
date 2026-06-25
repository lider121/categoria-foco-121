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

## WhatsApp Inteligente

El botón `Generar WhatsApp` lee el registro guardado de la fecha seleccionada y el registro del día calendario anterior desde Firestore. Con esos datos arma el mensaje diario, compara las 11 categorías, calcula la variación del promedio, detecta las 3 categorías críticas y abre WhatsApp con el texto listo para enviar.

Si el día anterior no tiene registro, el mensaje muestra `Sin comparación disponible`.

## Versión 1.1

La pantalla inicial incluye un dashboard superior con el promedio del último registro, variación vs día anterior, semáforo de categorías verdes/amarillas/rojas, Top 3 críticas y fecha del último registro. Las categorías también se colorean automáticamente en el formulario:

- Verde: `>= 80`
- Amarillo: `60` a `79.9`
- Rojo: `< 60`

## Versión 1.2

El historial permite abrir registros existentes con `Ver / Editar`. En modo edición, la fecha queda bloqueada, el botón principal cambia a `Actualizar registro` y el guardado actualiza el mismo documento de Firestore sin crear duplicados. El botón `Cancelar edición` vuelve al modo de registro normal.

Los permisos por rol todavía no están implementados; el punto de control para admin/supervisor queda comentado en `app.js`.

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
