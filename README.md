# ConcretDesign — Frontend

Site React + TypeScript + Sass, com Vite. Desenvolvimento local, sem publicação automática. Node.js 24 ou superior.

## Iniciar

```bash
cd /home/java/Documentos/Projects/NodeJS/concretDesign-back
npm ci
cp .env.example .env
npm run dev
```

Noutro terminal:

```bash
cd /home/java/Documentos/Projects/ReactJS/concretDesign
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. O Vite encaminha `/api` para a API na porta 3001.

## Verificar

```bash
npm run check:i18n
npm run build
npx playwright install chromium
npm run test:e2e
```

Com Chrome já instalado, usar `CHROME_PATH=/usr/bin/google-chrome npm run test:e2e`. Jest é o runner dos testes; Playwright controla o navegador e axe-core verifica regras automáticas WCAG 2.2 AA. A suíte inicia e encerra os dois servidores e usa uma base de dados temporária isolada. A suíte usa portas livres e uma API temporária própria, sem interferir com os servidores de desenvolvimento. Para mudar a localização da API no teste, usar `BACKEND_DIR=/caminho/absoluto`.

## Organização

- `src/components`: cabeçalho acessível, formulário, contactos e portefólio.
- `src/lib/projects.ts`: catálogo estático de conceitos, com IDs independentes dos textos.
- `src/i18n`: catálogos carregados por idioma, com verificação de todas as chaves.
- `src/styles/main.scss`: tokens de tema, composição, adaptação a ecrãs pequenos, contraste e movimento reduzido.
- `tests`: percursos completos do navegador até à API, falhas de rede e auditoria automática de acessibilidade.

As rotas `/`, `/portfolio`, `/projects/:id` e `/privacy` funcionam com navegação nativa e são servidas pelo fallback SPA. Não há HTML injetado nem tradução por terceiros durante a visita. Inter está alojada localmente. Os idiomas têm identificação BCP 47, nomes nativos, pesquisa e persistência local. Foram incluídos os 24 idiomas oficiais da UE e idiomas nacionais e regionais europeus adicionais (ver `languages.json`). A Europa tem muitos outros idiomas regionais/minoritários: o catálogo é extensível e não constitui uma lista linguística exaustiva. As traduções iniciais são automáticas e precisam de revisão humana antes de publicação, sobretudo termos técnicos; não são traduções certificadas.

## Conteúdo e configuração

O design segue as duas imagens anexadas e o briefing consultado no Chrome: preto `#181716`, cobre `#B88865`, cobre claro `#D2A583`, creme `#FAF8F5`, bege `#EAE3DA` e Inter. As fotografias são recortes dos mockups fornecidos. A marca foi reconstruída em vetores e texto real; ver a nota de identidade abaixo. É necessário substituir pelos originais em resolução adequada antes da publicação. Os sete projetos, localizações e a comparação de textura são explicitamente ilustrativos; não representam obras verificadas. Nenhuma marca fornecedora fictícia foi apresentada como parceira real.

Contactos reais fornecidos pelo utilizador em `src/lib/config.ts`:

- Emilly Prado: +351 963 445 555 · emillyprado@concretdesign.pt
- Alexandre Prado: +351 963 444 880 · alexandreprado@concretdesign.pt
- Geral: geral@concretdesign.pt

O QR é gerado localmente para `/portfolio` no domínio que está a servir o site. Para impressão da revista, gerar um QR definitivo apenas depois de confirmar o domínio público. A revista PDF não foi fornecida: a interface informa a sua indisponibilidade. Configurar `VITE_BROCHURE_URL` com a URL HTTPS do PDF para ativar o download. Não foram criados documentos de portefólio que pudessem passar por obras reais.

## Produção

`npm run build` gera `dist/`. Servir ficheiros via HTTPS, encaminhar `/api/` para a API e devolver `index.html` para as rotas da aplicação. Ver o exemplo `deploy/nginx.conf`. As variáveis `VITE_*` são públicas: nunca incluir segredos. O `.env` do backend fica separado. Não expor o ficheiro SQLite nem o diretório `data/`. O texto de privacidade precisa dos dados legais do responsável pelo tratamento antes do lançamento. A auditoria automática complementa a revisão manual de acessibilidade e não certifica conformidade integral.

## Movimento e interação

Os títulos e parágrafos entram suavemente ao aproximarem-se da área visível, com fade-in e deslocação vertical de 8 px. Cada texto anima uma única vez; o observador deixa de o acompanhar após a entrada. Conteúdo acrescentado por filtros também é registado. Mensagens e instruções do formulário permanecem imediatas. A preferência `prefers-reduced-motion` desativa as animações, incluindo quando muda durante a visita; sem IntersectionObserver, todo o conteúdo continua visível.

Os botões principais passam a um dourado mate com halo discreto em hover e foco de teclado. Os botões de contorno recebem uma tonalidade e brilho suaves. Botões desativados não recebem o efeito, e o modo de movimento reduzido evita deslocações.

O cabeçalho usa um único switch de tema com ícones Sol/Lua de `@phosphor-icons/react`, estado acessível e cursor animado. A preferência independente de alto contraste está identificada no rodapé. O modo claro usa fundos brancos, incluindo quando o alto contraste está ativo. As faixas escuras da composição de referência foram preservadas.

Os botões principais em repouso seguem a referência enviada: gradiente cobre `#C18659` → `#AB7349`, com texto branco. O alto contraste preserva esse acabamento em vez de o substituir por amarelo. O dourado com brilho fica reservado ao hover/foco solicitado. As cores foram amostradas no botão da imagem de referência; os testes verificam o gradiente e a cor do texto nos dois temas, com e sem alto contraste.

A entrada dos textos usa fade-in de 1,15 s e deslocação de 8 px em 1,25 s, com uma curva gradual para suavizar o início e o fim.


## Identidade vetorial

A referência foi recuperada das imagens originais incorporadas no ficheiro `ConcreteDesign_Figma_Import.svg`, descarregado da conversa indicada pelo utilizador. As cópias de origem ficam em `scripts/logo-sources/` para permitir comparação e reconstrução.

- `public/images/brand-symbol.svg`: traçado vetorial a cores da arte original, com 270 paths que conservam os recortes, encaixes e detalhes minerais/cobre; sem bitmap incorporado.
- `public/images/concretdesign-logo.svg`: marca completa transparente, com nome e subtítulo em elementos `<text>` editáveis e fontes incorporadas.
- `public/images/concretdesign-logo-preview.svg`: mesma marca num fundo escuro para comparação.
- `public/fonts/concret-reference-*.woff2`: duas fontes de subconjunto, construídas a partir das letras da própria arte, em substituição da aproximação com Montserrat.
- `scripts/rebuild-reference-logo.py`: reconstrução reproduzível. Dependências apenas de autoria: Pillow, VTracer, potracer, NumPy, FontTools e Brotli. O site não executa Python nem estas ferramentas.

O cabeçalho combina o símbolo SVG com nome/subtítulo em texto HTML e fontes locais. Os glifos comuns do subtítulo reutilizam os contornos da linha principal, cuja resolução de origem é maior. As três letras adicionais são traçadas do subtítulo original. São subconjuntos para as palavras da marca, não uma família tipográfica completa nem o ficheiro da fonte original. Para editar os SVG noutros programas pode ser necessário instalar os subconjuntos; os navegadores usam as fontes WOFF2 incorporadas.

A vetorização suaviza contornos de uma origem raster, pelo que não é o desenho vetorial oficial nem uma promessa de equivalência pixel a pixel. A geometria e as texturas são derivadas da arte fornecida, em vez de recriadas por uma nova interpretação.
