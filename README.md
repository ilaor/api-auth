# API AUTH + Taller Crypt

Proyecto desarrollado para la asignatura de **Sistemas Distribuidos**. Este proyecto implementa un servicio web REST con autenticación, autorización mediante **JWT** y cifrado de contraseñas utilizando **bcrypt**. Se incluye además un taller de criptografía aplicado a la gestión segura de usuarios.

---

## 📌 ENDPOINTS

| Verbo HTTP | Ruta | Descripción |
| :----- | :---------------| :-------------- |
| `POST` | `/api/auth/reg` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `GET` | `/api/auth` | Obtener usuarios (requiere token) |
| `GET` | `/api/auth/me` | Obtener usuario autenticado |
| `GET` | `/api/user` | Listado de usuarios |
| `PUT` | `/api/user/{id}` | Modificar usuario |
| `DELETE` | `/api/user/{id}` | Eliminar usuario |

---

## 🚀 Comenzando

_Estas instrucciones permiten ejecutar el proyecto en local._

### 📋 Pre-requisitos
* **Node.js**
* **npm**
* **MongoDB**
* **Git**
* **Postman**

**En macOS:**
```bash
brew install node
brew install mongodb-community

Iniciar MongoDB:

Bash
brew services start mongodb-community
🔧 Instalación
Clonar repositorio:

Bash
git clone [https://github.com/ilaor/api-auth.git](https://github.com/ilaor/api-auth.git)
Entrar en carpeta:

Bash
cd api-auth
Instalar dependencias:

Bash
npm install
Ejecutar servidor:

Bash
npm start
Servidor activo en: http://localhost:4100

📯 Pruebas con Postman
    Abrir Postman

    Importar archivo: api-auth.postman_collection.json

    Ejecutar en orden:

    Registro: POST /api/auth/reg

    Login: POST /api/auth/login

    Copiar el token obtenido.

    Requests protegidos: Añadir el siguiente header:

    HTTP
    Authorization: Bearer TU_TOKEN



📦 Despliegue
    Requisitos:
        Node.js
        MongoDB
        Recomendado:
        Variables de entorno
        HTTPS
        Docker

🛠️ Construido con
    Express - Framework web
    MongoDB / mongojs - Base de datos
    bcrypt - Cifrado de contraseñas
    jwt-simple - Autenticación JWT
    moment - Gestión de tiempo
    cors / helmet / morgan - Seguridad y logs
    nodemon - Entorno de desarrollo

📌 Versionado
    v1.0.0 → API básica
    v2.0.0 → CRUD
    v3.0.0 → MongoDB
    v4.0.0 → Seguridad con token
    v5.0.0 → JWT + autenticación

✒️ Autores
    Paco Maciá
    Ivan Lara