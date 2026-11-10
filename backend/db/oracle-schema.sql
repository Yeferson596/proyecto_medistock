-- Tablas que necesita la replica Oracle y que tambien sirven para los ejemplos PL/SQL.
CREATE TABLE MED_PRODUCTOS (
  ID_PRODUCTO VARCHAR2(100) PRIMARY KEY, -- Identificador unico de cada producto.
  SKU VARCHAR2(100) NOT NULL UNIQUE, -- Codigo de inventario obligatorio y sin duplicados.
  NOMBRE VARCHAR2(255) NOT NULL, -- Nombre que se muestra en los reportes.
  DESCRIPCION VARCHAR2(4000) NOT NULL, -- Descripcion del producto sincronizada desde MongoDB.
  PRECIO NUMBER(18, 2) DEFAULT 0 NOT NULL CHECK (PRECIO >= 0), -- Precio unitario no negativo.
  CATEGORIA VARCHAR2(255) NOT NULL, -- Permite agrupar y filtrar productos.
  STOCK NUMBER(18, 2) DEFAULT 0 NOT NULL CHECK (STOCK >= 0), -- Existencias actuales, con cero por defecto.
  STOCK_MINIMO NUMBER(18, 2) DEFAULT 0 NOT NULL CHECK (STOCK_MINIMO >= 0), -- Umbral para detectar stock bajo.
  IMAGEN VARCHAR2(1000) NOT NULL -- URL de imagen del producto.
); -- Finaliza la tabla de productos.

-- Usuarios requeridos por la sincronizacion de las colecciones MongoDB.
CREATE TABLE MED_USUARIOS (
  ID_USUARIO VARCHAR2(100) PRIMARY KEY, -- Identificador unico del usuario.
  NOMBRE VARCHAR2(255) NOT NULL, -- Nombre completo.
  CORREO VARCHAR2(320) NOT NULL UNIQUE, -- Correo unico de inicio de sesion.
  ROL VARCHAR2(30) NOT NULL CHECK (ROL IN ('admin', 'operator', 'b2b_client', 'customer')), -- Roles validos de la aplicacion.
  INSTITUCION VARCHAR2(255), -- Institucion asociada, opcional.
  HASH_CONTRASENA VARCHAR2(255) -- Hash bcrypt; no almacenar contrasenas en texto plano.
); -- Finaliza la tabla de usuarios.

-- Encabezados de pedidos; los metadatos de pago se copian desde el documento MongoDB.
CREATE TABLE MED_PEDIDOS (
  ID_PEDIDO VARCHAR2(100) PRIMARY KEY, -- Identificador unico de cada pedido.
  ID_CLIENTE VARCHAR2(100) NOT NULL, -- Identificador del cliente en MongoDB.
  ESTADO VARCHAR2(30) NOT NULL CHECK (ESTADO IN ('pending', 'paid', 'processing', 'preparing', 'shipped', 'delivered')), -- Estado admitido.
  TOTAL NUMBER(18, 2) NOT NULL CHECK (TOTAL >= 0), -- Total no negativo del pedido.
  FECHA_CREACION TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL, -- Fecha de creacion con zona horaria.
  TIPO_PEDIDO VARCHAR2(3) NOT NULL CHECK (TIPO_PEDIDO IN ('B2B', 'B2C')), -- Tipo de cliente.
  MEDIO_PAGO VARCHAR2(100), -- Medio de pago opcional.
  ID_TRANSACCION VARCHAR2(255), -- Identificador de la transaccion opcional.
  FECHA_PAGO VARCHAR2(100) -- Fecha de pago recibida desde MongoDB.
); -- Finaliza la tabla de pedidos.

-- Acelera la consulta de pedidos de un cliente ordenados por fecha.
CREATE INDEX MED_PEDIDOS_CLIENTE_FECHA_IX
  ON MED_PEDIDOS (ID_CLIENTE, FECHA_CREACION); -- Indice compuesto para filtrar por cliente y ordenar por fecha.

-- Las lineas se relacionan con el pedido; el ID de producto queda como referencia historica.
CREATE TABLE MED_DETALLE_PEDIDOS (
  ID_PEDIDO VARCHAR2(100) NOT NULL REFERENCES MED_PEDIDOS(ID_PEDIDO) ON DELETE CASCADE, -- El detalle pertenece a un pedido.
  NUMERO_LINEA NUMBER(6) NOT NULL, -- Posicion de esta linea dentro del pedido.
  ID_PRODUCTO VARCHAR2(100) NOT NULL, -- ID del producto en el momento del pedido, sin bloquear su eliminacion.
  CANTIDAD NUMBER(18, 2) NOT NULL CHECK (CANTIDAD > 0), -- Cantidad pedida, estrictamente positiva.
  PRECIO_UNITARIO NUMBER(18, 2) NOT NULL CHECK (PRECIO_UNITARIO >= 0), -- Precio aplicado al momento de la compra.
  CONSTRAINT MED_DETALLE_PEDIDOS_PK PRIMARY KEY (ID_PEDIDO, NUMERO_LINEA) -- Evita repetir lineas en un pedido.
); -- Finaliza la tabla de detalle.

-- Cuentas bancarias internas sincronizadas desde la coleccion bank_accounts.
CREATE TABLE MED_CUENTAS_BANCARIAS (
  ID_CUENTA VARCHAR2(100) PRIMARY KEY, -- Identificador de la cuenta.
  SALDO NUMBER(18, 2) NOT NULL CHECK (SALDO >= 0), -- Saldo actual no negativo.
  MONEDA VARCHAR2(3) NOT NULL -- Codigo de moneda de tres caracteres.
); -- Finaliza la tabla de cuentas.

-- Movimientos asociados a las cuentas bancarias.
CREATE TABLE MED_TRANSACCIONES_BANCARIAS (
  ID_TRANSACCION VARCHAR2(100) PRIMARY KEY, -- Identificador unico de la transaccion.
  ID_CUENTA VARCHAR2(100) NOT NULL REFERENCES MED_CUENTAS_BANCARIAS(ID_CUENTA), -- Cuenta relacionada.
  TIPO_TRANSACCION VARCHAR2(10) NOT NULL CHECK (TIPO_TRANSACCION IN ('debit', 'credit')), -- Tipo de movimiento.
  MONTO NUMBER(18, 2) NOT NULL CHECK (MONTO >= 0), -- Importe no negativo.
  DESCRIPCION VARCHAR2(1000) NOT NULL, -- Motivo del movimiento.
  FECHA_TRANSACCION TIMESTAMP WITH TIME ZONE NOT NULL, -- Fecha y hora del movimiento.
  ESTADO VARCHAR2(10) NOT NULL CHECK (ESTADO IN ('success', 'failed')) -- Resultado de la transaccion.
); -- Finaliza la tabla de transacciones.

-- Acelera la busqueda de transacciones por cuenta y fecha.
CREATE INDEX MED_TRANS_CUENTA_FECHA_IX ON MED_TRANSACCIONES_BANCARIAS (ID_CUENTA, FECHA_TRANSACCION);

-- Estado actual de las alertas de inventario bajo sincronizadas desde MongoDB.
CREATE TABLE MED_ALERTAS_STOCK (
  ID_PRODUCTO VARCHAR2(100) PRIMARY KEY, -- Una alerta actual por producto.
  SKU VARCHAR2(100) NOT NULL, -- SKU del producto alertado.
  NOMBRE_PRODUCTO VARCHAR2(255) NOT NULL, -- Nombre del producto alertado.
  STOCK NUMBER(18, 2) NOT NULL CHECK (STOCK >= 0), -- Existencias observadas.
  STOCK_MINIMO NUMBER(18, 2) NOT NULL CHECK (STOCK_MINIMO >= 0), -- Umbral de alerta.
  ESTADO VARCHAR2(10) NOT NULL CHECK (ESTADO IN ('open', 'resolved')), -- Estado de la alerta.
  FECHA_CREACION TIMESTAMP WITH TIME ZONE NOT NULL, -- Fecha de creacion.
  FECHA_ACTUALIZACION TIMESTAMP WITH TIME ZONE NOT NULL -- Fecha de la ultima actualizacion.
); -- Finaliza la tabla de alertas.

-- Interfaz publica invocada por el backend para aplicar eventos de MongoDB.
CREATE OR REPLACE PACKAGE MEDISTOCK_SINCRONIZACION AS
  PROCEDURE APLICAR_CAMBIO(
    P_ENTIDAD IN VARCHAR2, -- Coleccion que genero el evento.
    P_ACCION IN VARCHAR2, -- Accion UPSERT o DELETE.
    P_DATOS IN CLOB -- Documento serializado como JSON.
  );
END MEDISTOCK_SINCRONIZACION;
/

-- Implementa la replica de altas, cambios y eliminaciones.
CREATE OR REPLACE PACKAGE BODY MEDISTOCK_SINCRONIZACION AS
  -- Procedimiento publico que recibe el tipo de evento y el documento JSON asociado.
  PROCEDURE APLICAR_CAMBIO(
    P_ENTIDAD IN VARCHAR2, -- Nombre de la coleccion de origen.
    P_ACCION IN VARCHAR2, -- UPSERT inserta/actualiza; DELETE elimina.
    P_DATOS IN CLOB -- Documento serializado enviado por el backend.
  ) IS
    V_ID VARCHAR2(100); -- ID comun para entidades cuya clave es id.
    V_ID_CUENTA VARCHAR2(100); -- ID para la clave accountId de las cuentas.
  BEGIN -- Inicia la aplicacion del evento.
    IF P_ACCION = 'DELETE' THEN -- Elimina el registro identificado en el documento JSON.
      IF P_ENTIDAD = 'products' THEN
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Lee la clave del producto desde el JSON.
        DELETE FROM MED_PRODUCTOS WHERE ID_PRODUCTO = V_ID; -- Elimina el producto de la replica.
        DELETE FROM MED_ALERTAS_STOCK WHERE ID_PRODUCTO = V_ID; -- Elimina su alerta asociada.
      ELSIF P_ENTIDAD = 'users' THEN
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Lee la clave del usuario.
        DELETE FROM MED_USUARIOS WHERE ID_USUARIO = V_ID; -- Elimina el usuario.
      ELSIF P_ENTIDAD = 'orders' THEN
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Lee la clave del pedido.
        DELETE FROM MED_PEDIDOS WHERE ID_PEDIDO = V_ID; -- Elimina pedido y detalle dependiente.
      ELSIF P_ENTIDAD = 'bank_accounts' THEN
        V_ID_CUENTA := JSON_VALUE(P_DATOS, '$.accountId'); -- Esta coleccion usa accountId como clave.
        DELETE FROM MED_CUENTAS_BANCARIAS WHERE ID_CUENTA = V_ID_CUENTA; -- Elimina la cuenta.
      ELSIF P_ENTIDAD = 'bank_transactions' THEN
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Lee la clave de la transaccion.
        DELETE FROM MED_TRANSACCIONES_BANCARIAS WHERE ID_TRANSACCION = V_ID; -- Elimina el movimiento.
      ELSIF P_ENTIDAD = 'stock_alerts' THEN
        V_ID := JSON_VALUE(P_DATOS, '$.productId'); -- Las alertas se identifican por producto.
        DELETE FROM MED_ALERTAS_STOCK WHERE ID_PRODUCTO = V_ID; -- Elimina la alerta.
      ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Entidad de sincronizacion desconocida'); -- Rechaza entidades no soportadas.
      END IF;
    ELSIF P_ACCION = 'UPSERT' THEN -- Inserta o actualiza el registro de la entidad recibida.
      IF P_ENTIDAD = 'products' THEN
        MERGE INTO MED_PRODUCTOS T -- T representa la fila destino de Oracle.
        USING ( -- Convierte los campos escalares del JSON en una fila fuente.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_PRODUCTO,
                 JSON_VALUE(P_DATOS, '$.name') NOMBRE,
                 JSON_VALUE(P_DATOS, '$.sku') SKU,
                 JSON_VALUE(P_DATOS, '$.description') DESCRIPCION,
                 JSON_VALUE(P_DATOS, '$.price' RETURNING NUMBER) PRECIO,
                 JSON_VALUE(P_DATOS, '$.category') CATEGORIA,
                 JSON_VALUE(P_DATOS, '$.stock' RETURNING NUMBER) STOCK,
                 JSON_VALUE(P_DATOS, '$.minStock' RETURNING NUMBER) STOCK_MINIMO,
                 JSON_VALUE(P_DATOS, '$.image') IMAGEN
            FROM DUAL -- DUAL permite construir una fila a partir del documento JSON.
        ) S ON (T.ID_PRODUCTO = S.ID_PRODUCTO) -- El ID determina si la fila ya existe.
        WHEN MATCHED THEN UPDATE SET -- Si existe, actualiza todos los atributos sincronizados.
          T.NOMBRE = S.NOMBRE, T.SKU = S.SKU, T.DESCRIPCION = S.DESCRIPCION,
          T.PRECIO = S.PRECIO, T.CATEGORIA = S.CATEGORIA, T.STOCK = S.STOCK,
          T.STOCK_MINIMO = S.STOCK_MINIMO, T.IMAGEN = S.IMAGEN
        WHEN NOT MATCHED THEN INSERT -- Si no existe, crea una fila nueva.
          (ID_PRODUCTO, NOMBRE, SKU, DESCRIPCION, PRECIO, CATEGORIA, STOCK, STOCK_MINIMO, IMAGEN)
        VALUES
          (S.ID_PRODUCTO, S.NOMBRE, S.SKU, S.DESCRIPCION, S.PRECIO, S.CATEGORIA, S.STOCK, S.STOCK_MINIMO, S.IMAGEN);
      ELSIF P_ENTIDAD = 'users' THEN
        MERGE INTO MED_USUARIOS T -- Sincroniza los datos de usuario por su ID.
        USING ( -- Extrae los campos del documento de usuario.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_USUARIO,
                 JSON_VALUE(P_DATOS, '$.name') NOMBRE,
                 JSON_VALUE(P_DATOS, '$.email') CORREO,
                 JSON_VALUE(P_DATOS, '$.role') ROL,
                 JSON_VALUE(P_DATOS, '$.institution') INSTITUCION,
                 JSON_VALUE(P_DATOS, '$.password') HASH_CONTRASENA
            FROM DUAL -- Produce la fila fuente para MERGE.
        ) S ON (T.ID_USUARIO = S.ID_USUARIO) -- Compara por el ID del usuario.
        WHEN MATCHED THEN UPDATE SET -- Actualiza los campos si el usuario ya estaba replicado.
          T.NOMBRE = S.NOMBRE, T.CORREO = S.CORREO, T.ROL = S.ROL,
          T.INSTITUCION = S.INSTITUCION, T.HASH_CONTRASENA = S.HASH_CONTRASENA
        WHEN NOT MATCHED THEN INSERT -- Agrega el usuario si todavia no existe.
          (ID_USUARIO, NOMBRE, CORREO, ROL, INSTITUCION, HASH_CONTRASENA)
        VALUES
          (S.ID_USUARIO, S.NOMBRE, S.CORREO, S.ROL, S.INSTITUCION, S.HASH_CONTRASENA);
      ELSIF P_ENTIDAD = 'orders' THEN
        MERGE INTO MED_PEDIDOS T -- Sincroniza primero el encabezado del pedido.
        USING ( -- Extrae los campos principales y metadatos de pago.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_PEDIDO,
                 JSON_VALUE(P_DATOS, '$.customerId') ID_CLIENTE,
                 JSON_VALUE(P_DATOS, '$.status') ESTADO,
                 JSON_VALUE(P_DATOS, '$.total' RETURNING NUMBER) TOTAL,
                 TO_TIMESTAMP_TZ(
                   REPLACE(JSON_VALUE(P_DATOS, '$.createdAt'), 'Z', '+00:00'),
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
                 ) FECHA_CREACION, -- Convierte la fecha ISO a TIMESTAMP con zona horaria.
                 JSON_VALUE(P_DATOS, '$.type') TIPO_PEDIDO,
                 JSON_VALUE(P_DATOS, '$.metadata.paymentMethod') MEDIO_PAGO,
                 JSON_VALUE(P_DATOS, '$.metadata.transactionId') ID_TRANSACCION,
                 JSON_VALUE(P_DATOS, '$.metadata.paidAt') FECHA_PAGO
            FROM DUAL -- DUAL se usa para formar una fila fuente desde el JSON.
        ) S ON (T.ID_PEDIDO = S.ID_PEDIDO) -- El ID del pedido identifica el registro.
        WHEN MATCHED THEN UPDATE SET -- Actualiza encabezado y datos de pago.
          T.ID_CLIENTE = S.ID_CLIENTE, T.ESTADO = S.ESTADO, T.TOTAL = S.TOTAL,
          T.FECHA_CREACION = S.FECHA_CREACION, T.TIPO_PEDIDO = S.TIPO_PEDIDO,
          T.MEDIO_PAGO = S.MEDIO_PAGO, T.ID_TRANSACCION = S.ID_TRANSACCION,
          T.FECHA_PAGO = S.FECHA_PAGO
        WHEN NOT MATCHED THEN INSERT -- Inserta el encabezado cuando es un pedido nuevo.
          (ID_PEDIDO, ID_CLIENTE, ESTADO, TOTAL, FECHA_CREACION, TIPO_PEDIDO,
           MEDIO_PAGO, ID_TRANSACCION, FECHA_PAGO)
        VALUES
          (S.ID_PEDIDO, S.ID_CLIENTE, S.ESTADO, S.TOTAL, S.FECHA_CREACION, S.TIPO_PEDIDO,
           S.MEDIO_PAGO, S.ID_TRANSACCION, S.FECHA_PAGO);

        -- Reemplaza el detalle completo para que refleje el arreglo items mas reciente.
        V_ID := JSON_VALUE(P_DATOS, '$.id'); -- Guarda el ID del pedido para manipular sus lineas.
        DELETE FROM MED_DETALLE_PEDIDOS WHERE ID_PEDIDO = V_ID; -- Quita las lineas anteriores.
        -- JSON_TABLE transforma cada objeto de items en una fila relacional.
        INSERT INTO MED_DETALLE_PEDIDOS (ID_PEDIDO, NUMERO_LINEA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
        SELECT V_ID, ARTICULO.NUMERO_LINEA, ARTICULO.ID_PRODUCTO,
               ARTICULO.CANTIDAD, ARTICULO.PRECIO_UNITARIO
          FROM JSON_TABLE(
            P_DATOS, -- Documento que contiene el arreglo de productos pedidos.
            '$.items[*]' COLUMNS ( -- Recorre cada elemento del arreglo items.
              NUMERO_LINEA FOR ORDINALITY, -- Genera el numero de linea por posicion.
              ID_PRODUCTO VARCHAR2(100) PATH '$.productId',
              CANTIDAD NUMBER PATH '$.quantity',
              PRECIO_UNITARIO NUMBER PATH '$.price'
            )
          ) ARTICULO; -- Alias de las filas producidas por JSON_TABLE.
      ELSIF P_ENTIDAD = 'bank_accounts' THEN
        MERGE INTO MED_CUENTAS_BANCARIAS T -- Replica el saldo y la moneda de la cuenta.
        USING ( -- Extrae la clave y los atributos de la cuenta.
          SELECT JSON_VALUE(P_DATOS, '$.accountId') ID_CUENTA,
                 JSON_VALUE(P_DATOS, '$.balance' RETURNING NUMBER) SALDO,
                 JSON_VALUE(P_DATOS, '$.currency') MONEDA
            FROM DUAL -- Construye una fila fuente desde el JSON.
        ) S ON (T.ID_CUENTA = S.ID_CUENTA) -- Compara por accountId.
        WHEN MATCHED THEN UPDATE SET T.SALDO = S.SALDO, T.MONEDA = S.MONEDA -- Actualiza una cuenta existente.
        WHEN NOT MATCHED THEN INSERT (ID_CUENTA, SALDO, MONEDA) -- Inserta una cuenta nueva.
        VALUES (S.ID_CUENTA, S.SALDO, S.MONEDA); -- Asigna los valores extraidos.
      ELSIF P_ENTIDAD = 'bank_transactions' THEN
        MERGE INTO MED_TRANSACCIONES_BANCARIAS T -- Sincroniza un movimiento bancario.
        USING ( -- Extrae los datos de la transaccion del documento.
          SELECT JSON_VALUE(P_DATOS, '$.id') ID_TRANSACCION,
                 JSON_VALUE(P_DATOS, '$.accountId') ID_CUENTA,
                 JSON_VALUE(P_DATOS, '$.type') TIPO_TRANSACCION,
                 JSON_VALUE(P_DATOS, '$.amount' RETURNING NUMBER) MONTO,
                 JSON_VALUE(P_DATOS, '$.description') DESCRIPCION,
                 TO_TIMESTAMP_TZ(
                   REPLACE(JSON_VALUE(P_DATOS, '$.timestamp'), 'Z', '+00:00'),
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
                 ) FECHA_TRANSACCION, -- Convierte el timestamp ISO en fecha Oracle con zona.
                 JSON_VALUE(P_DATOS, '$.status') ESTADO
            FROM DUAL -- Produce la fila fuente para el MERGE.
        ) S ON (T.ID_TRANSACCION = S.ID_TRANSACCION) -- Identifica el movimiento por ID.
        WHEN MATCHED THEN UPDATE SET -- Actualiza los campos del movimiento existente.
          T.ID_CUENTA = S.ID_CUENTA, T.TIPO_TRANSACCION = S.TIPO_TRANSACCION,
          T.MONTO = S.MONTO, T.DESCRIPCION = S.DESCRIPCION,
          T.FECHA_TRANSACCION = S.FECHA_TRANSACCION, T.ESTADO = S.ESTADO
        WHEN NOT MATCHED THEN INSERT -- Crea el movimiento si no existe.
          (ID_TRANSACCION, ID_CUENTA, TIPO_TRANSACCION, MONTO, DESCRIPCION, FECHA_TRANSACCION, ESTADO)
        VALUES
          (S.ID_TRANSACCION, S.ID_CUENTA, S.TIPO_TRANSACCION, S.MONTO, S.DESCRIPCION, S.FECHA_TRANSACCION, S.ESTADO);
      ELSIF P_ENTIDAD = 'stock_alerts' THEN
        MERGE INTO MED_ALERTAS_STOCK T -- Replica el estado actual de alerta de cada producto.
        USING ( -- Extrae los datos y fechas de la alerta.
          SELECT JSON_VALUE(P_DATOS, '$.productId') ID_PRODUCTO,
                 JSON_VALUE(P_DATOS, '$.sku') SKU,
                 JSON_VALUE(P_DATOS, '$.productName') NOMBRE_PRODUCTO,
                 JSON_VALUE(P_DATOS, '$.stock' RETURNING NUMBER) STOCK,
                 JSON_VALUE(P_DATOS, '$.minStock' RETURNING NUMBER) STOCK_MINIMO,
                 JSON_VALUE(P_DATOS, '$.status') ESTADO,
                 TO_TIMESTAMP_TZ(
                   REPLACE(JSON_VALUE(P_DATOS, '$.createdAt'), 'Z', '+00:00'),
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
                 ) FECHA_CREACION, -- Convierte la fecha de creacion de la alerta.
                 TO_TIMESTAMP_TZ(
                   REPLACE(JSON_VALUE(P_DATOS, '$.updatedAt'), 'Z', '+00:00'),
                   'YYYY-MM-DD"T"HH24:MI:SS.FFTZH:TZM'
                 ) FECHA_ACTUALIZACION -- Convierte la ultima fecha de actualizacion.
            FROM DUAL -- Construye la fila fuente a partir del JSON.
        ) S ON (T.ID_PRODUCTO = S.ID_PRODUCTO) -- Usa el producto como clave de alerta.
        WHEN MATCHED THEN UPDATE SET -- Actualiza los datos de una alerta ya existente.
          T.SKU = S.SKU, T.NOMBRE_PRODUCTO = S.NOMBRE_PRODUCTO, T.STOCK = S.STOCK,
          T.STOCK_MINIMO = S.STOCK_MINIMO, T.ESTADO = S.ESTADO,
          T.FECHA_CREACION = S.FECHA_CREACION, T.FECHA_ACTUALIZACION = S.FECHA_ACTUALIZACION
        WHEN NOT MATCHED THEN INSERT -- Agrega una alerta que aun no existe en Oracle.
          (ID_PRODUCTO, SKU, NOMBRE_PRODUCTO, STOCK, STOCK_MINIMO, ESTADO, FECHA_CREACION, FECHA_ACTUALIZACION)
        VALUES
          (S.ID_PRODUCTO, S.SKU, S.NOMBRE_PRODUCTO, S.STOCK, S.STOCK_MINIMO, S.ESTADO, S.FECHA_CREACION, S.FECHA_ACTUALIZACION);
      ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Entidad de sincronizacion desconocida'); -- Evita ignorar entidades no soportadas.
      END IF;
    ELSE
      RAISE_APPLICATION_ERROR(-20002, 'Accion de sincronizacion desconocida'); -- Solo se admiten UPSERT y DELETE.
    END IF;
  END APLICAR_CAMBIO; -- Finaliza el procedimiento invocado por la API.
END MEDISTOCK_SINCRONIZACION; -- Finaliza el cuerpo del paquete.
/

-- Historial usado por el trigger de auditoria de stock.
CREATE TABLE MED_HISTORIAL_STOCK (
  ID_CAMBIO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Oracle genera un identificador por cambio.
  ID_PRODUCTO VARCHAR2(100) NOT NULL, -- Conserva el ID aunque el producto luego sea eliminado.
  SKU VARCHAR2(100) NOT NULL, -- SKU registrado al momento del cambio.
  NOMBRE_PRODUCTO VARCHAR2(255) NOT NULL, -- Nombre registrado al momento del cambio.
  STOCK_ANTERIOR NUMBER(18, 2), -- Existencias previas; es nulo en la insercion inicial.
  STOCK_NUEVO NUMBER(18, 2) NOT NULL, -- Existencias luego de la operacion.
  TIPO_CAMBIO VARCHAR2(10) NOT NULL CHECK (TIPO_CAMBIO IN ('INSERT', 'UPDATE')), -- Operacion que genero el registro.
  FECHA_CAMBIO TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL -- Fecha automatica del cambio.
); -- Finaliza la tabla de historial.

-- Acelera la consulta del historial de un producto ordenado por fecha.
CREATE INDEX MED_HIST_STOCK_PRODUCTO_FECHA_IX
  ON MED_HISTORIAL_STOCK (ID_PRODUCTO, FECHA_CAMBIO); -- Indice compuesto por producto y fecha.

-- Registra la insercion del producto y cada cambio real de stock.
CREATE OR REPLACE TRIGGER MED_PRODUCTOS_STOCK_AUD_TRG
AFTER INSERT OR UPDATE OF STOCK ON MED_PRODUCTOS -- Se dispara al insertar o modificar stock.
FOR EACH ROW -- Se ejecuta una vez por producto afectado.
BEGIN -- Inicia la logica del trigger.
  IF INSERTING THEN -- Guarda el stock inicial de un producto nuevo.
    INSERT INTO MED_HISTORIAL_STOCK (
      ID_PRODUCTO, SKU, NOMBRE_PRODUCTO, STOCK_ANTERIOR, STOCK_NUEVO, TIPO_CAMBIO
    ) VALUES (
      :NEW.ID_PRODUCTO, :NEW.SKU, :NEW.NOMBRE, NULL, :NEW.STOCK, 'INSERT'
    ); -- Inserta el registro inicial en el historial.
  ELSIF :NEW.STOCK <> :OLD.STOCK THEN -- Ignora actualizaciones que no cambian el stock.
    INSERT INTO MED_HISTORIAL_STOCK (
      ID_PRODUCTO, SKU, NOMBRE_PRODUCTO, STOCK_ANTERIOR, STOCK_NUEVO, TIPO_CAMBIO
    ) VALUES (
      :NEW.ID_PRODUCTO, :NEW.SKU, :NEW.NOMBRE, :OLD.STOCK, :NEW.STOCK, 'UPDATE'
    ); -- Registra el valor anterior y el nuevo.
  END IF; -- Finaliza la seleccion del tipo de operacion.
END MED_PRODUCTOS_STOCK_AUD_TRG; -- Finaliza el trigger de auditoria.
/

-- Agrupa las funciones y procedimientos de inventario usados en los ejemplos.
CREATE OR REPLACE PACKAGE MEDISTOCK_INVENTARIO AS
  TYPE T_IDS_PRODUCTO IS VARRAY(100) OF MED_PRODUCTOS.ID_PRODUCTO%TYPE; -- Lista ordenada de hasta 100 IDs.

  FUNCTION CALCULAR_VALOR_TOTAL RETURN NUMBER; -- Devuelve el valor total del stock disponible.

  -- Verifica que el producto exista y tenga stock suficiente para un pedido.
  PROCEDURE VALIDAR_STOCK_PEDIDO(
    P_ID_PRODUCTO IN MED_PRODUCTOS.ID_PRODUCTO%TYPE, -- ID del producto solicitado.
    P_CANTIDAD IN NUMBER -- Cantidad requerida por el pedido.
  );

  -- Agrega existencias a un unico producto.
  PROCEDURE REPONER_PRODUCTO(
    P_ID_PRODUCTO IN MED_PRODUCTOS.ID_PRODUCTO%TYPE, -- ID del producto que se repone.
    P_CANTIDAD IN NUMBER -- Cantidad que se agregara al stock.
  );

  -- Recorre un VARRAY y repone sus productos como una sola operacion.
  PROCEDURE REPONER_PRODUCTOS(
    P_IDS_PRODUCTO IN T_IDS_PRODUCTO, -- Lista de productos que se repondran.
    P_CANTIDAD IN NUMBER -- Cantidad que se agregara a cada producto.
  );

  -- Muestra los productos cuyo stock alcanzo el minimo; permite filtrar categoria.
  PROCEDURE LISTAR_STOCK_BAJO(
    P_CATEGORIA IN MED_PRODUCTOS.CATEGORIA%TYPE DEFAULT NULL -- NULL incluye todas las categorias.
  );

  PROCEDURE MOSTRAR_PEDIDOS; -- Lista pedidos y lineas mediante cursores anidados.
END MEDISTOCK_INVENTARIO; -- Finaliza la especificacion publica del paquete.
/

-- Implementa la funcion y los procedimientos declarados en la especificacion.
CREATE OR REPLACE PACKAGE BODY MEDISTOCK_INVENTARIO AS
  -- Suma el precio por cantidad de cada producto.
  FUNCTION CALCULAR_VALOR_TOTAL RETURN NUMBER IS
    V_VALOR_TOTAL NUMBER(38, 2); -- Almacena el valor agregado del inventario.
  BEGIN -- Inicia el calculo.
    SELECT NVL(SUM(PRECIO * STOCK), 0) -- Devuelve cero si no hay productos.
      INTO V_VALOR_TOTAL
      FROM MED_PRODUCTOS;

    RETURN V_VALOR_TOTAL; -- Entrega el total a quien invoco la funcion.
  END CALCULAR_VALOR_TOTAL; -- Finaliza la funcion.

  -- Aplica una validacion de stock y muestra excepciones de negocio descriptivas.
  PROCEDURE VALIDAR_STOCK_PEDIDO(
    P_ID_PRODUCTO IN MED_PRODUCTOS.ID_PRODUCTO%TYPE, -- Producto que se desea pedir.
    P_CANTIDAD IN NUMBER
  ) IS
    E_STOCK_INSUFICIENTE EXCEPTION; -- Excepcion definida para falta de existencias.
    V_STOCK MED_PRODUCTOS.STOCK%TYPE; -- Variable con el stock disponible.
  BEGIN -- Inicia la validacion.
    IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 THEN -- Rechaza cantidades no validas.
      RAISE_APPLICATION_ERROR(-20012, 'La cantidad solicitada debe ser mayor que cero');
    END IF;

    -- SELECT INTO obtiene el stock del producto o genera NO_DATA_FOUND.
    SELECT STOCK
      INTO V_STOCK
      FROM MED_PRODUCTOS
     WHERE ID_PRODUCTO = P_ID_PRODUCTO;

    IF V_STOCK < P_CANTIDAD THEN -- Comprueba que las existencias cubran el pedido.
      RAISE E_STOCK_INSUFICIENTE; -- Lanza la excepcion definida por el usuario.
    END IF;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN -- Traduce la ausencia del producto a un error controlado.
      RAISE_APPLICATION_ERROR(-20014, 'No existe el producto solicitado');
    WHEN E_STOCK_INSUFICIENTE THEN -- Informa que no hay unidades suficientes.
      RAISE_APPLICATION_ERROR(-20013, 'Stock insuficiente para el producto solicitado');
  END VALIDAR_STOCK_PEDIDO; -- Finaliza la validacion.

  -- Suma existencias; el trigger registra automaticamente el cambio en el historial.
  PROCEDURE REPONER_PRODUCTO(
    P_ID_PRODUCTO IN MED_PRODUCTOS.ID_PRODUCTO%TYPE, -- Producto que se actualizara.
    P_CANTIDAD IN NUMBER
  ) IS
  BEGIN -- Inicia la reposicion individual.
    IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 THEN -- Impide reposiciones nulas o negativas.
      RAISE_APPLICATION_ERROR(-20012, 'La cantidad de reposicion debe ser mayor que cero');
    END IF;

    UPDATE MED_PRODUCTOS
       SET STOCK = STOCK + P_CANTIDAD -- Incrementa las existencias actuales.
     WHERE ID_PRODUCTO = P_ID_PRODUCTO; -- Limita el cambio al producto indicado.

    IF SQL%ROWCOUNT = 0 THEN -- SQL%ROWCOUNT indica si se encontro y actualizo una fila.
      RAISE_APPLICATION_ERROR(-20014, 'No existe el producto que se intenta reponer');
    END IF;
  END REPONER_PRODUCTO; -- Finaliza la reposicion individual.

  -- Usa el VARRAY y un SAVEPOINT para que el lote se revierta si una reposicion falla.
  PROCEDURE REPONER_PRODUCTOS(
    P_IDS_PRODUCTO IN T_IDS_PRODUCTO, -- Coleccion ordenada de productos.
    P_CANTIDAD IN NUMBER
  ) IS
  BEGIN -- Inicia el procesamiento del lote.
    SAVEPOINT MEDISTOCK_REPONER_LOTE; -- Marca el punto al que se revertiran cambios del lote.
    IF P_IDS_PRODUCTO IS NULL OR P_IDS_PRODUCTO.COUNT = 0 THEN -- Rechaza una lista vacia.
      RAISE_APPLICATION_ERROR(-20015, 'Debe indicar al menos un producto para reponer');
    END IF;

    FOR I IN 1 .. P_IDS_PRODUCTO.COUNT LOOP -- Recorre los IDs por su indice.
      REPONER_PRODUCTO(P_IDS_PRODUCTO(I), P_CANTIDAD); -- Reutiliza las validaciones individuales.
    END LOOP; -- Finaliza el recorrido del VARRAY.
  EXCEPTION
    WHEN OTHERS THEN -- Si falla un producto, deshace todos los cambios de este lote.
      ROLLBACK TO MEDISTOCK_REPONER_LOTE; -- Conserva cualquier cambio previo al SAVEPOINT.
      RAISE; -- Propaga el error original al llamador.
  END REPONER_PRODUCTOS; -- Finaliza la reposicion por lote.

  -- Ejemplo de RECORD y cursor explicito parametrizado para filtrar stock bajo.
  PROCEDURE LISTAR_STOCK_BAJO(
    P_CATEGORIA IN MED_PRODUCTOS.CATEGORIA%TYPE DEFAULT NULL
  ) IS
    -- RECORD agrupa en una variable los campos de una fila del reporte.
    TYPE T_PRODUCTO_RECORD IS RECORD (
      ID_PRODUCTO MED_PRODUCTOS.ID_PRODUCTO%TYPE,
      SKU MED_PRODUCTOS.SKU%TYPE,
      NOMBRE MED_PRODUCTOS.NOMBRE%TYPE,
      STOCK MED_PRODUCTOS.STOCK%TYPE,
      STOCK_MINIMO MED_PRODUCTOS.STOCK_MINIMO%TYPE
    );
    -- Cursor parametrizado: recibe una categoria opcional y devuelve sus productos criticos.
    CURSOR C_PRODUCTOS_BAJO(P_FILTRO_CATEGORIA MED_PRODUCTOS.CATEGORIA%TYPE) IS
      SELECT ID_PRODUCTO, SKU, NOMBRE, STOCK, STOCK_MINIMO
        FROM MED_PRODUCTOS
       WHERE STOCK <= STOCK_MINIMO
         AND (P_FILTRO_CATEGORIA IS NULL OR CATEGORIA = P_FILTRO_CATEGORIA)
       ORDER BY NOMBRE;
    V_PRODUCTO T_PRODUCTO_RECORD; -- Registro donde se carga cada fila del cursor.
  BEGIN -- Inicia la consulta de stock bajo.
    OPEN C_PRODUCTOS_BAJO(P_CATEGORIA); -- Abre el cursor pasando el filtro recibido.
    LOOP -- Recorre los resultados fila por fila.
      FETCH C_PRODUCTOS_BAJO INTO V_PRODUCTO; -- Carga una fila en el RECORD.
      EXIT WHEN C_PRODUCTOS_BAJO%NOTFOUND; -- Sale cuando el cursor ya no tiene filas.

      -- Presenta SKU, nombre y niveles de stock del producto.
      DBMS_OUTPUT.PUT_LINE(
        V_PRODUCTO.SKU || ' | ' || V_PRODUCTO.NOMBRE ||
        ' | stock: ' || V_PRODUCTO.STOCK ||
        ' | minimo: ' || V_PRODUCTO.STOCK_MINIMO
      );
    END LOOP; -- Finaliza el recorrido de resultados.
    CLOSE C_PRODUCTOS_BAJO; -- Libera el cursor.
  EXCEPTION
    WHEN OTHERS THEN -- Asegura que el cursor se cierre aunque ocurra un error.
      IF C_PRODUCTOS_BAJO%ISOPEN THEN -- %ISOPEN comprueba si el cursor sigue abierto.
        CLOSE C_PRODUCTOS_BAJO; -- Cierra el cursor antes de propagar el error.
      END IF;
      RAISE; -- Mantiene visible el error original.
  END LISTAR_STOCK_BAJO; -- Finaliza el reporte de stock bajo.

  -- Ejemplo de cursores anidados: un cursor de detalles por cada pedido.
  PROCEDURE MOSTRAR_PEDIDOS IS
    CURSOR C_PEDIDOS IS -- Cursor externo que recorre los pedidos.
      SELECT ID_PEDIDO, FECHA_CREACION
        FROM MED_PEDIDOS
       ORDER BY FECHA_CREACION DESC;
    CURSOR C_DETALLES(P_ID_PEDIDO MED_PEDIDOS.ID_PEDIDO%TYPE) IS -- Cursor interno parametrizado por pedido.
      SELECT D.NUMERO_LINEA, D.ID_PRODUCTO, P.NOMBRE, D.CANTIDAD, D.PRECIO_UNITARIO
        FROM MED_DETALLE_PEDIDOS D
        LEFT JOIN MED_PRODUCTOS P ON P.ID_PRODUCTO = D.ID_PRODUCTO
       WHERE D.ID_PEDIDO = P_ID_PEDIDO
       ORDER BY D.NUMERO_LINEA;
  BEGIN -- Inicia el reporte de pedidos.
    FOR V_PEDIDO IN C_PEDIDOS LOOP -- El ciclo externo obtiene cada pedido.
      -- Muestra el encabezado antes de listar sus productos.
      DBMS_OUTPUT.PUT_LINE('Pedido ' || V_PEDIDO.ID_PEDIDO || ' | fecha: ' || V_PEDIDO.FECHA_CREACION);

      FOR V_DETALLE IN C_DETALLES(V_PEDIDO.ID_PEDIDO) LOOP -- El cursor interno recibe el ID actual.
        DBMS_OUTPUT.PUT_LINE(
          '  Linea ' || V_DETALLE.NUMERO_LINEA ||
          ' | producto: ' || NVL(V_DETALLE.NOMBRE, V_DETALLE.ID_PRODUCTO) ||
          ' | cantidad: ' || V_DETALLE.CANTIDAD ||
          ' | precio: ' || V_DETALLE.PRECIO_UNITARIO
        ); -- Muestra los datos de la linea del pedido.
      END LOOP; -- Finaliza los detalles del pedido actual.
    END LOOP; -- Finaliza el recorrido de pedidos.
  END MOSTRAR_PEDIDOS; -- Finaliza el reporte anidado.
END MEDISTOCK_INVENTARIO; -- Finaliza la implementacion del paquete.
/
