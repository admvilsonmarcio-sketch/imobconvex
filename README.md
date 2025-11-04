# ImobConvex

Plataforma imobiliária inteligente que combina portal público, painel administrativo e API com qualificação automatizada de leads. Este repositório contém um MVP funcional construído em FastAPI (backend) e Next.js (frontend).

> 📚 Documentação detalhada de arquitetura e visão de produto: [`docs/solution_blueprint.md`](docs/solution_blueprint.md)
> 🗺️ Relatório de status para implantação: [`docs/status_implantacao.md`](docs/status_implantacao.md)

## Estrutura do repositório

- `backend/` — API em FastAPI + SQLModel com autenticação JWT e serviços de scoring determinístico.
- `frontend/` — Portal Next.js com captura de leads e painel administrativo básico.
- `docs/` — Documentação técnica (blueprint completo + relatório de status).

## Como executar localmente

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
uvicorn app.main:app --reload
```

A API ficará disponível em `http://localhost:8000` com documentação em `http://localhost:8000/api/v1/docs`.

### Frontend (Next.js)

```bash
cd frontend
npm install           # ou yarn/pnpm se preferir
cp .env.example .env.local
npm run dev
```

O portal será servido em `http://localhost:3000` e já consome a API configurada no backend.

## Estado atual do MVP

| Área | Status | O que já funciona | Lacunas principais |
| --- | --- | --- | --- |
| Portal público | ✅ | Listagem de imóveis com filtros básicos, página detalhada, formulário inteligente de leads | Falta mapa interativo, favoritos, comparador, SEO avançado, tour 360° |
| Painel administrativo | 🟡 | Login com JWT, cadastro/remoção de imóveis, lista de leads com score sugerido | Não há edição completa, atribuição de corretores, automações, múltiplos perfis |
| API/Backend | 🟡 | Autenticação, CRUD de imóveis, captura e enriquecimento determinístico de leads, seed de superusuário | Ausência de testes automatizados, notificações externas, integração com IA real, auditoria |
| IA/Automação | 🔸 | Score baseado em regras e recomendações simples | Não há modelos treinados, integrações com OpenAI/N8N, previsão real de conversão |
| Operações/Infra | 🔸 | Configuração manual via `.env`, criação automática das tabelas SQLite/Postgres | Falta Docker, CI/CD, monitoramento, scripts de migração e rollback |

Legenda: ✅ pronto · 🟡 utilizável porém incompleto · 🔸 rascunho/protótipo

## Checklist para implantação inicial

1. **Banco de dados** — Ajustar `DATABASE_URL` no backend para apontar para o PostgreSQL definitivo e executar a aplicação uma vez para criar as tabelas via SQLModel.
2. **Usuário administrador** — Definir `FIRST_SUPERUSER_EMAIL`/`FIRST_SUPERUSER_PASSWORD` no `.env` do backend; o seed automático cria o superusuário na primeira inicialização.
3. **Origem CORS** — Atualizar `CORS_ORIGINS` para incluir o domínio oficial do portal.
4. **Frontend** — Definir `NEXT_PUBLIC_API_URL` no `.env.local` do frontend apontando para a API publicada.
5. **Segurança** — Trocar `SECRET_KEY`, configurar HTTPS no ambiente de produção e habilitar logs/monitoramento.
6. **Infra mínima** — Provisionar storage de imagens (S3/Cloudinary), serviço de e-mail e provedor de mensagens se forem necessários no go-live.

## Próximos passos recomendados

- Implementar edição completa de imóveis e leads no painel administrativo (incluir uploads, galerias e atribuição a corretores).
- Evoluir o serviço de IA para usar modelos hospedados (OpenAI ou modelo proprietário) e registrar histórico de scoring.
- Construir módulos financeiros e de marketing previstos no blueprint (contratos, repasses, campanhas, analytics).
- Adicionar testes automatizados (unitários e e2e) e pipeline CI/CD.
- Criar camada de integração com WordPress/JetEngine para migração gradual conforme descrito na documentação.

---

Para uma visão aprofundada das integrações e roadmap estratégico consulte o blueprint técnico. O relatório de status aponta as pendências críticas para colocar o sistema em produção com qualidade.
