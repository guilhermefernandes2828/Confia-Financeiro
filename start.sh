#!/bin/bash
# Inicia todo o Confia Financeiro de uma vez
# Uso: ./start.sh

echo "🚀 Iniciando Confia Financeiro..."

# 1. Sobe o MongoDB
echo "📦 Subindo MongoDB..."
docker-compose up -d

# Aguarda o banco ficar pronto
sleep 3

# 2. Backend
echo "⚙️  Iniciando backend..."
cd backend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run start:dev &
BACKEND_PID=$!
cd ..

# 3. Frontend
echo "🎨 Iniciando frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Sistema iniciado!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Pressione Ctrl+C para parar tudo."

# Espera os processos
wait $BACKEND_PID $FRONTEND_PID
