from utils.zeroclaw import log_latency

class ResponsePlannerAgent:
    def __init__(self):
        # Mapeo de amenazas a acciones recomendadas
        self.strategy_map = {
            "SQL Injection Detected": "Block IP and Invalidate Session JWT",
            "XSS Attempt": "Block IP",
            "Unauthorized Path Access": "Invalidate Session and Escalate to SOC",
            "Brute Force Attempt": "Add IP to Temporary Deny List",
            "Normal": "Log and Monitor"
        }

    @log_latency
    def plan(self, context):
        """
        Genera un plan de mitigación basado en el análisis previo.
        """
        threat_type = context["analysis"]["threat_type"]
        is_confirmed = context["analysis"]["is_confirmed"]
        
        # Estrategia por defecto
        plan = "No action required"
        
        if is_confirmed:
            plan = self.strategy_map.get(threat_type, "Escalate to Human Security Analyst")
        elif context["analysis"]["anomaly_score"] > 0.6:
            plan = "Monitor Closely and Notify Admin"
            
        context["mitigation"]["plan"] = plan
        
        print(f"[Agente 3] Plan generado: {plan}")
        return context
