#!/bin/sh
echo "Esperando a PostgreSQL..."
for i in $(seq 1 30); do
  npx prisma migrate deploy 2>/dev/null && break
  echo "Intento $i/30 - esperando a PostgreSQL..."
  sleep 2
done

echo "Ejecutando seed..."
npx prisma db seed 2>/dev/null
echo "Iniciando servidor..."
node dist/server.js
