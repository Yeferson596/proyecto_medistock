# Resumen de cambios en Swagger

- Se añadió `components.securitySchemes.bearerAuth` para JWT.
- Se marcó seguridad (`security`) en endpoints bancarios sensibles como `/bank/balance` y `/bank/transactions`.
- Actualizar `swagger.json` ya en repo con `bearerAuth` y ejemplos de respuesta 401.

Revisar: `src/swagger.json` para detalles y ejemplos de seguridad.
