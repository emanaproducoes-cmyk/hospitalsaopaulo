# Plano — Landing page proposta HMSP

## Direção de design
- **Movimento:** editorial institucional contemporâneo, com ritmo de relatório executivo e detalhes de produto digital.
- **Princípios:** clareza em camadas, confiança sem exageros, dados legíveis e acolhimento humano.
- **Cores:** vermelho zelo para ação e cuidado; azul marinho para autoridade; azul São Paulo para navegação; papel para leitura longa; lavanda/rosa/verde para apoiar estados e gráficos.
- **Layout:** narrativa vertical de baixa fricção, com hero dividido entre argumento e prova, faixas de conteúdo e painéis de aprofundamento em modal/bottom sheet.
- **Assinaturas:** sweep diagonal no header/hero, sublinhados vermelhos curtos e mini-gráficos vivos nos cards.
- **Interação:** cada clique revela contexto sem tirar a diretoria da página; foco, teclado e ESC tratados como caminhos de primeira classe.
- **Animação:** entrada por scroll, contadores e elevação de cards; loop do sweep lento; tudo desligado em `prefers-reduced-motion`.
- **Tipografia:** Poppins para títulos e corpo, com hierarquia 12/14/16/20/32/56px e fallback system-ui.
- **Essência:** transformar um plano técnico em decisões claras para o hospital; claro, cuidadoso, orientado a evidências.
- **Voz:** ativa, simples e respeitosa. Ex.: “Crescer em etapas, medindo cada passo.” / “O próximo passo é integrar o que já existe.”
- **Marca:** o coração do HMSP aparece como sinal de cuidado e união entre família, médicos e gestão.
- **Cor proprietária:** `#B01010`.

## Implementação
- Next.js App Router em modo cliente para uma única landing page interativa.
- `app/page.tsx`: dados da narrativa, seções, cards, modais, contadores e navegação.
- `app/globals.css`: tokens de cor, responsividade, sweep, gráficos nativos, acessibilidade e movimento.
- `public/assets`: logo e foto fornecidos pelo projeto.
- `public/manus-routes.json`: rota única `/` para o manifesto Webdev.
- Não há backend: CTAs usam `mailto`/âncoras e o PDF completo é referenciado como download local quando disponível.

## Revisão de escopo — outubro de 2026
- Cards alinhados aos títulos dos capítulos do Plano v3.0: dossiê, mapas, concorrência, mercado, natalidade, ICP/jornada, brand equity, growth, ecossistema, intranet, painéis, implantação, equipe e decisões.
- Gráficos nativos receberam estados de hover/foco com destaque, atenuação, tooltips textuais e visualizações específicas para linha do tempo, mapa esquemático, matriz, anéis, loops compostos, componentes e dashboard.
- Bio pública de Saulo Rosa e CTA de WhatsApp incluídos conforme instrução recebida.

## Revisão editorial — outubro de 2026
- Os cards de conteúdo foram substituídos por sessões estáticas com título, subtítulo, tese, leitura, bullets e texto técnico; não há modal ou clique para revelar o conteúdo.
- As referências visuais agora são rasterizações diretas das páginas originais do Plano v3.0, sem redesenhar mapas/gráficos: ambiente (p. 10), situação e partes interessadas (p. 11), praça (p. 12), concorrência (p. 16), ICP (p. 21), jornada (p. 22), ecossistema (p. 35–38) e equipe (p. 40–43), além dos demais capítulos mapeados.
- O CSS editorial usa `min-width: 0`, `overflow-wrap: anywhere`, grids responsivos e figuras contidas para impedir extrapolação de texto em desktop e mobile.

## Correção de visualização — outubro de 2026
- Cada sessão editorial ocupa 100% da largura disponível e aparece em sequência vertical independente.
- Texto e referência visual original do PDF ficam empilhados dentro da própria sessão; nenhuma coluna mínima comprime o texto em uma faixa vertical.
- O Preview foi reiniciado sem cache concorrente e a página estilizada foi validada após o rebuild.

## Correção de composição das sessões — outubro de 2026
- As sessões não exibem mais páginas A4 completas: cada uma usa um recorte visual do mapa/gráfico correspondente em painel de landing page.
- Os textos foram mantidos no HTML da sessão, com tipografia ampliada, hierarquia de tese/leitura/lista e composição em duas colunas no desktop, uma coluna no mobile.
- Foram removidos do conteúdo publicado os termos `FATO` e `HIPÓTESE`, as legendas de página e os rodapés das imagens.

## Alinhamento e preservação visual — outubro de 2026
- O eixo horizontal das sessões foi ajustado para coincidir com o conteúdo do header: largura máxima de 1240px e margens responsivas equivalentes.
- Os textos editoriais permanecem no HTML de cada sessão, em coluna ampla, com hierarquia de leitura e conteúdo alinhado ao gráfico/mapa correspondente.
- Os painéis visuais usam `object-fit: contain` e proporções reservadas para não cortar, esticar ou deformar os gráficos e mapas originais.
