# Oracle y PL/SQL

MongoDB es la fuente principal de datos de la API. Oracle mantiene una réplica para consultas y ejercicios de programación de bases de datos. No escribas datos de negocio directamente en Oracle: el backend reemplaza sus tablas con los datos de MongoDB al iniciar y las escrituras posteriores también pueden sobrescribir cambios manuales.

## Contenido del esquema SQL

El archivo [`../db/oracle-schema.sql`](../db/oracle-schema.sql) contiene el DDL y el paquete de sincronización PL/SQL. Las instrucciones SQL y PL/SQL tienen comentarios en español línea por línea; los valores de estado y nombres de entidades que llegan desde MongoDB conservan sus identificadores originales para que la integración funcione.

El archivo crea estas tablas:

- `MED_PRODUCTOS`: catálogo, precios y existencias.
- `MED_USUARIOS`: usuarios, roles y hash bcrypt de contraseña.
- `MED_PEDIDOS`: encabezados de pedidos.
- `MED_DETALLE_PEDIDOS`: artículos normalizados por pedido.
- `MED_CUENTAS_BANCARIAS`: cuentas y saldos.
- `MED_TRANSACCIONES_BANCARIAS`: movimientos de cuentas.
- `MED_ALERTAS_STOCK`: alertas existentes en MongoDB.

También crea índices para consultas de pedidos por cliente/fecha y transacciones por cuenta/fecha. El paquete `MEDISTOCK_SINCRONIZACION`, con el procedimiento `APLICAR_CAMBIO`, aplica inserciones, actualizaciones y eliminaciones recibidas como JSON.

Las referencias de clientes y productos se mantienen como identificadores, como en el modelo de MongoDB; no se crean claves foráneas para esas referencias. El detalle de pedidos sí se relaciona con `MED_PEDIDOS`.

## Configuración

1. Instala y configura MongoDB según las instrucciones del README principal. Para el `db:setup`, usa temporalmente `MONGODB_SCHEMA_URI` con permisos para configurar los validadores.
2. Conéctate a Oracle como el propietario del esquema. El usuario necesita poder crear tablas, índices y paquetes PL/SQL.
3. Ejecuta `backend/db/oracle-schema.sql` **una sola vez y en un esquema nuevo**. En Oracle SQL Developer usa **Run Script (F5)**, no ejecutar solo la sentencia actual, para que se procesen los separadores `/` de los paquetes. Desde SQLcl/SQL*Plus también se puede ejecutar con `@ruta/al/oracle-schema.sql`.
4. Copia `backend/.env.example` a `backend/.env` y completa `ORACLE_USER`, `ORACLE_PASSWORD` y `ORACLE_CONNECT_STRING`. Ejemplo de cadena de conexión: `localhost:1521/FREEPDB1`.
5. Inicia el backend desde `backend` con `npm run dev`.

El script de Oracle no carga datos de demostración. No lo ejecutes de nuevo sobre tablas ya creadas: los `CREATE TABLE` e índices existentes producirán errores. Para recrear un esquema, realiza primero una copia de seguridad y elimina solo los objetos correspondientes mediante Oracle.

Si las tres variables `ORACLE_*` están vacías, la réplica Oracle queda desactivada y el backend funciona con MongoDB. Si solo se configura parte de las credenciales, el backend informa un error de configuración al iniciar.

## Funcionamiento de la réplica

- Al iniciar, el backend elimina las filas existentes de las tablas de réplica en una transacción y vuelve a cargar los documentos actuales de MongoDB.
- Las escrituras de productos, usuarios, pedidos y banco generan eventos en `oracle_sync_outbox`, una colección de MongoDB. El proceso revisa el outbox periódicamente y aplica hasta 100 eventos por ciclo.
- Un evento se elimina del outbox después de confirmarse en Oracle. Si falla, queda pendiente y se registra el error para reintentar en el ciclo siguiente.
- La sincronización es unidireccional: MongoDB → Oracle. No hay sincronización de cambios manuales de Oracle hacia MongoDB.
- Las contraseñas nunca se replican en texto plano. `MED_USUARIOS.HASH_CONTRASENA` contiene el hash bcrypt.
- Las alertas Oracle reflejan los documentos de `stock_alerts` de MongoDB; el esquema no crea un trigger Oracle que genere alertas automáticamente.

## Consultas de ejemplo

Productos que necesitan reposición:

```sql
SELECT ID_PRODUCTO, SKU, NOMBRE, STOCK, STOCK_MINIMO
FROM MED_PRODUCTOS
WHERE STOCK <= STOCK_MINIMO
ORDER BY STOCK;
```

Bloque PL/SQL que recorre los productos bajo el mínimo y muestra el total:

```sql
SET SERVEROUTPUT ON;

DECLARE
  V_TOTAL PLS_INTEGER := 0;
BEGIN
  FOR PRODUCTO IN (
    SELECT SKU, NOMBRE, STOCK, STOCK_MINIMO
    FROM MED_PRODUCTOS
    WHERE STOCK <= STOCK_MINIMO
    ORDER BY STOCK
  ) LOOP
    DBMS_OUTPUT.PUT_LINE(
      PRODUCTO.SKU || ' - ' || PRODUCTO.NOMBRE ||
      ': stock=' || PRODUCTO.STOCK ||
      ', mínimo=' || PRODUCTO.STOCK_MINIMO
    );
    V_TOTAL := V_TOTAL + 1;
  END LOOP;

  DBMS_OUTPUT.PUT_LINE('Productos bajo mínimo: ' || V_TOTAL);
END;
/
```

Totales de pedidos agrupados por tipo:

```sql
SELECT TIPO_PEDIDO, COUNT(*) AS CANTIDAD, SUM(TOTAL) AS TOTAL_VENDIDO
FROM MED_PEDIDOS
GROUP BY TIPO_PEDIDO
ORDER BY TIPO_PEDIDO;
```

## Validación

La compilación TypeScript y las pruebas unitarias del backend no requieren una instancia Oracle. Para validar la integración completa se necesita ejecutar el esquema en Oracle, configurar las variables `ORACLE_*`, iniciar con MongoDB disponible y comprobar que las tablas Oracle reciben la copia y las escrituras nuevas. La prueba contra Oracle debe registrarse por separado; no se considera validada solo porque pasen las pruebas unitarias.
