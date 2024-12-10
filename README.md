# Password Manager Application

Este proyecto es un gestor de contraseñas diseñado para almacenar, generar y compartir contraseñas de forma segura utilizando tecnologías modernas como **FastAPI** en el backend y **React** en el frontend. 

## Prerrequisitos

Asegúrate de tener instalados los siguientes programas antes de comenzar:
- **Python** (versión 3.8 o superior)
- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)
- **Git**

## Instrucciones para ejecutar el proyecto

Sigue estos pasos para clonar, configurar y ejecutar el proyecto.

### 1. Clonar el repositorio

1. Abre una terminal y ejecuta:
   ```bash
   git clone https://github.com/mansep12/password-manager.git
   ```
2. Accede al directorio del proyecto:
   ```bash
   cd password-manager
   ```

### 2. Configurar y ejecutar el backend

1. Cambia al directorio del backend:
   ```bash
   cd backend
   ```

2. Crea un entorno virtual (opcional, pero recomendado):
   ```bash
   python -m venv env
   ```

3. Activa el entorno virtual:
   - En **Windows**:
     ```bash
     .\env\Scripts\activate
     ```
   - En **macOS/Linux**:
     ```bash
     source env/bin/activate
     ```

4. Instala las dependencias del backend:
   ```bash
   pip install -r requirements.txt
   ```

5. Inicia el servidor de desarrollo de FastAPI:
   ```bash
   uvicorn main:app --reload
   ```

6. Se puede acceder a la pseudo documentación de la API en tu navegador:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
---

### 3. Configurar y ejecutar el frontend

1. Cambia al directorio del frontend:
   ```bash
   cd ../frontend
   ```

2. Instala las dependencias del frontend:
   ```bash
   npm install
   ```

3. Configura la variable de entorno para la URL del backend:
   - Crea un archivo `.env` en el directorio `frontend` y agrega:
     ```
     VITE_API_URL=http://127.0.0.1:8000
     ```

4. Inicia el servidor de desarrollo de React:
   ```bash
   npm run dev
   ```

5. Accede al frontend en tu navegador:
   - [http://localhost:5173/](http://localhost:5173/)

