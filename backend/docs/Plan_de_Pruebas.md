# Plan de Pruebas - MEDISTOCK

## 1. Propósito
Validar funcionalidad, seguridad e integridad de la API backend según criterios del examen.

## 2. Alcance
- Endpoints: auth, users, products, orders, bank, exchange
- Casos críticos: validación de stock, acceso a /bank/balance, creación/actualización de pedidos

## 3. Descripción del sistema
Node.js + TypeScript, Express, Postgres (via `pg`), JWT auth, servicios organizados por módulos.

## 4. Resumen de pruebas
- Unitarias: servicios y repositorios (Vitest)
- Integración: rutas con `supertest` (autenticación y flujos principales)
- Seguridad: endpoints protegidos (`requireAuth`) y validaciones de entrada

## 5. Entorno de pruebas
- Requisitos: Node 18+, npm
- Variables de entorno: `DATABASE_URL` (puede ser dummy para tests unitarios)
- Comandos principales:
```
cd backend
npm install
$env:DATABASE_URL = 'postgres://user:pass@localhost:5432/testdb'
npm test
```

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