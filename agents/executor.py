from utils.zeroclaw import log_latency
import time

class ExecutorAgent:
    @log_latency
    def execute(self, context):
        """
        Ejecuta las acciones técnicas definidas en el plan de mitigación.
        """
        plan = context["mitigation"]["plan"]
        source_ip = context["metadata"]["source_ip"]
        
        actions_taken = []
        
        if "Block IP" in plan:
            self._call_waf_api(source_ip)
            actions_taken.append(f"IP {source_ip} blocked in WAF")
        
        if "Invalidate Session" in plan:
            self._invalidate_jwt(context["metadata"]["user_id"])
            actions_taken.append("User JWT invalidated in Redis")
            
        if not actions_taken:
            actions_taken.append("No technical execution needed")

        context["mitigation"]["action_executed"] = "; ".join(actions_taken)
        context["mitigation"]["status"] = "executed"
        
        print(f"[Agente 4] Ejecución completada: {'; '.join(actions_taken)}")
        return context

    def _call_waf_api(self, ip):
        # Simulación de comunicación con un WAF dentro de Maritime
        print(f"[Maritime Sandbox] [WAF] BLOQUEANDO IP: {ip}...")
        time.sleep(0.5) # Simula latencia de red real

    def _invalidate_jwt(self, user_id):
        # Simulación de invalidación de token
        print(f"[Maritime Sandbox] [Auth] INVALIDANDO JWT PARA USUARIO: {user_id}...")
