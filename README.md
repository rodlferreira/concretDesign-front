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

O QR visível nos contactos abre o WhatsApp da Emilly (`https://wa.me/351963445555`) ao clicar ou ler com a câmara. A arte do ChatGPT foi verificada, mas não era descodificável; por escolha do utilizador foi reconstruído um QR real em SVG, com cobre/cinza, fundo escuro e símbolo da marca. O ficheiro está em `public/images/whatsapp-emilly-qr.svg`; regenerar com `node scripts/build-whatsapp-qr.mjs`. A matriz usa correção H e margem de quatro módulos. Leitura validada com ZXing a 168, 336, 488 e 976 px. O destino do QR é fixo na Emilly, independente da configuração do botão flutuante. A revista PDF não foi fornecida: a interface informa a sua indisponibilidade. Configurar `VITE_BROCHURE_URL` com a URL HTTPS do PDF para ativar o download. Não foram criados documentos de portefólio que pudessem passar por obras reais.

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

## Cabeçalho sobre a imagem de abertura

Na homepage, a imagem estende-se até ao topo, por trás do cabeçalho sticky. O header usa um fundo fumê translúcido com desfocagem; a altura do cabeçalho é compensada dentro da hero para preservar a posição dos textos, botões e início da secção seguinte. A largura da imagem mantém-se. As outras páginas conservam o cabeçalho normal. A compensação acompanha as alturas de desktop/tablet/telemóvel e é removida na impressão.

## Carrossel e galeria de projetos

Os antigos blocos alternados da homepage e os três cartões de destaque foram reunidos num carrossel de sete projetos. A faixa ocupa toda a largura disponível, com a imagem central em destaque e partes das imagens vizinhas nos extremos. O ciclo usa clones nas pontas para regressar ao primeiro projeto sem salto visível. A imagem central aproxima-se suavemente durante 6,5 segundos antes da passagem seguinte.

O título e o resumo são o próprio elemento de abertura da galeria, sem um botão de chamada adicional. A galeria usa um `dialog` nativo com foco contido, fecho por Escape e reposição do foco no elemento de origem. Inclui categorias de acabamento, tipologia, pesquisa por projeto/localidade sem distinguir acentos, contagem e limpeza dos filtros. A grelha usa as imagens já fornecidas; não foram inventados novos projetos ou fotografias. As imagens e localizações mantêm a indicação de conceitos ilustrativos.

A reprodução para quando a faixa sai do ecrã, a aba fica oculta ou a galeria abre. O foco de teclado e a navegação manual pausam a apresentação; o botão de reprodução permite retomá-la. Há navegação por setas, indicadores e gesto horizontal no toque. Com movimento reduzido, não há zoom nem avanço automático. Em ecrãs pequenos, os filtros laterais passam a seletores compactos acima da grelha. A paleta dos temas permanece a mesma.

Componentes: `ProjectCarousel.tsx`, `ProjectGallery.tsx`; estilos em `_project-gallery.scss`. As onze novas mensagens de interface estão presentes nos 48 catálogos de idiomas.

## Fornecedores

A secção `Fornecedores` fica imediatamente antes de `Sobre nós`. Substitui a antiga faixa `Materiais e marcas` e os seus ícones genéricos. Os fornecedores confirmados devem ser incluídos em `src/lib/suppliers.ts`, com nome e, opcionalmente, site e logótipo. Por indicação do utilizador, a lista contém cinco fornecedores fictícios para demonstração: Ateliê Mineral, Cal & Matéria, Strato Studio, Terra Textura e Forma Mineral. Têm `isDemo: true`, não possuem links externos e a secção identifica-os como fictícios. Substituir pelos fornecedores confirmados antes da publicação.

## Mapa de Portugal Continental

A antiga silhueta pequena foi substituída por um SVG local maior com os 18 distritos continentais. A seleção de um pin ou de uma região realça os distritos associados e apresenta os projetos correspondentes. As regiões atuais são Norte (Porto/Braga), Lisboa e Vale do Tejo (Lisboa/Cascais) e Algarve, derivadas dos projetos ilustrativos existentes. Por indicação do utilizador, mantêm-se provisórias até haver informação adicional. Os pins são agregações regionais aproximadas, não coordenadas de moradas de obras. A nota de conteúdo ilustrativo permanece visível.

Os dados de regiões, cidades, distritos e pontos estão em `src/lib/coverage.ts`. A geometria está em `src/data/portugal-mainland.json`; cópia pública e atribuição em `public/data/`. Madeira e Açores são excluídos explicitamente por ISO PT-30/PT-20 no processamento. Não há pedidos a serviços de mapas, localização do visitante, cookies externos ou chaves de API.

Fonte cartográfica: geoBoundaries gbOpen PRT ADM1, com origem DG Territory (2016), sob Open Data Commons Open Database License 1.0. Atribuição também visível na interface e em `public/data/portugal-map-attribution.txt`. A geometria foi simplificada e projetada para coordenadas SVG; não constitui uma representação cadastral ou de limites legais. `scripts/build-portugal-map.py` reconstrói os caminhos a partir do ficheiro GeoJSON da fonte fixada no próprio script. O mapa é ilustrativo e não implica que existam obras em todos os concelhos de uma região/distrito destacado.

## Sobre nós — apresentação da marca

A secção usa uma composição editorial de duas colunas: painel com o símbolo vetorial da ConcretDesign ampliado e assinatura em texto HTML real, ao lado da descrição da marca e dos seus acabamentos. O painel valoriza os detalhes cobre/cinza existentes com iluminação e sombra CSS discretas; não altera os contornos do SVG nem a marca do cabeçalho. O ficheiro vetorial mantém a nitidez em qualquer escala. O conteúdo descritivo usa os textos e traduções existentes, sem inventar historial, anos de experiência ou certificações. Em telemóvel, logo e texto ficam empilhados. Componentes e estilos: `AboutBrand.tsx` e `_about-brand.scss`.

O botão flutuante de WhatsApp e o contacto de WhatsApp abrem diretamente o número da Emilly (+351 963 445 555). Para substituir pelo futuro número da empresa, definir `VITE_WHATSAPP_NUMBER` no ambiente do frontend, apenas com dígitos e indicativo internacional, e recompilar. Não há menu de seleção de pessoas.

Os links “Pedir orçamento” navegam para `/orcamento`, uma página própria integrada no site, com formulário e carrossel compacto. Não há popup. A página mantém a integração com a API, o tema e o idioma selecionados. O carrossel tem pausa, navegação manual e respeita movimento reduzido.

O portefólio `/portfolio` é uma página de catálogo com pesquisa, categorias por acabamento, filtro de tipologia e grelha de projetos. As imagens do carrossel principal e do orçamento abrem esta página; `?project=ID` destaca a seleção inicial. Os filtros adaptam-se ao telemóvel. As imagens da grelha abrem o detalhe do projeto.

O PDF ilustrativo está em `public/documents/concretdesign-portfolio.pdf` e é o documento predefinido para download na galeria e nos contactos. Para regenerar, executar `scripts/build-portfolio-pdf.py` com Python, ReportLab e Pillow. `VITE_BROCHURE_URL` permite substituir pelo PDF oficial HTTPS. O documento atual está em português e identifica todas as imagens como propostas ilustrativas.

## Publicação de teste no Vercel — 16/11/2026

- Site: https://concretdesign.vercel.app
- API: https://concretdesign-api.vercel.app/api/health
- A versão publicada inclui as alterações locais, sem depender de um push ao GitHub.
- `vercel.json` encaminha `/api/*` para a API e serve as rotas React diretamente.
- Para publicar novamente, executar `npx vercel --prod` nesta pasta, depois do build e das verificações.
- O projeto está ligado a `rodlferreira/concretDesign-front`; um push futuro para a branch de produção pode iniciar outro deploy. Incluir os ficheiros de configuração do Vercel no próximo commit.
