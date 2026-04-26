from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agents.anomaly_detector import AnomalyDetector
from agents.root_cause import RootCauseAgent
from agents.response_planner import ResponsePlannerAgent
from agents.executor import ExecutorAgent
from utils.zeroclaw import generate_incident_context
import uvicorn
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="ClawSentinel-AI Orchestrator (OpenClaw)")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de agentes
agente_1 = AnomalyDetector()
agente_2 = RootCauseAgent()
agente_3 = ResponsePlannerAgent()
agente_4 = ExecutorAgent()

@app.get("/api/health")
async def root():
    return {"status": "OpenClaw Orchestrator is Running", "target": "BCP SOC Optimization"}

@app.post("/ingest")
async def ingest_logs(request: Request):
    """
    Simula la ingesta de logs y orquestación completa (Fases 1-4).
    """
    try:
        data = await request.json()
    except Exception:
        data = {}
    
    # PASO 1: Generar Contexto Unificado
    context = generate_incident_context(
        source_ip=data.get("ip", "0.0.0.0"),
        user_id=data.get("user_id", "anonymous"),
        path=data.get("path", "/"),
        payload=data.get("payload", "")
    )
    
    print(f"\n[OpenClaw] INICIO DE ORQUESTACIÓN: {context['incident_id']}")
    
    # PASO 2: AGENTE 1 - Detección de Anomalías
    context = agente_1.analyze(context)
    
    # PASO 3: AGENTE 2 - Análisis de Causa Raíz
    if context["analysis"]["anomaly_score"] > 0.5:
        context = agente_2.validate(context)
        
        # PASO 4: AGENTE 3 - Planificación de Respuesta
        if context["analysis"]["is_confirmed"]:
            context = agente_3.plan(context)
            
            # PASO 5: AGENTE 4 - Ejecución de Mitigación
            context = agente_4.execute(context)
    
    print(f"[OpenClaw] FIN DE ORQUESTACIÓN. Estatus: {context['mitigation']['status']}")
    
    return {
        "message": "Flujo de Respuesta Autónoma Completado",
        "incident_id": context["incident_id"],
        "threat": context["analysis"]["threat_type"],
        "action": context["mitigation"]["action_executed"],
        "full_context": context
    }

# Servir el frontend de React si existe la carpeta compilada
dist_path = os.path.join(os.path.dirname(__file__), "dashboard", "dist")
if os.path.isdir(dist_path):
    # Montar los assets estáticos (JS, CSS, imágenes)
    assets_path = os.path.join(dist_path, "assets")
    if os.path.isdir(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    # Catch-all para servir el index.html de React en cualquier ruta no de API
    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        if catchall.startswith("api/") or catchall == "ingest":
            return {"error": "Endpoint no encontrado"}
        index_file = os.path.join(dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend no compilado"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
