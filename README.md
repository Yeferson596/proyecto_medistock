# Medistock Frontend

Este branch contiene el frontend de Medistock, construido como una aplicación React con TypeScript usando Vite.

## Arquitectura del frontend

El frontend está organizado en capas claras:

- `frontend/src/services`: capa de acceso a API. Todos los requests pasan por `frontend/src/services/http.ts`.
- `frontend/src/store`: estado global con `zustand` para usuario, carrito, productos, pedidos y notificaciones.
- `frontend/src/modules`: páginas y flujos de negocio, incluyendo catálogo, checkout, administración y simulación de pago.
- `frontend/src/components`: componentes reutilizables de UI y experiencias específicas como el pago bancario.
- `frontend/src/types`: tipos compartidos de la API y entidades del dominio.

El frontend no accede directamente a la base de datos; todas las interacciones se hacen mediante la API REST del backend.

## Stack tecnológico

- React
- TypeScript
- Vite
- Zustand
- Tailwind / CSS moderno
- MercadoPago para checkout real
- API interna de simulación bancaria
- API externa de conversión de divisas a través del backend

## Ejecutar frontend

1. cd frontend
2. npm install
3. Copia `.env.example` a `.env.local` si necesitas configurar la URL de la API
4. Ajusta `VITE_API_URL` en `.env.local` si el backend no corre en `http://localhost:4000/api/v1`
5. npm run dev

## Variables de entorno del frontend

- `VITE_API_URL`: URL base de la API, por ejemplo `http://localhost:4000/api/v1`

## Dependencia del backend

Para funcionar correctamente, este frontend requiere el backend en otra rama o carpeta:

1. cd ../proyecto_medistock-main/backend
2. npm install
3. Copia `backend/.env.example` a `backend/.env`
4. Configura `DATABASE_URL`, `JWT_SECRET`, `MP_ACCESS_TOKEN` y `APP_URL`
5. npm run dev

## Endpoints usados

### Autenticación
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`

### Productos
- GET `/api/v1/products`
- GET `/api/v1/products/:id`
- POST `/api/v1/products`
- PUT `/api/v1/products/:id`
- DELETE `/api/v1/products/:id`

### Pedidos
- GET `/api/v1/orders`
- GET `/api/v1/orders/:id`
- POST `/api/v1/orders`
- PUT `/api/v1/orders/:id`
- DELETE `/api/v1/orders/:id`

### Usuarios
- GET `/api/v1/users`
- GET `/api/v1/users/:id`
- POST `/api/v1/users`
- PUT `/api/v1/users/:id`
- DELETE `/api/v1/users/:id`

### Banco interno
- POST `/api/v1/bank/process-payment`
- GET `/api/v1/bank/balance/:accountId`
- GET `/api/v1/bank/transactions/:accountId`
- POST `/api/v1/bank/deposit`

### Mercado Pago
- POST `/api/v1/mercadopago/create-preference`

### Conversión de divisas
- GET `/api/v1/exchange/convert?from=CLP&to=USD&amount=100`

## Notas

- Swagger UI del backend disponible en `http://localhost:4000/api-docs`
- Las rutas de escritura del backend requieren JWT en el header `Authorization: Bearer <token>`.
