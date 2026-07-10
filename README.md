# Yámboly MVP - e-business

## Requisitos
- Node.js 20+
- PostgreSQL 16+
- npm o pnpm

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con las credenciales de PostgreSQL
npm run db:migrate
npm run db:seed
npm run dev