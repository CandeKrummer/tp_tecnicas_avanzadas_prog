# tp_tecnicas_avanzadas_prog

# Sistema de Apuestas de Caballos - TP Tecnicas Avanzadas de Programación

## Descripción

Este proyecto es un sistema para gestionar apuestas de caballos, que incluye la creación de usuarios, caballos, carreras, apuestas y la gestión de los resultados. El sistema utiliza Node.js, Express y MongoDB.

## Cómo instalarlo

1. Clonar el repositorio:
   ```
   git clone <url-del-repositorio>
   ```
2. Abrir la consola y ejecutar:
   ```
   npm install
   ```
3. Configurar las variables locales en un archivo `.env` (ver más abajo para los valores requeridos).
4. Lanzar el servidor con:
   ```
   npm index.js
   ```

## Variables de entorno

Asegúrate de configurar las siguientes variables en un archivo `.env`:

```
PORT=5000
MONGO_URI=<tu-uri-de-conexion-a-mongodb>
```

## Métodos de la API

### **Login**

#### `POST /auth/login`
Autenticación de usuario. Recibe el correo electrónico y la contraseña, y devuelve un token.

**Body:**
```json
{
    "mail": "usuario@dominio.com",
    "password": "contraseña"
}
```

**Respuesta:**
- 200: Devuelve un token para acceder a métodos protegidos de la API.
- 401: No autorizado.

### **Registro**

#### `POST /registro`
Permite crear un nuevo usuario.

**Body:**
```json
{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "mail": "juan@dominio.com",
    "role": "apostador",
    "password": "contraseña",
    "medioDePago": "Tarjeta de Crédito"
}
```

**Respuesta:**
- 201: Usuario creado correctamente.
- 409: Conflicto (el usuario ya existe).
- 500: Error en la creación del usuario.

### **Métodos GET**

#### `GET /usuarios`
Devuelve una lista de usuarios. Requiere token de autorización.

**Parámetros opcionales:**
- `limit`: Número máximo de resultados.
- `offset`: Paginación (salto de resultados).

#### `GET /usuarioById/:id`
Devuelve un usuario por ID.

#### `GET /caballos`
Devuelve una lista de caballos. Requiere autenticación.

#### `GET /carreras`
Devuelve una lista de carreras. Requiere autenticación.

#### `GET /proximas-carreras`
Devuelve las próximas carreras. No requiere autenticación.

#### `GET /total-apostado/:idCarrera`
Devuelve el total apostado en una carrera específica.

### **Métodos POST**

#### `POST /apostar`
Permite hacer una apuesta en una carrera.

**Body:**
```json
{
    "monto": 100,
    "idApostador": "60d5f49b2e2b5f3c84e4e601",
    "idCarrera": "60d5f49b2e2b5f3c84e4e602",
    "idCaballo": "60d5f49b2e2b5f3c84e4e603"
}
```

**Respuesta:**
- 201: Apuesta registrada.
- 400: Error de validación (monto inválido, faltan parámetros).
- 500: Error en la creación de la apuesta.

#### `POST /crear-caballo`
Crea un nuevo caballo. Requiere rol de administrador.

**Body:**
```json
{
    "nombreCaballo": "Relámpago",
    "nombreJinete": "Juan Pérez"
}
```

**Respuesta:**
- 201: Caballo creado correctamente.
- 409: Conflicto (caballo ya existe).
- 500: Error en la creación del caballo.

#### `POST /crear-carrera`
Crea una nueva carrera. Requiere rol de administrador.

**Body:**
```json
{
    "fecha": "2024-12-01T10:00:00Z",
    "estado": "Pendiente",
    "listaCaballos": ["60d5f49b2e2b5f3c84e4e603", "60d5f49b2e2b5f3c84e4e604"]
}
```

**Respuesta:**
- 201: Carrera creada correctamente.
- 409: Conflicto (problemas con los datos de la carrera).
- 500: Error en la creación de la carrera.

#### `POST /cargar-ganador`
Permite cargar el ganador de una carrera y calcular las ganancias. Requiere rol de administrador.

**Body:**
```json
{
    "idCarrera": "60d5f49b2e2b5f3c84e4e602",
    "idCaballoGanador": "60d5f49b2e2b5f3c84e4e603"
}
```

**Respuesta:**
- 200: Ganador cargado y ganancias calculadas.
- 500: Error al cargar el ganador.

### **Métodos DELETE**

#### `DELETE /eliminar-apuesta`
Elimina una apuesta. Requiere rol de administrador.

**Body:**
```json
{
    "idApuesta": "60d5f49b2e2b5f3c84e4e605"
}
```

**Respuesta:**
- 200: Apuesta eliminada.
- 500: Error al eliminar la apuesta.

#### `DELETE /eliminar-caballo`
Elimina un caballo. Requiere rol de administrador.

**Body:**
```json
{
    "idCaballo": "60d5f49b2e2b5f3c84e4e603"
}
```

**Respuesta:**
- 200: Caballo eliminado.
- 500: Error al eliminar el caballo.

## Estructura de la Base de Datos

La base de datos está organizada en colecciones para cada entidad:

- **Usuarios**: Almacena la información de los usuarios (nombre, apellido, correo, rol, etc.).
- **Caballos**: Almacena los caballos participantes.
- **Carreras**: Almacena la información de las carreras.
- **Apuestas**: Almacena las apuestas realizadas por los usuarios.

## Autor

Este proyecto fue desarrollado por Candela Krummer Mateos.
