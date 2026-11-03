# Modelo y programación NoSQL - MEDISTOCK

## 1. Conceptos equivalentes en MongoDB

MongoDB no implementa tablas, claves foráneas ni bloques PL/SQL. En este proyecto se usan sus equivalentes:

| Concepto relacional / SQL | Equivalente utilizado |
|---|---|
| Base de datos | Base `medistock` |
| Tabla | Colección MongoDB |
| Fila | Documento BSON |
| Restricción `CHECK` / tipo | Validador `$jsonSchema` |
| `PRIMARY KEY` / `UNIQUE` | Índice único |
| Clave foránea | Referencia por ID o documento embebido; se valida en la lógica de la aplicación |
| Trigger | MongoDB Atlas Database Trigger (configuración en Atlas) |
| Bloque anónimo | Script JavaScript ejecutado con `mongosh` |
| Ciclo `FOR` / `WHILE` | `for...of`, `for await...of` o cursor en JavaScript |
| Consulta con relaciones | Aggregation Pipeline con `$lookup`, cuando se necesita |

## 2. Colecciones y esquema

La definición documentada por colección está en `db/schema.json`; la implementación tipada usada por la aplicación está en `src/shared/mongo-schema.ts`. Se aplican con `npm run db:setup`. Para colecciones existentes se actualizan con `collMod`; para las nuevas se crean con el validador configurado. Esta operación necesita un usuario con permisos administrativos en esa base. El usuario normal de la API no necesita esos permisos: al arrancar, el backend comprueba que el setup se haya ejecutado y crea los índices de acceso.

Configura `MONGODB_SCHEMA_URI` temporalmente en `backend/.env` con la URI de un usuario Atlas que tenga el rol `dbAdmin` limitado a la base `medistock`, y ejecuta desde `backend`:

```powershell
npm run db:setup
```

Cuando termine correctamente, borra `MONGODB_SCHEMA_URI` del `.env` y elimina el usuario temporal de Atlas. No otorgues permisos de administración a la cuenta normal usada por el servidor.

| Colección | Documento y campos principales | Índices |
|---|---|---|
| `products` | `id`, `name`, `sku`, `description`, `price`, `category`, `stock`, `minStock`, `image` | `id` único, `sku` único |
| `users` | `id`, `name`, `email`, `role`, `institution?`, `password?` (hash) | `id` único, `email` único |
| `orders` | `id`, `customerId`, `items[]`, `status`, `total`, `createdAt`, `type`, `metadata?` | `id` único, `customerId` + `createdAt` |
| `bank_accounts` | `accountId`, `balance`, `currency` | `accountId` único |
| `bank_transactions` | `id`, `accountId`, `type`, `amount`, `description`, `timestamp`, `status` | `id` único, `accountId` + `timestamp` |
| `stock_alerts` | `productId`, `sku`, `productName`, `stock`, `minStock`, `status`, `createdAt`, `updatedAt` | Un alerta abierto por producto |

Los artículos de una orden se embeben en el mismo documento con precio y cantidad de compra. Esto conserva una instantánea del precio aunque el precio actual del producto cambie.

## 3. Relaciones

MongoDB no aplica claves foráneas. Las referencias usadas por la aplicación son:

- `orders.customerId` → `users.id`.
- `orders.items[].productId` → `products.id`; cada artículo también guarda el precio de la compra.
- `bank_transactions.accountId` → `bank_accounts.accountId`.
- `stock_alerts.productId` → `products.id`.

El servicio comprueba que los productos de una orden existan y tengan stock. Estas relaciones lógicas no impiden borrar un documento referenciado; esa regla debe aplicarse desde el servicio si el negocio la requiere.

## 4. Trigger de inventario bajo

El archivo `scripts/atlas-low-stock-trigger.js` contiene una función de Atlas Database Trigger. Cuando se inserta o modifica un producto:

1. Si `stock <= minStock`, crea o actualiza un alerta abierto en `stock_alerts`.
2. Si el stock vuelve a superar el mínimo, marca como resueltos los alertas abiertos.

Para configurarlo en Atlas:

1. En App Services / Triggers, crea un **Database Trigger** para el clúster conectado a esta base.
2. Selecciona la base `medistock`, colección `products`, eventos `Insert` y `Update`.
3. En actualizaciones, habilita **Full Document: Update Lookup**.
4. Copia el contenido de `scripts/atlas-low-stock-trigger.js` como función del trigger.
5. Verifica que el servicio de MongoDB asociado se llame `mongodb-atlas`, o cambia ese nombre en la función por el nombre que muestra Atlas.
6. Prueba creando o actualizando un producto con `stock` menor o igual a `minStock`.

El trigger solo escucha `products`, no `stock_alerts`; por eso las escrituras de alertas no lo vuelven a invocar.

## 5. Bloque anónimo y ciclo

`scripts/anonymous-blocks.js` es un ejemplo opcional de script JavaScript para `mongosh`. Usa una función anónima asíncrona, un ciclo `for...of` para insertar productos de demostración sin duplicarlos y `for await...of` para recorrer el cursor de productos con stock bajo.

Desde la carpeta `backend`, ejecútalo conectando `mongosh` a la base `medistock`:

```powershell
mongosh "mongodb+srv://<USUARIO>:<CONTRASENA>@<CLUSTER>.mongodb.net/medistock/?retryWrites=true&w=majority" scripts/anonymous-blocks.js
```

Reemplaza los marcadores por los valores de Atlas y no guardes credenciales en el repositorio. Codifica los caracteres especiales de la contraseña para la URL. Este script crea dos productos `DEMO-*`; úsalo solo si quieres cargar esos datos de muestra. No se ejecuta al arrancar la API.

## 6. Inicialización automática

La carpeta `db/` contiene únicamente `schema.json`, el esquema documental. Los scripts ejecutables se guardan en `scripts/`. `npm run db:setup` prepara las colecciones y validadores. Luego `src/shared/db.ts` comprueba que los validadores estén instalados y prepara los índices al iniciar el backend. El servidor solo comienza a escuchar solicitudes después de esas comprobaciones. Las reglas del trigger Atlas se configuran aparte desde la consola Atlas.
