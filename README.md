# Medistock Backend

Este branch `main` contiene solo el backend de Medistock.

## Arquitectura del backend

El backend está organizado en módulos por dominio, con separación de responsabilidades en:

- `routes`: define los endpoints HTTP y maneja solicitudes/respuestas.
- `service`: contiene la lógica de negocio y validaciones.
- `repository`: encapsula el acceso a las colecciones MongoDB.
- `shared`: agrupa utilidades comunes, tipos, autenticación y conexión a la base de datos.

Los módulos principales son:

- `products`
- `orders`
- `users`
- `bank`
- `mercadopago`
- `exchange`
- `auth`

Esta estructura permite que la lógica de negocio sea reutilizable, testeable y desacoplada de Express.

## Stack tecnológico

- Node.js
- TypeScript
- Express
- MongoDB con el driver oficial de Node.js
- Oracle Database con `node-oracledb` para réplica y procedimientos PL/SQL
- `jsonwebtoken` para JWT
- `bcrypt` para hash de contraseñas
- `swagger-ui-express` para documentación OpenAPI
- SDK de `mercadopago` para pasarela de pago
- API externa de conversión de divisas con `exchangerate.host`

## Ejecutar backend

1. cd backend
2. npm install
3. Copia `.env.example` como `.env`
4. Configura `MONGODB_URI`, `MONGODB_DB_NAME` y un `JWT_SECRET` válido.
5. Antes del primer arranque, configura temporalmente `MONGODB_SCHEMA_URI` con un usuario Atlas que pueda administrar la base `medistock` y ejecuta `npm run db:setup`.
6. (Opcional) En un esquema Oracle nuevo, ejecuta `db/oracle-schema.sql` como script y configura `ORACLE_USER`, `ORACLE_PASSWORD` y `ORACLE_CONNECT_STRING`.
7. Ejecuta `npm run dev`. La cuenta normal de MongoDB solo necesita permisos de lectura/escritura; el usuario Oracle debe poder conectarse, modificar las tablas y ejecutar `MEDISTOCK_SINCRONIZACION`.

## Variables de entorno

- `API_PORT`: puerto donde se levanta el backend (por defecto `4000`)
- `APP_URL`: URL del frontend para las redirecciones de Mercado Pago
- `MP_CURRENCY`: moneda por defecto para Mercado Pago (`CLP`)
- `MP_ACCESS_TOKEN`: Access Token de Mercado Pago
- `MONGODB_URI`: URI de conexión a MongoDB (por defecto `mongodb://127.0.0.1:27017`)
- `MONGODB_DB_NAME`: nombre de la base de datos (por defecto `medistock`)
- `MONGODB_SCHEMA_URI`: URI temporal para `npm run db:setup`; usa un usuario con permisos administrativos solo sobre `medistock` y bórrala después.
- `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING`: credenciales y cadena de conexión Oracle. Si se dejan vacías, el backend continúa usando MongoDB sin réplica Oracle.
- `JWT_SECRET`: secreto para firmar tokens JWT

## Base de datos

- MongoDB es la fuente de verdad de la API. `npm run db:setup` crea o actualiza los validadores `$jsonSchema` de las colecciones, incluido el outbox de sincronización; requiere permisos administrativos de base de datos.
- El backend comprueba que esos validadores estén configurados y prepara los índices al iniciar. La URI administrativa solo se usa para la configuración inicial; no hace falta dejarla en el entorno de ejecución.
- Las colecciones (`users`, `products`, `orders`, `bank_accounts`, `bank_transactions`, `stock_alerts` y `oracle_sync_outbox`) se definen en `backend/src/shared/mongo-schema.ts`.
- Al configurar las tres variables `ORACLE_*`, el backend reemplaza el contenido de las tablas Oracle con una copia inicial de MongoDB y replica las escrituras posteriores mediante un outbox persistente. Los eventos fallidos se conservan y se reintentan; sin esas variables, la API funciona únicamente con MongoDB.
- El esquema Oracle, comentado línea por línea, y el paquete PL/SQL `MEDISTOCK_SINCRONIZACION.APLICAR_CAMBIO` están en `backend/db/oracle-schema.sql`. El script crea las tablas e índices relacionales, y debe ejecutarse una sola vez en un esquema Oracle nuevo antes de habilitar la réplica. MongoDB conserva los artículos y metadatos embebidos; Oracle normaliza las líneas de pedidos en `MED_DETALLE_PEDIDOS`.
- Los usuarios se sincronizan con el hash bcrypt (`HASH_CONTRASENA`), nunca con la contraseña en texto plano.
- Oracle es una réplica de consulta y práctica PL/SQL, no una base de escritura de la API. Sus tablas se reconstruyen al iniciar el backend y sus cambios manuales pueden ser reemplazados por la sincronización.
- La carpeta `backend/db` contiene el esquema MongoDB en `schema.json` y el esquema relacional/paquete PL/SQL en `oracle-schema.sql`; los scripts de configuración están separados en `backend/scripts`.
- Las órdenes guardan sus artículos y metadatos embebidos como documentos.
- Los datos que existían en PostgreSQL no se copian automáticamente; haz una copia de seguridad y migra los registros por separado si necesitas conservarlos.
- El modelo, las relaciones por referencia/embebidas, el trigger de stock bajo y ejemplos de bloques anónimos/ciclos están en [Modelo NoSQL](backend/docs/Modelo_NoSQL.md). El trigger requiere configuración manual en Atlas.
- La configuración Oracle, las tablas, el paquete de sincronización y ejemplos de PL/SQL están en [Guía Oracle y PL/SQL](backend/docs/Oracle.md).

## Informe de cambios y pruebas

La migración de PostgreSQL a MongoDB Atlas, los cambios técnicos y las validaciones están documentados en:

- [Informe de cambios](backend/docs/Presentacion.md)
- [Evidencias de ejecución](backend/docs/Evidencias.md)
- [Plan de pruebas](backend/docs/Plan_de_Pruebas.md)
- [Registro de defectos](backend/docs/Registro_Defectos.csv)

Verificación registrada: compilación TypeScript exitosa y 40 pruebas aprobadas. La réplica Oracle requiere credenciales y una instancia Oracle; su configuración y validación se describen en la [Guía Oracle y PL/SQL](backend/docs/Oracle.md).

## Documentación de la API

- Swagger UI disponible en `http://localhost:4000/api-docs`
- La especificación OpenAPI se encuentra en `backend/src/swagger.json`

## Autenticación JWT

Las rutas de escritura (`POST`, `PUT`, `DELETE`) requieren un token JWT válido.

1. Inicia sesión con `POST /api/v1/auth/login` enviando `{ "email": "...", "password": "..." }`.
2. La respuesta incluye:
   - `token`: JWT de acceso
   - `user`: información básica del usuario
3. Usa el header `Authorization: Bearer <token>` en las solicitudes protegidas.

Ejemplo de cabecera:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints principales

### Autenticación
- POST `/api/v1/auth/register` - Registra un usuario
- POST `/api/v1/auth/login` - Obtiene JWT para usar rutas protegidas

### Productos
- GET `/api/v1/products`
- GET `/api/v1/products/:id`
- POST `/api/v1/products` (protegido)
- PUT `/api/v1/products/:id` (protegido)
- DELETE `/api/v1/products/:id` (protegido)

### Pedidos
- GET `/api/v1/orders`
- GET `/api/v1/orders/:id`
- POST `/api/v1/orders` (protegido)
- PUT `/api/v1/orders/:id` (protegido)
- DELETE `/api/v1/orders/:id` (protegido)

### Usuarios
- GET `/api/v1/users`
- GET `/api/v1/users/:id`
- POST `/api/v1/users` (protegido)
- PUT `/api/v1/users/:id` (protegido)
- DELETE `/api/v1/users/:id` (protegido)

### Banco interno
- POST `/api/v1/bank/process-payment` (protegido)
- GET `/api/v1/bank/balance/:accountId`
- GET `/api/v1/bank/transactions/:accountId`
- POST `/api/v1/bank/deposit` (protegido)

### Pago
- POST `/api/v1/mercadopago/create-preference`

### API externa de moneda
- GET `/api/v1/exchange/convert?from=CLP&to=USD&amount=100`

## Nota

El frontend está en una rama separada llamada `Frontend`, con su propio README. Este backend expone tanto APIs internas como documentación Swagger y un proxy a la API externa de tasas de cambio.