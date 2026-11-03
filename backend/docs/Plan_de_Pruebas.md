# Plan de Pruebas - MEDISTOCK

## 1. Propósito
Validar funcionalidad, seguridad e integridad de la API backend según criterios del examen.

## 2. Alcance
- Endpoints: auth, users, products, orders, bank, exchange
- Casos críticos: validación de stock, acceso a /bank/balance, creación/actualización de pedidos

## 3. Descripción del sistema
Node.js + TypeScript, Express, MongoDB como base principal, réplica Oracle opcional, autenticación JWT y servicios organizados por módulos.

## 4. Resumen de pruebas
- Unitarias: servicios y repositorios (Vitest)
- Integración: rutas con `supertest` (autenticación y flujos principales)
- Seguridad: endpoints protegidos (`requireAuth`) y validaciones de entrada

## 5. Entorno de pruebas
- Requisitos: Node 18+, npm y MongoDB para ejecutar el servidor. Oracle solo es necesario para validar la réplica.
- Variables de entorno: `MONGODB_URI` y `MONGODB_DB_NAME`; configura `ORACLE_USER`, `ORACLE_PASSWORD` y `ORACLE_CONNECT_STRING` solo al validar Oracle. Las pruebas unitarias no requieren conexiones reales a las bases de datos.
- Comandos principales:
```
cd backend
npm install
npm test
```

### Comprobación manual opcional de Oracle

1. Ejecuta `db/oracle-schema.sql` una sola vez en un esquema Oracle nuevo.
2. Configura las tres variables `ORACLE_*` e inicia el backend con MongoDB disponible.
3. Comprueba que se copien los datos iniciales a Oracle y que una escritura posterior de la API también se replique.
4. Comprueba que un fallo temporal de Oracle deje eventos pendientes en `oracle_sync_outbox` y que se procesen al recuperar la conexión.

Esta comprobación requiere Oracle configurado y no forma parte de las 40 pruebas automatizadas.

## 6. Plan y calendario
- Desarrollo y fixes: ya realizados (ver registro de commits)
- Ejecución de tests: inmediata, local

## 7. Riesgos
- Cobertura: `--coverage` fue retirado por conflicto con el proveedor de coverage; decisión pendiente.
- Dependencias nativas o integraciones externas (MercadoPago, exchangerate.host) deben simularse en tests.

## 8. Criterios de salida
- Todos los tests pasan (Vitest)
- Defectos críticos corregidos y registrados

## 9. Glosario
- CP-xx: Caso de prueba numerado
- API: Interfaz de backend

---

Archivo generado automáticamente como artefacto para la evaluación.
