# 🚀 Hoja de Ruta: Incident Response AI (Caso BCP)

## 📋 Resumen del Proyecto
Desarrollo de un sistema de respuesta ante incidentes basado en agentes de IA para automatizar la detección, diagnóstico y mitigación de ciberataques en la banca móvil, optimizando la eficiencia del SOC (Security Operations Center).

---

## 🏗️ Fases del Proyecto

### **Fase 1: Cimientos y Setup (Horas 1-3)**
* **Arquitecto / DevOps:** Configurar el entorno con **Maritime**. Definir el esquema JSON del "Incidente" (metadatos: IP, UserID, Nivel de Riesgo, Payload).
* **Data Engineer:** Crear un generador de logs sintéticos que simule tráfico normal de banca móvil y ataques reales (**SQL Injection**).
* **Frontend:** Inicializar el boilerplate en **React/Next.js** con **Shadcn/ui** y configurar el dashboard base.

### **Fase 2: Desarrollo de Agentes (Horas 4-10)**
* **Backend A (Agentes 1 y 2):**
    * **Agente 1:** Implementar el detector de anomalías.
    * **Agente 2:** Consultar "base de datos de reputación" (simulada) para confirmar la causa raíz.
    * **Integración:** Conexión vía **ZeroClaw** para asegurar latencia mínima.
* **Backend B (Agentes 3 y 4):**
    * **Agente 3 (Playbook):** Lógica de decisión. Si Riesgo > 80% → Bloqueo automático. Si es menor → Notificación.
    * **Agente 4 (Action):** Scripts de simulación de bloqueo (IP en WAF o invalidación de tokens JWT).
    * **Integración:** Orquestación del flujo completo con **OpenClaw**.

### **Fase 3: Visualización e Interfaz (Horas 11-15)**
* **Frontend:**
    * **Live Incident Feed:** Lista de eventos actualizada en tiempo real mediante WebSockets o Polling.
    * **Visualización de Flujo:** Gráfico interactivo que muestra cómo el mensaje viaja del Agente 1 al 4.
    * **Human-in-the-loop:** Botón de "Aprobar Acción" para demostrar seguridad controlada por humanos en casos críticos.

### **Fase 4: Pulido y Pitch (Horas 16-Final)**
* **QA & Test:** Pruebas *End-to-End* (Lanzar ataque → Ver respuesta automatizada en segundos).
* **Líder de Proyecto:** Preparar el pitch enfocado en métricas de valor para el **BCP**:
    * **Reducción del MTTR:** De 30 min (manual) a 5 segundos (AI).
    * **Escalabilidad:** Procesar millones de alertas sin aumentar el personal del SOC.
    * **Costo:** Ahorro en infraestructura y prevención de pérdidas por fraude.

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos
- Python 3.10+
- Node.js 18+

### Paso 1: Iniciar Backend
```bash
pip install -r requirements.txt
python main.py
```

### Paso 2: Iniciar Frontend (Dashboard)
```bash
cd dashboard
npm install
npm run dev
```

> **Nota:** En Windows puedes usar el script `start_clawsentinel.ps1` para lanzar ambos servicios automáticamente.

---

## 🏆 Valor Agregado para el BCP
- **Reducción del MTTR:** De minutos de análisis manual a **menos de 1 segundo** de respuesta autónoma.
- **Stack SundAI:** Uso de orquestación ZeroClaw/OpenClaw para latencia ultra-baja.
- **Seguridad Maritime:** Entorno aislado para la ejecución de cambios en red.

---

## 🛠️ Distribución Final de Agentes
1. **Agente 1 (Detector):** Análisis de patrones (SQLi, XSS, Path Anomalies).
2. **Agente 2 (Root Cause):** Validación mediante reputación de IP e historial.
3. **Agente 3 (Planner):** Generación de estrategias de mitigación dinámicas.
4. **Agente 4 (Executor):** Ejecución en WAF y sistemas de identidad.

---
> Proyecto desarrollado para la Hackathon de Ciberseguridad BCP 2026.