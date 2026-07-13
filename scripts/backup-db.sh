#!/bin/bash
# Script de copia de seguridad diaria de PostgreSQL con rotación de 7 días
set -e

BACKUP_DIR="./backups/db"
RETENTION_DAYS=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/yamboly_db_backup_$TIMESTAMP.sql.gz"

echo "🚀 Iniciando copia de seguridad de la base de datos..."
mkdir -p "$BACKUP_DIR"

# Ejecutar pg_dump a través de Docker y comprimir el output
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U yamboly -d yamboly_db | gzip > "$BACKUP_FILE"

echo "💾 Copia de seguridad guardada exitosamente en: $BACKUP_FILE"

# Eliminar copias de seguridad antiguas (rotación de 7 días)
echo "🧹 Ejecutando rotación de archivos. Eliminando backups con más de $RETENTION_DAYS días de antigüedad..."
find "$BACKUP_DIR" -type f -name "yamboly_db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ ¡Copia de seguridad y rotación completadas con éxito!"
