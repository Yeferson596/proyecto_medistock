# Medistock Backend

Este branch main contiene solo el backend de Medistock.

## Ejecutar backend

1. cd backend
2. npm install
3. Copia ackend/.env.example a ackend/.env
4. Configura DATABASE_URL con PostgreSQL
5. npm run dev

## Base de datos

- El backend usa PostgreSQL
- El esquema inicial se encuentra en ackend/db/schema.sql

## Endpoints principales

- GET /api/v1/products
- GET /api/v1/products/:id
- POST /api/v1/products
- PUT /api/v1/products/:id
- DELETE /api/v1/products/:id

- GET /api/v1/orders
- GET /api/v1/orders/:id
- POST /api/v1/orders
- PUT /api/v1/orders/:id
- DELETE /api/v1/orders/:id

- GET /api/v1/users
- GET /api/v1/users/:id
- POST /api/v1/users
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id

- POST /api/v1/bank/process-payment
- GET /api/v1/bank/balance/:accountId
- GET /api/v1/bank/transactions/:accountId
- POST /api/v1/bank/deposit

- POST /api/v1/mercadopago/create-preference

## Nota

El frontend se mantiene en una rama separada llamada rontend, con su propio README.
