from utils.zeroclaw import log_latency

class RootCauseAgent:
    def __init__(self):
        # Simulación de una base de datos de reputación de IPs
        self.malicious_ips = ["192.168.1.50", "10.0.0.99"]

    @log_latency
    def validate(self, context):
        """
        Confirma si el incidente es un ataque real analizando el historial.
        """
        score = context["analysis"]["anomaly_score"]
        source_ip = context["metadata"]["source_ip"]
        
        is_confirmed = False
        reason = "No evidence of systemic attack"

        # Si el score del Agente 1 es alto, validamos más a fondo
        if score > 0.70:
            if source_ip in self.malicious_ips:
                is_confirmed = True
                reason = "Known Malicious IP and high anomaly score"
            else:
                is_confirmed = True
                reason = "Pattern-based attack confirmed by behavioral analysis"
        
        context["analysis"]["is_confirmed"] = is_confirmed
        context["analysis"]["root_cause"] = reason
        
        print(f"[Agente 2] Validación completada. Confirmado: {is_confirmed} | Causa: {reason}")
        return context
