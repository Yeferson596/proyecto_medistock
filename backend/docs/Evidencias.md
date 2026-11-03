# Evidencias de ejecución - MEDISTOCK

## Entorno
- Node.js y npm
- MongoDB Atlas
- Base configurada: `medistock`

## Comandos ejecutados
Desde la carpeta `backend`:

```
npm run build
npm test
npm run dev
```

## Resultados
- `npm run build`: compilación TypeScript exitosa.
- `npm test`: 13 archivos de prueba y 40 pruebas aprobadas; 0 fallidas.
- La conexión a MongoDB Atlas y el health check de la API se verificaron antes de añadir la comprobación obligatoria de validadores.
- Atlas Data Explorer mostró la base `medistock` y las colecciones `bank_accounts`, `bank_transactions`, `orders`, `products` y `users`.
- La cuenta de aplicación `readWrite` no tiene permiso `collMod`; el setup de validadores se separó a `npm run db:setup`, que requiere una URI administrativa temporal.
- Tras ejecutar `npm run db:setup`, el servidor verifica los validadores y prepara los índices; `stock_alerts` se crea para las alertas automatizadas.
- Las colecciones no contenían documentos durante la verificación; la aplicación no carga datos de demostración automáticamente.
- No se ejecutó una validación de la réplica Oracle: no forma parte de las pruebas registradas para MongoDB y requiere una instancia Oracle y credenciales configuradas.

## Verificación manual
El endpoint `GET /health` respondió con el estado de la API en la verificación previa. La versión actual exige ejecutar primero `npm run db:setup`; el primer intento de aplicar validadores con la cuenta de aplicación fue rechazado por Atlas porque carece del permiso `collMod`.

El trigger de stock bajo se entrega como función de Atlas, pero requiere crearse y habilitarse manualmente desde Atlas. La prueba del trigger queda pendiente hasta completar esa configuración; ver `Modelo_NoSQL.md`. La ejecución del setup administrativo contra Atlas también queda pendiente de una URI con permiso `collMod`.

## Nota de migración
Los registros de PostgreSQL no se copian automáticamente a MongoDB. Para conservarlos, se requiere una exportación y migración de datos independiente.
