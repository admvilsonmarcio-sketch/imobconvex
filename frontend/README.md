# ImobConvex Frontend (Next.js)

Portal público e painel administrativo básico prontos para conectar ao backend FastAPI.

## Stack
- Next.js 14 (Pages Router)
- TypeScript + Tailwind CSS
- React Query para cache de requisições

## Scripts
```bash
pnpm install   # recomendado (ou npm/yarn)
cp .env.example .env.local
pnpm dev       # ambiente local
pnpm build     # build de produção
pnpm start     # servidor Next em produção
```

## Estrutura
```
src/
  pages/        # rotas do portal e painel
  components/   # blocos reutilizáveis (cards, layouts, forms)
  lib/          # helpers de chamada HTTP e utils
  types/        # contratos compartilhados com o backend
```

## Funcionalidades disponíveis
- Home com listagem dinâmica de imóveis e busca por cidade/operação
- Página de detalhes com galeria, mapa estático e formulário de contato
- Captura de leads integrada ao backend com scoring imediato
- Painel administrativo com login, criação/edição de imóveis e visualização de leads

## Próximos passos sugeridos
- Implementar autenticação persistente via cookies seguros
- Evoluir o design system com componentes acessíveis
- Conectar mapas interativos (Google Maps/Mapbox)
