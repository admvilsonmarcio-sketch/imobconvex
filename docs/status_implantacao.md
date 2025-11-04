# Status para Implantação — ImobConvex

Documento de acompanhamento rápido para entender o que está pronto no repositório atual, o que falta para disponibilizar o sistema em produção e quais módulos ainda exigem desenvolvimento adicional.

## 1. Visão geral

| Módulo | Status atual | Entregas confirmadas | Lacunas críticas |
| --- | --- | --- | --- |
| API / Backend (FastAPI) | 🟡 Estável para MVP | Autenticação JWT, CRUD de imóveis, captura de leads com enriquecimento determinístico, seed automático do superusuário | Ausência de testes, logs estruturados e observabilidade; sem integrações externas (e-mail, WhatsApp, N8N); não há versionamento de esquema/migrações |
| Portal público (Next.js) | 🟡 Utilizável | Home responsiva com busca básica, cards de imóveis, página detalhada, formulário de lead com insights simulados | Falta mapa, filtros avançados, favoritos, comparador, SEO técnico, performance otimizada (imagem, PWA, Lighthouse) |
| Painel administrativo | 🟡 Utilizável | Login, listagem de imóveis e leads, criação e remoção de imóveis, painel de métricas simples | Não há edição completa, controle de usuários/perfis, atribuição de leads, uploads em massa, automações |
| IA & Automação | 🔸 Protótipo | Serviço determinístico de scoring e recomendações baseado em regras | Não usa modelos reais (OpenAI/ML), não registra histórico, não há ajuste fino nem integração com workflows externos |
| Financeiro & Marketing | ⛔ Não iniciado | — | Fluxos de contratos, cobranças, campanhas, analytics e integrações com anúncios ainda não implementados |
| Operações / DevOps | 🔸 Básico | Configuração via `.env`, criação automática das tabelas | Falta Docker, CI/CD, monitoramento, backups automatizados, scripts de migração, hardening de segurança |

Legenda: ✅ pronto · 🟡 utilizável porém incompleto · 🔸 rascunho/protótipo · ⛔ não iniciado.

## 2. Checklist técnico antes do deploy

1. **Banco de dados**
   - Definir `DATABASE_URL` apontando para PostgreSQL gerenciado.
   - Executar `uvicorn app.main:app` em ambiente controlado para criar tabelas via SQLModel.
   - Planejar migrações futuras (Alembic) para evitar reprocessamento manual.
2. **Credenciais e segurança**
   - Alterar `SECRET_KEY` e tempos de expiração dos tokens conforme política interna.
   - Configurar variáveis `FIRST_SUPERUSER_EMAIL` e `FIRST_SUPERUSER_PASSWORD` com credenciais definitivas.
   - Habilitar HTTPS e proxy reverso (Nginx/CloudFront) no ambiente público.
3. **Integração frontend**
   - Definir `NEXT_PUBLIC_API_URL` em `frontend/.env.local` apontando para a API publicada.
   - Revisar CORS (`CORS_ORIGINS`) incluindo domínio(s) oficiais.
4. **Observabilidade mínima**
   - Definir logging estruturado (JSON) e destino (CloudWatch, DataDog, etc.).
   - Configurar monitoramento de uptime (Healthcheck `/health` e `/api/v1/health/ping`).
5. **Assets e mídia**
   - Provisionar bucket S3/Cloudinary para imagens e ajustar campos `cover_image_url`/`gallery` no painel.
   - Implementar política de upload seguro (hoje apenas URLs são aceitas).
6. **Backups**
   - Planejar snapshots do banco e estratégia de restauração.

## 3. Divergências em relação ao blueprint

| Requisito do blueprint | Situação atual | Próximos passos sugeridos |
| --- | --- | --- |
| CRM completo com funil drag-and-drop, timeline e automações | Apenas lista simples de leads | Implementar modelos `PipelineStage`, endpoints de movimentação e UI kanban; integrar com serviço de notificações |
| IA avançada (análise de sentimento, previsão de conversão real, descrições automáticas) | Scoring heurístico determinístico | Conectar OpenAI/LangChain, armazenar resultados, permitir reprocessamento, criar rotinas assíncronas |
| Gestão financeira (aluguéis, repasses, comissões) | Não implementado | Definir modelo financeiro e endpoints; priorizar contratos e repasses |
| Marketing inteligente (campanhas Ads, heatmaps, blog) | Não implementado | Planejar integrações com Meta/Google Ads e coletar eventos analíticos |
| Área do proprietário e aplicativo mobile | Não implementados | Definir MVP web responsivo antes de evoluir para mobile |
| Migração WordPress + JetEngine | Apenas documentação | Desenvolver conectores (ETL) e testes de sincronização |

## 4. Dependências externas necessárias

- **Armazenamento de mídia**: AWS S3 / Cloudinary para uploads.
- **Serviços de comunicação**: provedores de e-mail (SendGrid/SES) e WhatsApp/SMS (Twilio) – ainda não integrados.
- **Assinatura eletrônica**: Clicksign/D4Sign para propostas (pendente).
- **Mapas**: Google Maps API para geocodificação e exibição futura.
- **Automação**: N8N/Make para orquestração — somente documentado.

## 5. Recomendações imediatas

1. Priorizar hardening da API (logs, testes, migrações) para suportar dados reais.
2. Evoluir o painel administrativo com edição e uploads, garantindo fluxo ponta a ponta sem uso de ferramentas externas.
3. Integrar IA real (serviço OpenAI) para validar diferencial competitivo antes de ampliar funcionalidades.
4. Definir pipeline de deploy (Docker + GitHub Actions) para permitir ambientes de staging/produção reproduzíveis.
5. Atualizar roadmap de sprints com base na capacidade atual da equipe e nas lacunas acima.

---

Este relatório deve ser revisado a cada entrega para garantir transparência sobre o que falta antes de um go-live seguro.
