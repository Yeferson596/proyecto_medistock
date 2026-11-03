-- Tabla principal de inventario y catálogo de productos.
CREATE TABLE MED_PRODUCTOS ( -- Crea la tabla donde se almacenan los productos.
  ID_PRODUCTO VARCHAR2(100) PRIMARY KEY, -- Identificador único del producto.
  NOMBRE VARCHAR2(255) NOT NULL, -- Nombre visible y obligatorio.
  SKU VARCHAR2(100) NOT NULL UNIQUE, -- Código SKU obligatorio y sin duplicados.
  DESCRIPCION VARCHAR2(4000) NOT NULL, -- Descripción textual del producto.
  PRECIO NUMBER(18, 2) DEFAULT 0 NOT NULL CHECK (PRECIO >= 0), -- Precio con dos decimales y no negativo.
  CATEGORIA VARCHAR2(255) NOT NULL, -- Categoría comercial del producto.
  STOCK NUMBER(18, 2) DEFAULT 0 NOT NULL CHECK (STOCK >= 0), -- Cantidad disponible, no negativa.
  STOCK_MINIMO NUMBER(18, 2) DEFAULT 0 NOT NULL CHECK (STOCK_MINIMO >= 0), -- Umbral para alertas de reposición.
  IMAGEN VARCHAR2(1000) NOT NULL -- URL de la imagen del producto.
); -- Finaliza la definición de productos.

-- Tabla de usuarios y datos usados por autenticación y permisos.
CREATE TABLE MED_USUARIOS ( -- Crea la tabla de usuarios.
  ID_USUARIO VARCHAR2(100) PRIMARY KEY, -- Identificador único del usuario.
  NOMBRE VARCHAR2(255) NOT NULL, -- Nombre completo obligatorio.
  CORREO VARCHAR2(320) NOT NULL UNIQUE, -- Correo obligatorio y único.
  ROL VARCHAR2(30) NOT NULL CHECK (ROL IN ('admin', 'operator', 'b2b_client', 'customer')), -- Limita el rol a los valores admitidos por la aplicación.
  INSTITUCION VARCHAR2(255), -- Institución asociada, opcional.
  HASH_CONTRASENA VARCHAR2(255) -- Hash bcrypt; nunca se almacena la contraseña en texto plano.
); -- Finaliza la definición de usuarios.

-- Tabla de pedidos realizados por los clientes.
CREATE TABLE MED_PEDIDOS ( -- Crea la tabla principal de pedidos.
  ID_PEDIDO VARCHAR2(100) PRIMARY KEY, -- Identificador único del pedido.
  ID_CLIENTE VARCHAR2(100) NOT NULL, -- Identificador del cliente que hizo el pedido.
  ESTADO VARCHAR2(30) NOT NULL CHECK (ESTADO IN ('pending', 'paid', 'processing', 'preparing', 'shipped', 'delivered')), -- Estado permitido del pedido.
  TOTAL NUMBER(18, 2) NOT NULL CHECK (TOTAL >= 0), -- Importe total del pedido, no negativo.
  FECHA_CREACION TIMESTAMP WITH TIME ZONE NOT NULL, -- Fecha y hora del pedido, conservando zona horaria.
  TIPO_PEDIDO VARCHAR2(3) NOT NULL CHECK (TIPO_PEDIDO IN ('B2B', 'B2C')), -- Clasifica pedidos empresariales o de consumidor.
  MEDIO_PAGO VARCHAR2(100), -- Medio de pago informado, opcional.
  ID_TRANSACCION VARCHAR2(255), -- Identificador de la transacción de pago, opcional.
  FECHA_PAGO VARCHAR2(100) -- Fecha de pago recibida desde el sistema de origen.
); -- Finaliza la definición de pedidos.

-- Acelera búsquedas de pedidos de un cliente ordenadas por fecha.
CREATE INDEX MED_PEDIDOS_CLIENTE_FECHA_IX ON MED_PEDIDOS (ID_CLIENTE, FECHA_CREACION); -- Índice compuesto por cliente y fecha.

-- Tabla con los productos y cantidades que componen cada pedido.
CREATE TABLE MED_DETALLE_PEDIDOS ( -- Crea las líneas de detalle de pedidos.
  ID_PEDIDO VARCHAR2(100) NOT NULL REFERENCES MED_PEDIDOS(ID_PEDIDO) ON DELETE CASCADE, -- Relaciona la línea con su pedido y la elimina junto con él.
  NUMERO_LINEA NUMBER(6) NOT NULL, -- Número consecutivo de línea dentro del pedido.
  ID_PRODUCTO VARCHAR2(100) NOT NULL, -- Identificador del producto pedido.
  CANTIDAD NUMBER(18, 2) NOT NULL CHECK (CANTIDAD > 0), -- Cantidad pedida, estrictamente positiva.
  PRECIO_UNITARIO NUMBER(18, 2) NOT NULL CHECK (PRECIO_UNITARIO >= 0), -- Precio unitario aplicado, no negativo.
  CONSTRAINT MED_DETALLE_PEDIDOS_PK PRIMARY KEY (ID_PEDIDO, NUMERO_LINEA) -- Evita repetir el número de línea en un pedido.
); -- Finaliza la definición de detalles.

-- Tabla de cuentas bancarias internas.
CREATE TABLE MED_CUENTAS_BANCARIAS ( -- Crea la tabla de cuentas.
  ID_CUENTA VARCHAR2(100) PRIMARY KEY, -- Identificador único de la cuenta.
  SALDO NUMBER(18, 2) NOT NULL CHECK (SALDO >= 0), -- Saldo actual, no negativo.
  MONEDA VARCHAR2(3) NOT NULL -- Código de moneda de tres caracteres.
); -- Finaliza la definición de cuentas.

-- Tabla de movimientos asociados a las cuentas bancarias.
CREATE TABLE MED_TRANSACCIONES_BANCARIAS ( -- Crea la tabla de transacciones.
  ID_TRANSACCION VARCHAR2(100) PRIMARY KEY, -- Identificador único de la transacción.
  ID_CUENTA VARCHAR2(100) NOT NULL REFERENCES MED_CUENTAS_BANCARIAS(ID_CUENTA), -- Cuenta relacionada obligatoria.
  TIPO_TRANSACCION VARCHAR2(10) NOT NULL CHECK (TIPO_TRANSACCION IN ('debit', 'credit')), -- Indica si el movimiento debita o acredita.
  MONTO NUMBER(18, 2) NOT NULL CHECK (MONTO >= 0), -- Importe de la transacción, no negativo.
  DESCRIPCION VARCHAR2(1000) NOT NULL, -- Motivo o descripción del movimiento.
  FECHA_TRANSACCION TIMESTAMP WITH TIME ZONE NOT NULL, -- Fecha y hora del movimiento con zona horaria.
  ESTADO VARCHAR2(10) NOT NULL CHECK (ESTADO IN ('success', 'failed')) -- Resultado de la transacción.
); -- Finaliza la definición de transacciones.

-- Acelera la consulta de transacciones de una cuenta por fecha.
CREATE INDEX MED_TRANS_CUENTA_FECHA_IX ON MED_TRANSACCIONES_BANCARIAS (ID_CUENTA, FECHA_TRANSACCION); -- Índice compuesto por cuenta y fecha.

-- Tabla de alertas de inventario bajo o ya resuelto.
CREATE TABLE MED_ALERTAS_STOCK ( -- Crea la tabla de alertas de stock.
  ID_PRODUCTO VARCHAR2(100) PRIMARY KEY, -- Un registro de alerta por producto.
  SKU VARCHAR2(100) NOT NULL, -- SKU del producto alertado.
  NOMBRE_PRODUCTO VARCHAR2(255) NOT NULL, -- Nombre del producto alertado.
  STOCK NUMBER(18, 2) NOT NULL CHECK (STOCK >= 0), -- Existencias actuales cuando se registra la alerta.
  STOCK_MINIMO NUMBER(18, 2) NOT NULL CHECK (STOCK_MINIMO >= 0), -- Umbral mínimo de existencias.
  ESTADO VARCHAR2(10) NOT NULL CHECK (ESTADO IN ('open', 'resolved')), -- Estado actual de la alerta.
  FECHA_CREACION TIMESTAMP WITH TIME ZONE NOT NULL, -- Fecha en que se creó la alerta.
  FECHA_ACTUALIZACION TIMESTAMP WITH TIME ZONE NOT NULL -- Última fecha de actualización de la alerta.
); -- Finaliza la definición de alertas.

-- Declara la interfaz pública del paquete de sincronización.
CREATE OR REPLACE PACKAGE MEDISTOCK_SINCRONIZACION AS -- Crea o reemplaza la especificación del paquete.
  PROCEDURE APLICAR_CAMBIO( -- Declara el procedimiento que replica una operación.
    P_ENTIDAD IN VARCHAR2, -- Nombre de la colección de origen.
    P_ACCION IN VARCHAR2, -- Operación: UPSERT o DELETE.
    P_DATOS IN CLOB -- Documento de origen serializado como JSON.
  ); -- Finaliza la declaración del procedimiento.
END MEDISTOCK_SINCRONIZACION; -- Finaliza la especificación del paquete.
/

-- Implementa la lógica que aplica altas, cambios y eliminaciones en Oracle.
CREATE OR REPLACE PACKAGE BODY MEDISTOCK_SINCRONIZACION AS -- Crea o reemplaza el cuerpo del paquete.
  PROCEDURE APLICAR_CAMBIO( -- Implementa el procedimiento de sincronización.
    P_ENTIDAD IN VARCHAR2, -- Recibe el nombre de la entidad de origen.
    P_ACCION IN VARCHAR2, -- Recibe la operación que se aplicará.
    P_DATOS IN CLOB -- Recibe los datos del registro en formato JSON.
  ) IS -- Inicia la sección de declaraciones locales.
    V_ID VARCHAR2(100); -- Variable temporal para identificadores comunes.
    V_ID_CUENTA VARCHAR2(100); -- Variable temporal para identificadores de cuenta.
  BEGIN -- Inicia la ejecución del procedimiento.
    IF P_ACCION = 'DELETE' THEN -- Procesa una eliminación solicitada por MongoDB.
      IF P_ENTIDAD = 'products' THEN -- Comprueba si se elimina un producto.
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Extrae el identificador desde el JSON.
        DELETE FROM MED_PRODUCTOS WHERE ID_PRODUCTO = V_ID; -- Elimina el producto de Oracle.
        DELETE FROM MED_ALERTAS_STOCK WHERE ID_PRODUCTO = V_ID; -- Elimina también su alerta asociada.
      ELSIF P_ENTIDAD = 'users' THEN -- Comprueba si se elimina un usuario.
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Extrae el identificador del usuario.
        DELETE FROM MED_USUARIOS WHERE ID_USUARIO = V_ID; -- Elimina el usuario de Oracle.
      ELSIF P_ENTIDAD = 'orders' THEN -- Comprueba si se elimina un pedido.
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Extrae el identificador del pedido.
        DELETE FROM MED_PEDIDOS WHERE ID_PEDIDO = V_ID; -- Elimina el pedido y su detalle dependiente.
      ELSIF P_ENTIDAD = 'bank_accounts' THEN -- Comprueba si se elimina una cuenta bancaria.
        V_ID_CUENTA := JSON_VALUE(P_DATOS, '$.accountId'); -- Extrae el identificador de cuenta.
        DELETE FROM MED_CUENTAS_BANCARIAS WHERE ID_CUENTA = V_ID_CUENTA; -- Elimina la cuenta.
      ELSIF P_ENTIDAD = 'bank_transactions' THEN -- Comprueba si se elimina una transacción.
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Extrae el identificador de la transacción.
        DELETE FROM MED_TRANSACCIONES_BANCARIAS WHERE ID_TRANSACCION = V_ID; -- Elimina la transacción.
      ELSIF P_ENTIDAD = 'stock_alerts' THEN -- Comprueba si se elimina una alerta de stock.
        V_ID := JSON_VALUE(P_DATOS, '$.productId'); -- Extrae el identificador del producto alertado.
        DELETE FROM MED_ALERTAS_STOCK WHERE ID_PRODUCTO = V_ID; -- Elimina la alerta del producto.
      ELSE -- Atiende nombres de entidad no reconocidos.
        RAISE_APPLICATION_ERROR(-20001, 'Entidad de sincronizacion desconocida'); -- Informa del error al cliente.
      END IF; -- Finaliza la selección de entidad para DELETE.
    ELSIF P_ACCION = 'UPSERT' THEN -- Procesa una inserción o actualización.
      IF P_ENTIDAD = 'products' THEN -- Comprueba si se sincroniza un producto.
        MERGE INTO MED_PRODUCTOS T -- Inserta o actualiza el producto destino.
        USING ( -- Define los datos de origen que se extraen del JSON.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_PRODUCTO, -- Lee el identificador del producto.
                 JSON_VALUE(P_DATOS, '$.name') NOMBRE, -- Lee el nombre del producto.
                 JSON_VALUE(P_DATOS, '$.sku') SKU, -- Lee el código SKU.
                 JSON_VALUE(P_DATOS, '$.description') DESCRIPCION, -- Lee la descripción.
                 JSON_VALUE(P_DATOS, '$.price' RETURNING NUMBER) PRECIO, -- Lee el precio como número.
                 JSON_VALUE(P_DATOS, '$.category') CATEGORIA, -- Lee la categoría.
                 JSON_VALUE(P_DATOS, '$.stock' RETURNING NUMBER) STOCK, -- Lee el stock como número.
                 JSON_VALUE(P_DATOS, '$.minStock' RETURNING NUMBER) STOCK_MINIMO, -- Lee el stock mínimo.
                 JSON_VALUE(P_DATOS, '$.image') IMAGEN -- Lee la URL de imagen.
          FROM DUAL -- Usa DUAL para producir una fila con los valores del JSON.
        ) S ON (T.ID_PRODUCTO = S.ID_PRODUCTO) -- Busca coincidencia por identificador.
        WHEN MATCHED THEN UPDATE SET -- Actualiza el producto si ya existe.
          T.NOMBRE = S.NOMBRE, T.SKU = S.SKU, T.DESCRIPCION = S.DESCRIPCION, -- Actualiza nombre, SKU y descripción.
          T.PRECIO = S.PRECIO, T.CATEGORIA = S.CATEGORIA, T.STOCK = S.STOCK, -- Actualiza precio, categoría y stock.
          T.STOCK_MINIMO = S.STOCK_MINIMO, T.IMAGEN = S.IMAGEN -- Actualiza stock mínimo e imagen.
        WHEN NOT MATCHED THEN INSERT -- Inserta el producto si todavía no existe.
          (ID_PRODUCTO, NOMBRE, SKU, DESCRIPCION, PRECIO, CATEGORIA, STOCK, STOCK_MINIMO, IMAGEN) -- Indica las columnas destino.
        VALUES -- Proporciona los valores correspondientes a las columnas.
          (S.ID_PRODUCTO, S.NOMBRE, S.SKU, S.DESCRIPCION, S.PRECIO, S.CATEGORIA, S.STOCK, S.STOCK_MINIMO, S.IMAGEN); -- Inserta los datos extraídos.
      ELSIF P_ENTIDAD = 'users' THEN -- Comprueba si se sincroniza un usuario.
        MERGE INTO MED_USUARIOS T -- Inserta o actualiza el usuario destino.
        USING ( -- Define los datos de usuario extraídos del JSON.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_USUARIO, -- Lee el identificador del usuario.
                 JSON_VALUE(P_DATOS, '$.name') NOMBRE, -- Lee el nombre.
                 JSON_VALUE(P_DATOS, '$.email') CORREO, -- Lee el correo electrónico.
                 JSON_VALUE(P_DATOS, '$.role') ROL, -- Lee el rol asignado.
                 JSON_VALUE(P_DATOS, '$.institution') INSTITUCION, -- Lee la institución si está informada.
                 JSON_VALUE(P_DATOS, '$.password') HASH_CONTRASENA -- Lee el hash de contraseña, no la contraseña original.
          FROM DUAL -- Usa DUAL para construir una fila desde el JSON.
        ) S ON (T.ID_USUARIO = S.ID_USUARIO) -- Busca coincidencia por identificador.
        WHEN MATCHED THEN UPDATE SET -- Actualiza los datos si el usuario ya existe.
          T.NOMBRE = S.NOMBRE, T.CORREO = S.CORREO, T.ROL = S.ROL, -- Actualiza nombre, correo y rol.
          T.INSTITUCION = S.INSTITUCION, T.HASH_CONTRASENA = S.HASH_CONTRASENA -- Actualiza institución y hash.
        WHEN NOT MATCHED THEN INSERT -- Inserta el usuario si todavía no existe.
          (ID_USUARIO, NOMBRE, CORREO, ROL, INSTITUCION, HASH_CONTRASENA) -- Indica las columnas destino.
        VALUES -- Proporciona los valores correspondientes a las columnas.
          (S.ID_USUARIO, S.NOMBRE, S.CORREO, S.ROL, S.INSTITUCION, S.HASH_CONTRASENA); -- Inserta los datos extraídos.
      ELSIF P_ENTIDAD = 'orders' THEN -- Comprueba si se sincroniza un pedido.
        MERGE INTO MED_PEDIDOS T -- Inserta o actualiza el encabezado del pedido.
        USING ( -- Define los datos del pedido que se extraen del JSON.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_PEDIDO, -- Lee el identificador del pedido.
                 JSON_VALUE(P_DATOS, '$.customerId') ID_CLIENTE, -- Lee el identificador del cliente.
                 JSON_VALUE(P_DATOS, '$.status') ESTADO, -- Lee el estado del pedido.
                 JSON_VALUE(P_DATOS, '$.total' RETURNING NUMBER) TOTAL, -- Lee el importe total como número.
                 TO_TIMESTAMP_TZ( -- Convierte la fecha ISO a timestamp con zona horaria.
                   REPLACE(JSON_VALUE(P_DATOS, '$.createdAt'), 'Z', '+00:00'), -- Convierte el indicador UTC Z al desplazamiento explícito.
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM' -- Define el formato de fecha y zona horaria esperado.
                 ) FECHA_CREACION, -- Nombra la fecha convertida.
                 JSON_VALUE(P_DATOS, '$.type') TIPO_PEDIDO, -- Lee si el pedido es B2B o B2C.
                 JSON_VALUE(P_DATOS, '$.metadata.paymentMethod') MEDIO_PAGO, -- Lee el medio de pago opcional.
                 JSON_VALUE(P_DATOS, '$.metadata.transactionId') ID_TRANSACCION, -- Lee el ID de transacción opcional.
                 JSON_VALUE(P_DATOS, '$.metadata.paidAt') FECHA_PAGO -- Lee la fecha de pago opcional.
          FROM DUAL -- Usa DUAL para construir una fila desde el JSON.
        ) S ON (T.ID_PEDIDO = S.ID_PEDIDO) -- Busca coincidencia por identificador de pedido.
        WHEN MATCHED THEN UPDATE SET -- Actualiza el encabezado si el pedido ya existe.
          T.ID_CLIENTE = S.ID_CLIENTE, T.ESTADO = S.ESTADO, T.TOTAL = S.TOTAL, -- Actualiza cliente, estado e importe.
          T.FECHA_CREACION = S.FECHA_CREACION, T.TIPO_PEDIDO = S.TIPO_PEDIDO, -- Actualiza fecha y tipo.
          T.MEDIO_PAGO = S.MEDIO_PAGO, T.ID_TRANSACCION = S.ID_TRANSACCION, -- Actualiza medio de pago e ID de transacción.
          T.FECHA_PAGO = S.FECHA_PAGO -- Actualiza la fecha de pago.
        WHEN NOT MATCHED THEN INSERT -- Inserta el encabezado si el pedido aún no existe.
          (ID_PEDIDO, ID_CLIENTE, ESTADO, TOTAL, FECHA_CREACION, TIPO_PEDIDO, -- Indica las primeras columnas destino.
           MEDIO_PAGO, ID_TRANSACCION, FECHA_PAGO) -- Indica las columnas de información de pago.
        VALUES -- Proporciona los valores de la fila nueva.
          (S.ID_PEDIDO, S.ID_CLIENTE, S.ESTADO, S.TOTAL, S.FECHA_CREACION, S.TIPO_PEDIDO, -- Asigna los datos principales del pedido.
           S.MEDIO_PAGO, S.ID_TRANSACCION, S.FECHA_PAGO); -- Asigna los datos de pago.

        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Guarda el ID del pedido para reemplazar su detalle.
        DELETE FROM MED_DETALLE_PEDIDOS WHERE ID_PEDIDO = V_ID; -- Borra las líneas anteriores para evitar duplicados.
        INSERT INTO MED_DETALLE_PEDIDOS (ID_PEDIDO, NUMERO_LINEA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO) -- Prepara la inserción de las líneas nuevas.
        SELECT V_ID, ARTICULO.NUMERO_LINEA, ARTICULO.ID_PRODUCTO, -- Asigna el pedido y los datos identificativos de cada artículo.
               ARTICULO.CANTIDAD, ARTICULO.PRECIO_UNITARIO -- Asigna cantidad y precio unitario.
        FROM JSON_TABLE( -- Convierte el arreglo JSON de artículos en filas relacionales.
          P_DATOS, -- Indica el documento JSON que contiene los artículos.
          '$.items[*]' COLUMNS ( -- Recorre cada elemento del arreglo items.
            NUMERO_LINEA FOR ORDINALITY, -- Genera el número de línea según la posición.
            ID_PRODUCTO VARCHAR2(100) PATH '$.productId', -- Extrae el ID del producto.
            CANTIDAD NUMBER PATH '$.quantity', -- Extrae la cantidad solicitada.
            PRECIO_UNITARIO NUMBER PATH '$.price' -- Extrae el precio unitario aplicado.
          ) -- Finaliza la definición de columnas JSON.
        ) ARTICULO; -- Nombra el conjunto de líneas obtenido del JSON.
      ELSIF P_ENTIDAD = 'bank_accounts' THEN -- Comprueba si se sincroniza una cuenta bancaria.
        MERGE INTO MED_CUENTAS_BANCARIAS T -- Inserta o actualiza la cuenta.
        USING ( -- Define los valores de cuenta extraídos del JSON.
          SELECT JSON_VALUE(P_DATOS, '$.accountId') ID_CUENTA, -- Lee el identificador de cuenta.
                 JSON_VALUE(P_DATOS, '$.balance' RETURNING NUMBER) SALDO, -- Lee el saldo como número.
                 JSON_VALUE(P_DATOS, '$.currency') MONEDA -- Lee el código de moneda.
          FROM DUAL -- Usa DUAL para producir una fila desde el JSON.
        ) S ON (T.ID_CUENTA = S.ID_CUENTA) -- Busca coincidencia por ID de cuenta.
        WHEN MATCHED THEN UPDATE SET T.SALDO = S.SALDO, T.MONEDA = S.MONEDA -- Actualiza saldo y moneda si existe.
        WHEN NOT MATCHED THEN INSERT (ID_CUENTA, SALDO, MONEDA) -- Inserta una cuenta nueva.
        VALUES (S.ID_CUENTA, S.SALDO, S.MONEDA); -- Asigna ID, saldo y moneda.
      ELSIF P_ENTIDAD = 'bank_transactions' THEN -- Comprueba si se sincroniza una transacción.
        MERGE INTO MED_TRANSACCIONES_BANCARIAS T -- Inserta o actualiza la transacción.
        USING ( -- Define los datos de transacción extraídos del JSON.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_TRANSACCION, -- Lee el identificador de transacción.
                 JSON_VALUE(P_DATOS, '$.accountId') ID_CUENTA, -- Lee la cuenta asociada.
                 JSON_VALUE(P_DATOS, '$.type') TIPO_TRANSACCION, -- Lee si es débito o crédito.
                 JSON_VALUE(P_DATOS, '$.amount' RETURNING NUMBER) MONTO, -- Lee el monto como número.
                 JSON_VALUE(P_DATOS, '$.description') DESCRIPCION, -- Lee la descripción del movimiento.
                 TO_TIMESTAMP_TZ( -- Convierte la fecha ISO de la transacción.
                   REPLACE(JSON_VALUE(P_DATOS, '$.timestamp'), 'Z', '+00:00'), -- Expresa UTC con desplazamiento horario.
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM' -- Define el formato de fecha esperado.
                 ) FECHA_TRANSACCION, -- Nombra la fecha convertida.
                 JSON_VALUE(P_DATOS, '$.status') ESTADO -- Lee el resultado de la transacción.
          FROM DUAL -- Usa DUAL para producir una fila desde el JSON.
        ) S ON (T.ID_TRANSACCION = S.ID_TRANSACCION) -- Busca coincidencia por ID de transacción.
        WHEN MATCHED THEN UPDATE SET -- Actualiza la transacción si ya existe.
          T.ID_CUENTA = S.ID_CUENTA, T.TIPO_TRANSACCION = S.TIPO_TRANSACCION, -- Actualiza cuenta y tipo.
          T.MONTO = S.MONTO, T.DESCRIPCION = S.DESCRIPCION, -- Actualiza monto y descripción.
          T.FECHA_TRANSACCION = S.FECHA_TRANSACCION, T.ESTADO = S.ESTADO -- Actualiza fecha y estado.
        WHEN NOT MATCHED THEN INSERT -- Inserta la transacción si no existe.
          (ID_TRANSACCION, ID_CUENTA, TIPO_TRANSACCION, MONTO, DESCRIPCION, FECHA_TRANSACCION, ESTADO) -- Indica todas las columnas destino.
        VALUES -- Proporciona los datos de la transacción nueva.
          (S.ID_TRANSACCION, S.ID_CUENTA, S.TIPO_TRANSACCION, S.MONTO, S.DESCRIPCION, S.FECHA_TRANSACCION, S.ESTADO); -- Inserta los valores extraídos.
      ELSIF P_ENTIDAD = 'stock_alerts' THEN -- Comprueba si se sincroniza una alerta de stock.
        MERGE INTO MED_ALERTAS_STOCK T -- Inserta o actualiza la alerta.
        USING ( -- Define los datos de alerta extraídos del JSON.
          SELECT JSON_VALUE(P_DATOS, '$.productId') ID_PRODUCTO, -- Lee el producto asociado.
                 JSON_VALUE(P_DATOS, '$.sku') SKU, -- Lee el SKU del producto.
                 JSON_VALUE(P_DATOS, '$.productName') NOMBRE_PRODUCTO, -- Lee el nombre del producto.
                 JSON_VALUE(P_DATOS, '$.stock' RETURNING NUMBER) STOCK, -- Lee el stock observado como número.
                 JSON_VALUE(P_DATOS, '$.minStock' RETURNING NUMBER) STOCK_MINIMO, -- Lee el umbral mínimo como número.
                 JSON_VALUE(P_DATOS, '$.status') ESTADO, -- Lee el estado de la alerta.
                 TO_TIMESTAMP_TZ( -- Convierte la fecha de creación de la alerta.
                   REPLACE(JSON_VALUE(P_DATOS, '$.createdAt'), 'Z', '+00:00'), -- Normaliza la zona horaria UTC.
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM' -- Define el formato de fecha esperado.
                 ) FECHA_CREACION, -- Nombra la fecha de creación convertida.
                 TO_TIMESTAMP_TZ( -- Convierte la fecha de última actualización.
                   REPLACE(JSON_VALUE(P_DATOS, '$.updatedAt'), 'Z', '+00:00'), -- Normaliza la zona horaria UTC.
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM' -- Define el formato de fecha esperado.
                 ) FECHA_ACTUALIZACION -- Nombra la fecha de actualización convertida.
          FROM DUAL -- Usa DUAL para producir una fila desde el JSON.
        ) S ON (T.ID_PRODUCTO = S.ID_PRODUCTO) -- Busca la alerta por ID de producto.
        WHEN MATCHED THEN UPDATE SET -- Actualiza la alerta existente.
          T.SKU = S.SKU, T.NOMBRE_PRODUCTO = S.NOMBRE_PRODUCTO, T.STOCK = S.STOCK, -- Actualiza identificación y existencias.
          T.STOCK_MINIMO = S.STOCK_MINIMO, T.ESTADO = S.ESTADO, -- Actualiza umbral y estado.
          T.FECHA_CREACION = S.FECHA_CREACION, T.FECHA_ACTUALIZACION = S.FECHA_ACTUALIZACION -- Actualiza sus fechas.
        WHEN NOT MATCHED THEN INSERT -- Inserta la alerta si no existe.
          (ID_PRODUCTO, SKU, NOMBRE_PRODUCTO, STOCK, STOCK_MINIMO, ESTADO, FECHA_CREACION, FECHA_ACTUALIZACION) -- Indica las columnas destino.
        VALUES -- Proporciona los valores de la alerta nueva.
          (S.ID_PRODUCTO, S.SKU, S.NOMBRE_PRODUCTO, S.STOCK, S.STOCK_MINIMO, S.ESTADO, S.FECHA_CREACION, S.FECHA_ACTUALIZACION); -- Inserta los valores extraídos.
      ELSE -- Atiende entidades que no están soportadas para UPSERT.
        RAISE_APPLICATION_ERROR(-20001, 'Entidad de sincronizacion desconocida'); -- Devuelve un error claro al cliente.
      END IF; -- Finaliza la selección de entidad para UPSERT.
    ELSE -- Atiende acciones distintas de DELETE y UPSERT.
      RAISE_APPLICATION_ERROR(-20002, 'Accion de sincronizacion desconocida'); -- Informa que la acción no está soportada.
    END IF; -- Finaliza la selección de acción.
  END APLICAR_CAMBIO; -- Finaliza el procedimiento de aplicación.
END MEDISTOCK_SINCRONIZACION; -- Finaliza el cuerpo del paquete.
/
