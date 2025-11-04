# ImobConvex Backend (FastAPI)

API central do ecossistema ImobConvex, pronta para receber o portal público, painel administrativo e fluxos de CRM com IA.

## Requisitos
- Python 3.11+
- Banco de dados compatível com SQLAlchemy (PostgreSQL recomendado, SQLite para desenvolvimento)

## Configuração rápida
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
cp .env.example .env
uvicorn app.main:app --reload
```

> **Dica:** Ajuste `DATABASE_URL` no `.env` para apontar para seu Postgres ou use o default SQLite (`sqlite:///./imobconvex.db`) durante o desenvolvimento.

## Endpoints principais
- `POST /api/v1/auth/login` — autenticação via OAuth2
- `POST /api/v1/properties` — cadastro de imóveis (admin)
- `GET /api/v1/properties` — listagem pública com filtros
- `POST /api/v1/leads` — captura de leads com enriquecimento automático
- `GET /api/v1/leads` — visão administrativa (requer token)

A documentação interativa está disponível em `/api/v1/docs`.

## Inicialização do administrador
O usuário administrador inicial é criado automaticamente na primeira execução com as credenciais definidas em `FIRST_SUPERUSER_EMAIL` e `FIRST_SUPERUSER_PASSWORD`.

## Estrutura de pastas
```
app/
  api/             # routers e endpoints REST
  core/            # configurações e segurança
  db/              # engine, sessões e dados iniciais
  models/          # modelos SQLModel
  schemas/         # contratos Pydantic
  services/        # regras de negócio (ex: scoring de leads)
```

## Próximos passos sugeridos
- Adicionar testes automatizados para cenários críticos.
- Criar webhooks para notificações externas (WhatsApp, N8N).
- Evoluir o serviço de IA para consumir modelos proprietários ou OpenAI.
