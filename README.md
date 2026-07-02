# CATEGORIA FOCO 121

App web estatica para registrar una evaluacion diaria de la tienda 121 con 11 categorias, promedio automatico, historial en Firebase Firestore y mensaje listo para WhatsApp.

## Registro Diario

El modulo guarda los documentos en la coleccion `registros`. Cada documento usa la fecha como ID (`YYYY-MM-DD`) para evitar registros duplicados por dia.

Campos guardados:

- `fecha`
- `nombre`
- `turno`
- `categorias`
- `promedio`
- `observaciones`
- `fechaHoraRegistro`
- `tienda`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## WhatsApp Inteligente

El boton `Generar WhatsApp` lee el registro guardado de la fecha seleccionada y el registro del dia calendario anterior desde Firestore. Con esos datos arma el mensaje diario, compara las 11 categorias, calcula la variacion del promedio, detecta las 3 categorias criticas y abre WhatsApp con el texto listo para enviar.

Si el dia anterior no tiene registro, el mensaje muestra `Sin comparacion disponible`.

## Version 1.1

La pantalla inicial incluye un dashboard superior con el promedio del ultimo registro, variacion vs dia anterior, semaforo de categorias verdes/amarillas/rojas, Top 3 criticas y fecha del ultimo registro.

- Verde: `>= 80`
- Amarillo: `60` a `79.9`
- Rojo: `< 60`

## Version 1.2

El historial permite abrir registros existentes con `Ver / Editar`. En modo edicion, la fecha queda bloqueada, el boton principal cambia a `Actualizar registro` y el guardado actualiza el mismo documento de Firestore sin crear duplicados.

## Version 1.3

La seccion de historial incluye exportacion CSV compatible con Excel. Permite descargar todos los registros, los ultimos 7 dias o el mes actual.

## Version 1.4

Se agregan permisos por rol: Usuario, Supervisor y Administrador.

## Version 1.5

El historial muestra `Eliminar` solo cuando el rol es Administrador. La eliminacion pide confirmacion, borra el documento correspondiente en Firestore y actualiza historial y dashboard.

## Version 1.6

Se agrega auditoria y respaldo de eliminaciones. Los registros nuevos guardan `createdAt`, `createdBy`, `updatedAt` y `updatedBy`. Al editar un registro existente se actualizan solo `updatedAt` y `updatedBy`, manteniendo los campos de creacion originales sin cambios.

Antes de eliminar un documento de `registros`, la app guarda una copia completa en la coleccion `deletedLogs` con el ID eliminado, los datos del registro, `deletedBy` y `deletedAt`. Si no se puede crear el respaldo, la eliminacion no continua.

La exportacion conserva el CSV compatible con Excel y agrega descarga JSON usando el mismo rango seleccionado: todos los registros, ultimos 7 dias o mes actual.

## Version 1.7

El historial incorpora busqueda en tiempo real y filtros combinables por fecha desde/hasta, usuario creador y categoria. El contador de resultados se actualiza automaticamente y el boton `Limpiar filtros` vuelve a mostrar el lote completo consultado.

## Version 1.8

La interfaz queda pulida para pruebas con usuarios reales: mensajes visuales de exito, error y aviso; botones y controles mas comodos en movil; foco accesible; textos de acciones mas claros; y revision de consola/sintaxis.

Estado recomendado para pruebas: registro diario, dashboard, historial, filtros, edicion, eliminacion con respaldo, exportacion CSV/JSON y WhatsApp estan listos para uso controlado.

## Version 2.0

Se reemplaza el selector temporal por inicio de sesion real con Firebase Authentication usando correo y contrasena. La app queda bloqueada hasta iniciar sesion, muestra el nombre y rol del usuario autenticado, permite cerrar sesion y conserva los permisos existentes:

- `Usuario`: crea registros, consulta historial, genera WhatsApp y exporta CSV/JSON.
- `Supervisor`: puede todo lo anterior y editar registros.
- `Administrador`: puede todo lo anterior y eliminar registros con respaldo en `deletedLogs`.

Los roles se leen desde Firestore, coleccion `roles`. El documento recomendado usa como ID el UID del usuario de Authentication.

## Version 2.1

Se agrega la seccion `Reportes y estadisticas`, visible solo para Supervisor y Administrador. Los reportes leen datos reales desde `registros` y permiten filtrar por rango de fechas.

Indicadores incluidos:

- total de registros;
- promedio general;
- mejor porcentaje;
- peor porcentaje;
- ultima fecha registrada.

Estadisticas incluidas:

- promedio, minimo, maximo y cantidad de datos por categoria;
- promedio y cantidad de registros por usuario creador;
- promedio y cantidad de registros por mes;
- grafico de evolucion por fecha;
- grafico de promedio por categoria.

## Version 2.1.1

Se mejora la visualizacion de reportes. El grafico de evolucion ahora combina barras de cantidad de registros por fecha con una linea suavizada de promedio diario, puntos visibles, leyenda y tooltips. El grafico de promedio por categoria se ordena de mayor a menor, usa barras horizontales y colorea el desempeno con verde, amarillo y rojo.

Las tablas de estadisticas alinean valores numericos a la derecha y colorean los promedios con la misma escala de desempeno:

- Verde: `>= 70`
- Amarillo: `50` a `69.9`
- Rojo: `< 50`

## Version 2.1.2

Se rediseña la seccion de reportes con tema oscuro tipo dashboard: sidebar lateral, logo FOCO 121, usuario autenticado, menu vertical, tarjetas KPI con iconos, graficos dentro de tarjetas oscuras y tablas con divisiones sutiles.

La vista mantiene los graficos existentes con mejor presentacion visual:

- evolucion por fecha con barras de cantidad y linea de promedio diario;
- promedio por categoria con barras horizontales ordenadas de mayor a menor;
- tablas con promedios alineados a la derecha y coloreados por desempeno.

Los reportes siguen visibles solo para Supervisor y Administrador.

## Version 2.2

Se reemplaza el estilo oscuro por un rediseño claro, simple y ordenado para toda la aplicacion. Reportes vuelve a usar fondo claro, tarjetas blancas, bordes grises suaves y azul como color principal.

La seccion de reportes queda organizada con KPIs superiores en tarjetas iguales, grafico de evolucion con mas ancho, grafico por categoria acomodado segun espacio disponible y tablas al final en una grilla responsive. En movil la interfaz usa una sola columna, botones amplios y evita scroll horizontal de pagina.

El pulido visual final usa layout de dos columnas con sidebar fijo, tipografia Inter, iconos Lucide, fondo `#F5F7FB`, tarjetas de 16px, dashboard superior de cuatro tarjetas, dos graficos principales y KPIs inferiores alineados al estilo de referencia.

No se modifica la logica de Firebase Authentication, roles, dashboard, historial, filtros, edicion, eliminacion con respaldo, exportacion CSV/JSON ni WhatsApp.

## Version 2.2.1

Se agrega menu lateral colapsable. En escritorio el sidebar puede reducirse a solo iconos para que el contenido principal use mas espacio. En movil se abre como panel lateral sobre el contenido, con fondo oscuro transparente y cierre al tocar fuera del menu.

El estado abierto/cerrado se recuerda con `localStorage` sin modificar autenticacion, roles, Firestore ni las funcionalidades existentes.

## Version 2.2.2

Se reorganiza el dashboard con CSS Grid compacto: cinco KPIs en una fila, ultimo registro y total de registros integrados como tarjetas, graficos inmediatamente debajo en proporcion aproximada 70/30 y tablas visibles en grilla de dos columnas.

El sidebar colapsado mantiene solo iconos con tooltip al pasar el mouse, al estilo Teams, Discord o Power BI, y el contenido principal aprovecha mas ancho disponible.

## Version 2.2.3

Se simplifica el dashboard principal para mostrar solo indicadores utiles para la toma de decisiones: promedio mas reciente, semaforo de categorias, top 3 criticas y tendencia contra el registro anterior.

Se eliminan las tarjetas redundantes de ultimo registro y total de registros. Las cuatro tarjetas superiores quedan reorganizadas en una grilla uniforme que ocupa todo el ancho disponible.

## Version 2.2.4

Ajuste visual final del dashboard y reportes: se mantiene el tema claro, menu lateral compacto y cuatro tarjetas principales en el dashboard.

Reportes queda enfocado en graficos: se eliminan KPIs repetidos y la estadistica por usuario creador, la evolucion por fecha queda como barras de promedio diario y el promedio por categoria queda como barras horizontales por desempeno. Se agrega boton para exportar el reporte a PDF mediante impresion del navegador.

## Version 2.2.5

Correccion completa del sidebar en moviles: bajo 768px el menu queda oculto fuera del flujo, se abre como panel lateral de 280px con overlay oscuro, se cierra al tocar fuera o seleccionar una opcion y evita scroll horizontal o contenido debajo del menu.

## Version 2.2.6

Se elimina el listado duplicado de estadistica por categoria debajo de Reportes. La seccion queda enfocada en los graficos principales y mantiene solo la estadistica mensual cuando existen datos disponibles.

## Version 2.2.7

Se simplifica la pantalla `Nuevo registro` para concentrarla solo en la carga diaria: fecha, nombre, turno, 11 categorias, observaciones y guardado.

Se retiran de esa pantalla los indicadores y acciones duplicadas como estado de Firebase, cierre de sesion, panel lateral de criticas, historial, filtros y WhatsApp. El historial, filtros y exportaciones se mantienen en su seccion dedicada del menu sin cambios de logica.

## Configurar Firebase

1. Crea un proyecto en Firebase.
2. Activa Firestore Database.
3. Activa Authentication > Sign-in method > Email/Password.
4. En la configuracion del proyecto, crea una app web.
5. Copia los datos de Firebase y reemplaza el objeto `firebaseConfig` en `app.js`.

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

## Crear usuarios y asignar roles

1. En Firebase Console abre Authentication > Users.
2. Crea el usuario con correo electronico y contrasena.
3. Copia el UID generado por Firebase Authentication.
4. En Firestore crea un documento en `roles` con ese UID como ID.
5. Agrega estos campos:

```js
{
  email: "usuario@correo.com",
  name: "Nombre visible",
  role: "user"
}
```

Valores permitidos para `role`:

- `user`
- `supervisor`
- `admin`

Si no existe un documento de rol, la app permite entrar como `Usuario (rol por defecto)`. Para permisos correctos en produccion, crea siempre el documento `roles/{uid}`.

## GitHub Pages

Publica la rama principal desde Settings > Pages. Como es HTML, CSS y JavaScript puro, no necesita npm ni build.

## Reglas Firestore con Authentication

La eliminacion controlada requiere permiso en `registros` y tambien en `deletedLogs`, porque primero se guarda el respaldo y despues se borra el documento original. Pega este bloque en Firebase Console > Firestore Database > Rules:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function userRole() {
      return signedIn()
        && exists(/databases/$(database)/documents/roles/$(request.auth.uid))
        ? get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role
        : "user";
    }

    function isSupervisor() {
      return userRole() in ["supervisor", "admin"];
    }

    function isAdmin() {
      return userRole() == "admin";
    }

    match /registros/{document} {
      allow read, create: if signedIn();
      allow update: if isSupervisor();
      allow delete: if isAdmin();
    }

    match /roles/{document} {
      allow read: if signedIn() && (request.auth.uid == document || isAdmin());
      allow create, update, delete: if isAdmin();
    }

    match /deletedLogs/{document} {
      allow read: if signedIn();
      allow create: if isAdmin()
        && request.resource.data.documentId is string
        && request.resource.data.deletedBy is string
        && request.resource.data.deletedData is map
        && request.resource.data.deletedAt == request.time;
      allow update, delete: if false;
    }
  }
}
```
