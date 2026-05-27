# Medistock Backend

Este branch `main` contiene solo el backend de Medistock.

## Ejecutar backend

1. cd backend
2. npm install
3. Copia `backend/.env.example` a `backend/.env`
4. Configura `DATABASE_URL` con PostgreSQL y agrega un `JWT_SECRET` válido
5. npm run dev

## Variables de entorno

- `API_PORT`: puerto donde se levanta el backend (por defecto `4000`)
- `APP_URL`: URL del frontend para las redirecciones de Mercado Pago
- `MP_CURRENCY`: moneda por defecto para Mercado Pago (`CLP`)
- `MP_ACCESS_TOKEN`: Access Token de Mercado Pago
- `DATABASE_URL`: conexión a PostgreSQL
- `JWT_SECRET`: secreto para firmar tokens JWT

## Base de datos

- El backend usa PostgreSQL
- El esquema inicial se encuentra en `backend/db/schema.sql`

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
