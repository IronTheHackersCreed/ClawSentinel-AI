import re
from utils.zeroclaw import log_latency

class AnomalyDetector:
    def __init__(self):
        # Patrones simples de SQL Injection para la demo
        self.sqli_patterns = [
            r"SELECT.*FROM",
            r"UNION.*SELECT",
            r"'.*OR.*'1'='1",
            r"--",
            r";.*DROP",
            r"WAITFOR DELAY"
        ]
        # Patrones de XSS
        self.xss_patterns = [
            r"<script.*?>",
            r"javascript:",
            r"onerror=",
            r"onload="
        ]

    @log_latency
    def analyze(self, context):
        """
        Analiza el payload y metadatos para detectar anomalías.
        """
        payload = context["metadata"]["payload"]
        score = 0.0
        threat = "Normal"

        # 1. Detección de SQL Injection
        for pattern in self.sqli_patterns:
            if re.search(pattern, payload, re.IGNORECASE):
                score = 0.95
                threat = "SQL Injection Detected"
                break
        
        # 2. Detección de XSS
        if threat == "Normal":
            for pattern in self.xss_patterns:
                if re.search(pattern, payload, re.IGNORECASE):
                    score = 0.85
                    threat = "XSS Attempt"
                    break

        # 3. Detección de anomalía de ruta
        if "/admin" in context["metadata"]["request_path"]:
            score = max(score, 0.80)
            threat = threat if score > 0.85 else "Unauthorized Path Access"

        context["analysis"]["anomaly_score"] = score
        context["analysis"]["threat_type"] = threat
        
        print(f"[Agente 1] Análisis completado. Score: {score} | Amenaza: {threat}")
        return context
