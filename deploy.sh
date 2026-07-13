#!/bin/bash
# Script de despliegue para Yámboly MVP en VPS
set -e

echo "🚀 Iniciando despliegue de Yámboly MVP..."

# 1. Actualizar código del repositorio
echo "📥 Actualizando repositorio git..."
git pull origin main

# 2. Reconstruir e iniciar contenedores de Docker
echo "🐳 Levantando contenedores de Docker en producción..."
docker compose -f docker-compose.prod.yml down --remove-orphans
docker compose -f docker-compose.prod.yml up --build -d

# 3. Correr migraciones de Prisma en backend
echo "⚙️ Ejecutando migraciones de Prisma en backend..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# 4. Limpieza de imágenes/volúmenes antiguos e inactivos
echo "🧹 Limpiando imágenes y recursos no utilizados de Docker..."
docker system prune -f

# 5. Notificación de éxito
echo "✅ ¡Despliegue completado con éxito!"
