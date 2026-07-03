# Evidencias de ejecución - MEDISTOCK

## Comandos ejecutados
```
cd backend
$env:DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb'
npm test
```

## Resumen de salida (Vitest)
- Test files: 13
- Tests: 52 passed, 0 failed

Salida relevante (extracto):

```
 RUN  v1.6.1 C:/.../backend

 ✓ src/modules/products/products.repository.test.ts (7)
 ✓ src/modules/products/products.service.test.ts (7)
 ✓ src/modules/orders/orders.service.test.ts (6)
 ✓ src/modules/users/users.service.test.ts (4)
 ✓ src/modules/auth/auth.service.test.ts (5)
 ✓ src/modules/bank/bank.service.test.ts (3)
 ✓ src/modules/products/products.routes.test.ts (4)
 ✓ src/modules/users/users.routes.test.ts (4)
 ✓ src/modules/bank/bank.routes.test.ts (3)
 ✓ src/modules/auth/auth.routes.test.ts (3)
 ✓ src/modules/exchange/exchange.routes.test.ts (2)
 ✓ src/modules/orders/orders.routes.test.ts (3)
 ✓ src/app.routes.test.ts (1)

 Test Files  13 passed (13)
      Tests  52 passed (52)
```

## Observaciones
- Se añadió un mock del `bankService` en `src/modules/bank/bank.routes.test.ts` para evitar llamadas reales a BD durante la prueba de ruta.
- Si necesita capturas de pantalla o un PDF con estas evidencias, puedo generar los PDFs desde los MD o crear imágenes según prefiera.
