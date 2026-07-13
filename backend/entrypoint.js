const { execSync, spawn } = require('child_process');

console.log("Esperando a PostgreSQL...");
let success = false;

for (let i = 1; i <= 30; i++) {
  try {
    console.log(`Intento ${i}/30 - ejecutando migraciones...`);
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    success = true;
    break;
  } catch (err) {
    console.log("PostgreSQL no está listo aún, esperando 2 segundos...");
    // Synchronous sleep in node (block event loop for 2s)
    const stop = Date.now() + 2000;
    while (Date.now() < stop) {}
  }
}

if (!success) {
  console.error("No se pudo conectar a PostgreSQL");
  process.exit(1);
}

console.log("Ejecutando seed...");
try {
  execSync('npx prisma db seed', { stdio: 'inherit' });
} catch (err) {
  console.error("Error al ejecutar seed:", err.message);
}

console.log("Iniciando servidor de Yámboly Backend...");
const server = spawn('node', ['dist/server.js'], { stdio: 'inherit' });
server.on('exit', (code) => {
  process.exit(code || 0);
});
