# Guía de Despliegue en Producción — Yámboly MVP

Esta guía detalla los pasos para desplegar la infraestructura de **Yámboly MVP** en un Servidor Privado Virtual (VPS).

---

## 📋 Requisitos Mínimos del Servidor
* **Sistema Operativo**: Ubuntu 22.04 LTS o superior (recomendado).
* **Especificaciones de Hardware**:
  * 2 GB de Memoria RAM (mínimo, para compilación fluida de Vite/React).
  * 1 CPU vCore.
  * 20 GB de almacenamiento SSD/NVMe.
* **Software Requerido**:
  * Docker Engine v24.0.0 o superior.
  * Docker Compose v2.0.0 o superior.
  * Git.

---

## ⚙️ Configuración Inicial del VPS

### 1. Actualizar el Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker y Docker Compose
Sigue la guía oficial de Docker o instala mediante repositorio de APT:
```bash
# Instalar prerequisitos
sudo apt install -y ca-certificates curl gnupg

# Agregar clave GPG oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Agregar el repositorio de APT
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 🚀 Pasos para el Despliegue

### 1. Clonar el Repositorio
```bash
git clone https://github.com/DrkonVilla/Yamboly-mvp.git
cd Yamboly-mvp
```

### 2. Configurar Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz del proyecto basándote en el archivo de plantilla `.env.example`:
```bash
cp .env.example .env
nano .env
```
Completa las variables necesarias para producción:
```env
# Configuración del servidor y BD
DATABASE_URL="postgresql://yamboly_prod:SecurePassword2026@db:5432/yamboly_db_prod"
JWT_SECRET="TuSecretKeySuperSegura2026!!!"
PORT=3000

# Canal de Origen permitido para CORS (dominio del Frontend)
CORS_ORIGIN="https://tudominio.com"

# URL de la API del backend utilizada por Vite durante la compilación
VITE_API_URL="https://tudominio.com/api/v1"
```

### 3. Otorgar permisos de ejecución al script
```bash
chmod +x deploy.sh
chmod +x scripts/backup-db.sh
chmod +x scripts/healthcheck.sh
```

### 4. Ejecutar el script de despliegue
```bash
./deploy.sh
```
El script descargará, compilará las imágenes de producción, aplicará las migraciones a la BD y levantará el sistema con redirecciones robustas.

---

## 🔒 Configuración de SSL / HTTPS (Certbot)

Se recomienda utilizar Nginx con Certbot para configurar HTTPS de forma automática y gratuita.

1. Instala Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. Ejecuta Certbot para obtener y configurar el certificado SSL de Let's Encrypt para tu dominio:
```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

3. Certbot modificará tu configuración de Nginx para redirigir todo el tráfico HTTP a HTTPS de manera automática y configurar la renovación periódica.

---

## 🛠️ Solución de Problemas Comunes

### ❌ Error: Puertos ocupados (e.g. puerto 80 o 5432 ya en uso)
* **Síntoma**: Docker Compose falla al levantar los servicios debido a puertos en conflicto.
* **Solución**: Identifica qué proceso está usando el puerto y deténlo:
  ```bash
  sudo lsof -i :80
  # Si es un nginx nativo del VPS:
  sudo systemctl stop nginx
  sudo systemctl disable nginx
  ```

### ❌ Error: No se puede conectar a la base de datos (Database connection timed out)
* **Síntoma**: El contenedor backend no arranca y lanza error de Prisma.
* **Solución**: Verifica que el contenedor de la base de datos `db` esté corriendo y que las credenciales del `.env` sean idénticas a las configuradas en el servicio de BD de `docker-compose.prod.yml`.

### ❌ Error: Vite lanza error out of memory
* **Síntoma**: Durante `npm run build`, la compilación se congela en servidores con 1GB RAM o menos.
* **Solución**: Configura un archivo Swap en tu VPS para ampliar la memoria disponible de manera virtual:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
