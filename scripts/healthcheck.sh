#!/bin/bash
# Script de monitoreo y autorecuperación del backend
URL="http://localhost:3000/api/v1/health"
MAX_FAILURES=3
FAIL_COUNT_FILE="/tmp/yamboly_backend_fail_count"

# Inicializar contador si no existe
if [ ! -f "$FAIL_COUNT_FILE" ]; then
  echo 0 > "$FAIL_COUNT_FILE"
fi

CURRENT_FAILS=$(cat "$FAIL_COUNT_FILE")

echo "🔍 Verificando estado de salud del backend en: $URL ..."

# Realizar consulta HTTP
if wget --quiet --spider "$URL"; then
  echo "✅ Servidor backend saludable."
  echo 0 > "$FAIL_COUNT_FILE"
else
  CURRENT_FAILS=$((CURRENT_FAILS + 1))
  echo "$CURRENT_FAILS" > "$FAIL_COUNT_FILE"
  echo "⚠️ Intento de healthcheck fallido ($CURRENT_FAILS/$MAX_FAILURES)."

  if [ "$CURRENT_FAILS" -ge "$MAX_FAILURES" ]; then
    echo "🚨 El backend ha fallado $MAX_FAILURES veces consecutivas. Reiniciando contenedor backend de inmediato..."
    docker compose -f docker-compose.prod.yml restart backend
    echo 0 > "$FAIL_COUNT_FILE"
  fi
fi
