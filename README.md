# Confia Financeiro

**MEI simples.** Controle financeiro claro para microempreendedores.

Sistema de gestão financeira com lançamentos, contas a pagar/receber e conciliação por arquivo.

## Stack
- **Backend**: NestJS + MongoDB + JWT
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Estilo**: Clean / fintech, cor primária `#10B981`

## Funcionalidades V2
- CRUD de Categorias
- Contas a Pagar (com alerta de vencimento)
- Contas a Receber
- Visão mensal no Dashboard (entradas, saídas, saldo)
- Checklist de primeiros passos
- Busca, paginação e exportação PDF em Lançamentos
- Exclusão em lote
- Skeleton loading e mensagens orientativas

## Como rodar (tudo de uma vez)

```bash
chmod +x start.sh
./start.sh
```

Isso sobe o MongoDB, o backend e o frontend juntos.

## Como rodar (passo a passo)

```bash
docker-compose up -d
```

> **Se a porta 27017 já estiver em uso**, edite o `docker-compose.yml` e troque a porta para `27018:27017`.  
> Depois atualize o `backend/.env`:
> ```
> MONGODB_URI=mongodb://localhost:27018/certo-controle
> ```

Alternativa: use MongoDB Atlas e coloque a connection string no `.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edite o .env se necessário (MONGODB_URI e JWT_SECRET)
npm install
npm run start:dev
```

A API ficará disponível em **http://localhost:3001**

### 3. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

O sistema ficará disponível em **http://localhost:3000**

## Como usar

1. Acesse `http://localhost:3000` (landing page)
2. Clique em **Quero testar** ou **Começar grátis** e cadastre a empresa
3. Faça login
4. Crie lançamentos na tela **Lançamentos**
5. Vá em **Conciliação**, importe o arquivo `exemplo-extrato.csv` (ou um OFX real)
6. Veja os matches automáticos e faça conciliação manual se necessário
7. Acompanhe se o saldo ficou conciliado

## Formato do CSV esperado

```csv
data,descricao,valor
2024-10-01,Recebimento cliente,1500.00
2024-10-02,Pagamento fornecedor,-800.50
```

## Estrutura do projeto

```
certo-controle/
├── backend/          # NestJS (auth, companies, entries, reconciliation)
├── frontend/         # Next.js + Tailwind
├── docker-compose.yml
├── exemplo-extrato.csv
└── README.md
```

## Observações

- Dados são persistidos no MongoDB
- Autenticação via JWT
- Rotas do dashboard são protegidas
- Código organizado para fácil evolução

---

Desenvolvido com foco em clareza e confiança nos dados financeiros.
