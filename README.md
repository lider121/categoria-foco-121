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

## Versión 1.3

La sección de historial incluye exportación CSV compatible con Excel. Permite descargar todos los registros, los últimos 7 días o el mes actual, usando datos reales de Firestore y columnas para fecha, responsable, turno, 11 categorías, promedio y observaciones.

## Versión 1.4

Se agrega selector temporal de rol: Usuario, Supervisor y Administrador. Usuario puede crear, consultar, generar WhatsApp y exportar, pero no editar. Supervisor y Administrador pueden editar registros existentes. El permiso futuro de eliminación queda preparado para Administrador, sin implementar login todavía.

## Versión 1.5

El historial muestra `Eliminar` solo cuando el rol temporal es Administrador. La eliminación pide confirmación, borra el documento correspondiente en Firestore y actualiza historial y dashboard.

## Versión 1.6

Se agrega auditoría y respaldo de eliminaciones. Los registros nuevos guardan `createdAt`, `createdBy`, `updatedAt` y `updatedBy`. Al editar un registro existente se actualizan solo `updatedAt` y `updatedBy`, manteniendo los campos de creación originales sin cambios.

Antes de eliminar un documento de `registros`, la app guarda una copia completa en la colección `deletedLogs` con el ID eliminado, los datos del registro, `deletedBy` y `deletedAt`. Si no se puede crear el respaldo, la eliminación no continúa.

La exportación conserva el CSV compatible con Excel y agrega descarga JSON usando el mismo rango seleccionado: todos los registros, últimos 7 días o mes actual.

Importante: para que `Eliminar` funcione, Firestore debe permitir escritura en `deletedLogs`. Si esa regla falta, la app mostrará un mensaje específico y mantendrá el registro original sin borrar.

## Versión 1.7

El historial incorpora búsqueda en tiempo real y filtros combinables por fecha desde/hasta, usuario creador y categoría. El contador de resultados se actualiza automáticamente y el botón `Limpiar filtros` vuelve a mostrar el lote completo consultado.

Para cuidar el rendimiento con muchos registros, el historial consulta Firestore con límite y aplica los filtros de fecha en la consulta cuando corresponde. Los filtros de texto, usuario y categoría se aplican en memoria sobre los registros cargados.

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

La eliminación controlada requiere permiso en `registros` y también en `deletedLogs`, porque primero se guarda el respaldo y después se borra el documento original. Como los roles actuales son temporales y todavía no hay login, `deletedLogs` valida el campo `deletedRole` enviado por la app.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registros/{document} {
      allow read, write: if true;
    }

    match /roles/{document} {
      allow read, write: if true;
    }

    match /deletedLogs/{document} {
      allow read: if true;
      allow create: if request.resource.data.deletedRole == "admin"
        && request.resource.data.documentId is string
        && request.resource.data.deletedBy is string
        && request.resource.data.deletedData is map
        && request.resource.data.deletedAt == request.time;
      allow update, delete: if false;
    }
  }
}
```
