# Fase 1: Construir el frontend de React con Vite
FROM node:18-alpine AS frontend-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm install
COPY dashboard/ ./
RUN npm run build

# Fase 2: Configurar el backend en Python y unir todo
FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias del sistema requeridas para algunos paquetes Python si es necesario
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY main.py .
COPY agents/ agents/
COPY utils/ utils/

# Copiar el frontend compilado desde la Fase 1
COPY --from=frontend-builder /app/dashboard/dist /app/dashboard/dist

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
