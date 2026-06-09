# Medistock Frontend

Este branch contiene solo el frontend de Medistock.

## Arquitectura del frontend

El frontend está construido con React y TypeScript usando Vite. La aplicación sigue una arquitectura basada en:

- `services`: capa de acceso a API que centraliza las llamadas HTTP en `frontend/src/services/http.ts`.
- `store`: estado global manejado con `zustand`, incluyendo usuario, carrito y datos cargados.
- `components`: interfaz de usuario organizada por dominio y por página.
- `modules`: páginas principales y flujos de negocio como catálogo, checkout y panel de administración.

El frontend no accede directamente a la base de datos; todas las llamadas van al backend a través de `VITE_API_URL`.

## Stack tecnológico

- React
- TypeScript
- Vite
- Zustand
- Tailwind / estilos CSS (usados en componentes)
- MercadoPago para checkout real
- API de banco interno para simulación de pagos

## Ejecutar frontend

1. cd frontend
2. npm install
3. Copia `.env.example` a `.env.local` si necesitas configurar la URL de la API
4. Ajusta `VITE_API_URL` en `.env.local` si el backend no corre en `http://localhost:4000/api/v1`
5. npm run dev

Si estás en PowerShell, instala dependencias desde esta carpeta con:

```powershell
Set-Location 'C:\Users\yefer\Downloads\proyecto_medistock-frontend\frontend'
npm install
```

## Configuración del backend requerida

El frontend depende de un backend separado. Para levantarlo:

1. cd ../proyecto_medistock-main/backend
2. npm install
3. Copia `backend/.env.example` a `backend/.env`
4. Configura `DATABASE_URL`, `JWT_SECRET`, `MP_ACCESS_TOKEN` y `APP_URL`
5. npm run dev

El backend expone la API en `http://localhost:4000/api/v1` por defecto.

## Variables de entorno del frontend

- `VITE_API_URL`: URL base de la API, por ejemplo `http://localhost:4000/api/v1`

## Especificación de la API

### Autenticación
- POST `/api/v1/auth/register`
  - Body:
    ```json
    {
      "name": "Nombre",
      "email": "admin@medistock.com",
      "password": "secreto123",
      "role": "admin",
      "institution": "Medistock"
    }
    ```
  - Respuestas:
    - `201`: usuario creado
    - `400`: datos inválidos

- POST `/api/v1/auth/login`
  - Body:
    ```json
    {
      "email": "admin@medistock.com",
      "password": "secreto123"
    }
    ```
  - Respuestas:
    - `200`: `{ "token": "...", "user": { ... } }`
    - `401`: credenciales inválidas

### Productos
- GET `/api/v1/products`
  - Respuesta: lista de productos

- GET `/api/v1/products/:id`
  - Respuesta: producto individual o `404`

- POST `/api/v1/products` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "name": "Mascarilla Quirúrgica",
      "sku": "MSK-001",
      "price": 4990,
      "category": "Insumos Clínicos",
      "stock": 500,
      "minStock": 100,
      "description": "Caja de 50 unidades",
      "image": "https://..."
    }
    ```
  - Respuesta: `201` con producto creado

- PUT `/api/v1/products/:id` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body: cualquier campo a actualizar
  - Respuesta: producto actualizado o `404`

- DELETE `/api/v1/products/:id` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Respuesta: producto eliminado o `404`

### Pedidos
- GET `/api/v1/orders`
  - Respuesta: lista de pedidos

- GET `/api/v1/orders/:id`
  - Respuesta: pedido individual o `404`

- POST `/api/v1/orders` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "customerId": "u-12345",
      "items": [
        { "productId": "p-12345", "quantity": 2, "price": 8500 }
      ],
      "status": "pending",
      "type": "B2C",
      "metadata": { "paymentMethod": "mercadopago" }
    }
    ```
  - Respuesta: `201` con pedido creado

- PUT `/api/v1/orders/:id` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body: campos a actualizar
  - Respuesta: pedido actualizado o `404`

- DELETE `/api/v1/orders/:id` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Respuesta: pedido eliminado o `404`

### Usuarios
- GET `/api/v1/users`
  - Respuesta: lista de usuarios

- GET `/api/v1/users/:id`
  - Respuesta: usuario individual o `404`

- POST `/api/v1/users` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "name": "Operador",
      "email": "operador@medistock.com",
      "password": "secreto123",
      "role": "operator",
      "institution": "Medistock"
    }
    ```
  - Respuesta: `201` con usuario creado

- PUT `/api/v1/users/:id` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body: campos a actualizar

- DELETE `/api/v1/users/:id` (protegido)
  - Header: `Authorization: Bearer <token>`

### Banco interno
- POST `/api/v1/bank/process-payment` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "accountId": "ACC-001",
      "amount": 12000,
      "description": "Pago de compra"
    }
    ```

- GET `/api/v1/bank/balance/:accountId`
  - Respuesta: balance actual

- GET `/api/v1/bank/transactions/:accountId`
  - Query opcional: `limit`

- POST `/api/v1/bank/deposit` (protegido)
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "accountId": "ACC-001",
      "amount": 5000
    }
    ```

### Mercado Pago
- POST `/api/v1/mercadopago/create-preference`
  - Body:
    ```json
    {
      "items": [
        {
          "title": "Producto Médico",
          "unit_price": 8500,
          "quantity": 1,
          "currency_id": "CLP"
        }
      ],
      "external_reference": "ORDER-123"
    }
    ```

### API externa de conversión de divisas
- GET `/api/v1/exchange/convert?from=CLP&to=USD&amount=100`
  - Respuesta: tasa de cambio y monto convertido

## Notas

- Swagger UI disponible en `http://localhost:4000/api-docs`
- El backend requiere JWT para rutas de escritura: usa `Authorization: Bearer <token>` en los requests protegidos
- El frontend nunca accede directamente a la base de datos; todas las llamadas van al backend a través de `VITE_API_URL`
