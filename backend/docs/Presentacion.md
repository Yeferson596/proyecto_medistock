# Presentación de entrega - MEDISTOCK

## Slide 1 - Título
MEDISTOCK - Entrega de evaluación

## Slide 2 - Objetivos
- Corregir defectos críticos
- Asegurar integridad stock
- Proteger endpoints sensibles
- Probar y documentar

## Slide 3 - Cambios principales
- `bank` routes: `requireAuth` aplicado
- `orders` service: validación de stock y ajuste en repositorio
- MongoDB como base principal; Oracle opcional como réplica para consultas y prácticas PL/SQL
- Esquema Oracle comentado línea por línea y paquete `MEDISTOCK_SINCRONIZACION`
- Nuevas pruebas unitarias y de rutas

## Slide 4 - Resultado de pruebas
- 40 tests pasados, 0 fallos en la suite actual
- Build TypeScript exitoso
- Comandos para reproducir en `backend` (ver Plan de Pruebas)

La integración Oracle requiere una instancia y credenciales configuradas; no está incluida en las pruebas automatizadas.

## Slide 5 - Próximos pasos
- Generar PDF y capturas para evidencia
- Decidir estrategia de cobertura y aplicar

---
Archivos fuente: [Plan de Pruebas](docs/Plan_de_Pruebas.md), [Registro de Defectos](docs/Registro_Defectos.csv), [Evidencias](docs/Evidencias.md), [Oracle y PL/SQL](docs/Oracle.md), [Modelo NoSQL](docs/Modelo_NoSQL.md)
