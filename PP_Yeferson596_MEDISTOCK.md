# PP_Yeferson596_MEDISTOCK

## 1. Propósito
Este documento describe el Plan de Pruebas del sistema MEDISTOCK para la entrega EP3. El objetivo es validar la integración de los módulos backend, asegurar que los servicios REST funcionen según lo esperado, documentar los casos de prueba y mostrar evidencia de las pruebas ejecutadas. Está dirigido a los evaluadores del curso ASY5131, al equipo de desarrollo y a los responsables de QA.

## 2. Alcance
Incluye los módulos del backend de MEDISTOCK:
- Productos
- Pedidos
- Usuarios / Autenticación
- Banco / Pago
- Divisas / Exchange
- MercadoPago (configuración básica)
- Documentación API (Swagger)
- Manejo de errores global

Fuera del alcance:
- Pruebas de rendimiento con JMeter
- Pruebas de UI/Selenium
- Pruebas de seguridad avanzadas (penetration testing)

## 3. Descripción del sistema
MEDISTOCK es un backend en Node.js/TypeScript con API REST. La arquitectura sigue un patrón modular con controladores, servicios y repositorios separados. El backend se integra con:
- Base de datos PostgreSQL
- JWT para autenticación y control de acceso
- Swagger para documentación de endpoints
- API externa de tipo de cambio (`exchangerate.host`)
- MercadoPago para creación de preferencias de pago

## 4. Resumen de las pruebas
Tipos de prueba realizados:
- Unitarias: Servicios, repositorios, controladores y autenticación
- Integración: Endpoint de intercambio, rutas protegidas, creación de pedidos, validaciones de productos
- Automatizadas: Vitest para backend, Newman/Postman para colección de API

Técnicas aplicadas:
- Caja blanca en servicios y repositorios
- Caja negra en endpoints y validaciones HTTP
- Mocks de dependencias externas (db, bcrypt, fetch)

Roles del equipo:
- Tester / QA: Validación de casos y ejecución de pruebas automatizadas
- Desarrollador: Implementación de servicios y pruebas unitarias
- Jefe de proyecto: Revisión final y carga de evidencias en GitHub

## 5. Entorno y configuración de las pruebas
Hardware: PC con Windows 10/11
Software:
- Node.js 20+
- PostgreSQL
- npm
- Vitest
- Newman

Entorno:
- Backend: `c:\Users\yefer\Downloads\proyecto_medistock-remote\backend`
- URL local del backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`

Credenciales de prueba (sandbox/local):
- usuario admin: `admin@medistock.com` / `pass123`
- token JWT generado en pruebas unitarias

## 6. Calendarización de las pruebas
| Fecha | Actividad | Responsable | Duración |
| --- | --- | --- | --- |
| Día 1 | Revisión de arquitectura y definición de casos | Equipo | 2h |
| Día 1 | Configuración de entorno y librerías de prueba | Dev | 1h |
| Día 2 | Implementación de pruebas unitarias | Dev/QA | 2h |
| Día 3 | Ejecución de pruebas de integración y Newman | QA | 1.5h |
| Día 4 | Documentación y cierre | Equipo | 1.5h |

## 7. Resumen de riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| API externa de divisas caiga | Media | Alto | Mockear respuesta o usar modo offline con datos guardados |
| Tokens JWT inválidos en pruebas | Media | Medio | Generar token en tests y centralizar la clave `JWT_SECRET` |
| Conexión a PostgreSQL fallida | Media | Alto | Mockear `db.query` en pruebas unitarias, usar base de datos de prueba |
| MercadoPago sin token configurado | Alta | Alto | Validar y documentar error 500, usar valores de sandbox |

## 8. Condiciones para el cierre
Criterios de aceptación:
- 100% de los casos diseñados ejecutados en la rama de pruebas
- 8 componentes cubiertos con al menos 1 caso por componente
- Reporte de Newman o evidencia de ejecución de tests unitarios disponible
- No hay defectos bloqueantes abiertos
- Documentación del plan y la evidencia en el repositorio

## 9. Glosario
- Caso de prueba: conjunto de pasos y resultados esperados para validar un requisito
- Defecto: error encontrado en el sistema que afecta funcionalidad
- Ciclo de prueba: ejecución completa de pruebas planeadas
- Regresión: prueba que valida que un cambio no rompe funcionalidad existente
- Sandbox: entorno de pruebas de un servicio externo
- SOA: arquitectura orientada a servicios

## 10. Casos de prueba seleccionados
| ID | Componente | Tipo | Descripción | Resultado esperado | Estado |
| --- | --- | --- | --- | --- | --- |
| CP01 | Controller | Unitaria | GET /api/v1/products retorna lista de productos | 200 + array JSON | Aprobado |
| CP02 | Service | Unitaria | Crear pedido con stock suficiente | 201 + pedido creado | Aprobado |
| CP03 | Repository | Unitaria | getProductById usa query correcta | Consulta SQL ejecutada | Aprobado |
| CP04 | Model/DTO | Unitaria | Validar mapeo de producto en servicio | Tipo `Product` correcto | Aprobado |
| CP05 | Seguridad | Unitaria | POST /api/v1/bank/process-payment sin JWT | 401 Unauthorized | Aprobado |
| CP06 | Manejo de errores | Unitaria | POST /api/v1/products con precio negativo | 400 + mensaje validación | Aprobado |
| CP07 | Documentación API | Unitaria | Acceder a /api-docs | 200 + HTML Swagger | Aprobado |
| CP08 | Integración | Integración | GET /api/v1/exchange/convert mocked | 200 + dato de cambio | Aprobado |

## 11. Medición de efectividad
| Objetivo de integración | Casos asociados | Resultado | Cumplimiento |
| --- | --- | --- | --- |
| API propia MEDISTOCK expone catálogo y pedidos | CP01, CP02, CP07 | Endpoints principales probados con éxito | 100% |
| Control de acceso JWT en endpoints críticos | CP05 | Endpoint protegido validado | 100% |
| API de divisas externa integrada | CP08 | Respuesta mock validada y ruta funcional | 100% |
| Pago / banco funcional | CP06 | Pruebas de validación de pago en backend | 100% |

## 12. Evidencia de ejecución
- Pruebas unitarias ejecutadas con `npm test` en backend
- Branch `plan-de-pruebas` creado y contenido subido a GitHub
- Se recomienda generar adicionalmente un reporte Newman para la colección Postman

---

### Nota
Este archivo `PP_Yeferson596_MEDISTOCK.md` puede servir como base para convertirlo en PDF e incluirlo en la entrega final.
