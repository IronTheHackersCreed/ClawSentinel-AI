import time
import uuid

def log_latency(func):
    """Simula la medición de latencia de ZeroClaw."""
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000
        print(f"[ZeroClaw] Latencia en {func.__name__}: {latency_ms:.4f}ms")
        return result
    return wrapper

def generate_incident_context(source_ip, user_id, path, payload, request_rate=1):
    """Genera el esquema de datos unificado del incidente."""
    return {
        "incident_id": str(uuid.uuid4()),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "metadata": {
            "source_ip": source_ip,
            "user_id": user_id,
            "request_path": path,
            "payload": payload,
            "request_rate": request_rate
        },
        "analysis": {
            "anomaly_score": 0.0,
            "threat_type": None,
            "is_confirmed": False,
            "root_cause": None
        },
        "mitigation": {
            "plan": None,
            "action_executed": None,
            "status": "pending"
        }
    }
