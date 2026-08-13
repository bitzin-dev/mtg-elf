# Conceito do novo front-end MTG Elf

## Direcao visual

O novo front-end do MTG Elf deve parecer um portal moderno de colecao: limpo, minimalista, escuro e premium, com verde como cor principal. A interface deve fugir de bordas brancas, linhas finas repetidas e sombras pesadas. Separacao visual deve vir de cards bem definidos, espacamento, contraste de fundo, cantos arredondados, rings verdes sutis e estados de hover leves.

## Identidade

- Tema escuro com fundo profundo, perto de preto esverdeado.
- Verde `portal-accent` como cor consistente para foco, estados ativos, icones e realces.
- Tipografia forte no titulo principal, usando `font-display` quando fizer sentido.
- Visual clean, sem excesso de labels, textos auxiliares ou decoracao redundante.
- Interface deve parecer dashboard premium, nao painel antigo cheio de bordas.

## Layout principal

- Sidebar redesenhada, limpa, com navegacao clara.
- Header deve ser um card separado da pagina, nao integrado ao main.
- Header usa margem, raio grande, fundo proprio e ring sutil.
- Conteudo principal deve respirar com gaps reais entre blocos.
- Cards e paineis devem usar fundo escuro consistente, hover discreto e sem bordas brancas.

## Header dashboard

O header e uma peca visual importante. Ele deve comunicar contexto sem poluir.

Regras:

- Deve parecer um card independente.
- Nao usar linha separadora simples como unico recurso visual.
- Nao usar shadow forte.
- Nao mostrar texto grande como `Colecao ativa`.
- Indicar colecao ativa de forma minimalista, com icone pequeno (`Database`) e nome da colecao.
- Metadados ficam em chips discretos, como data e filtro ativo.
- Stats aparecem como chips com icones, nao caixas pesadas.
- Dropdown `ACOES` deve funcionar acima de tudo, usando z-index alto e menu `fixed`.

## Componentes

### Cards

- Sem bordas finas gerais.
- Usar `ring` verde muito sutil quando precisar de contorno.
- Usar hover leve: fundo um pouco mais claro, icone mais verde, deslocamento minimo se necessario.
- Evitar `shadow-2xl` como solucao padrao.

### Filtros

- Barra de filtros deve ser limpa.
- Inputs sem bordas brancas.
- Foco com ring verde.
- Estados ativos claros, mas discretos.

### Botões

- Botões secundarios usam estilo de chip.
- Bordas brancas devem ser evitadas.
- Estados ativos e hover usam verde.
- Icones podem ter animacao leve, sem exagero.

### Lista de sets

- Cada set deve parecer item dark com ring verde sutil.
- Hover deve trocar ring para verde mais visivel.
- Selecionado deve usar fundo verde translúcido e ring verde.
- Nao usar `border-gray`, `border-white` ou classes quebradas como `hover:` e `/60`.

### Modais

- Modais seguem paleta verde.
- Bordas principais removidas ou trocadas por ring verde discreto.
- Foco e acao primaria sempre verdes.

### Mobile

- Bottom bar sem bordas estruturais brancas.
- Priorizar legibilidade e toque facil.
- Visual deve continuar consistente com desktop.

## Paleta e utilitarios

Base esperada:

- `portal-bg`: fundo principal escuro.
- `portal-panel`: paineis e cards.
- `portal-accent`: verde principal.
- `portal-muted`: textos secundarios.
- `portal-chip`: chips modernos.
- `portal-menu`: menus/dropdowns.
- `glass-panel`: vidro escuro sem borda branca padrao.
- `soft-card`: card escuro sem borda branca padrao.

## O que evitar

- Bordas brancas ou cinzas em excesso.
- Header visualmente grudado ao main.
- Separacao baseada só em `border-b` ou `h-px`.
- Sombras fortes para simular profundidade.
- Labels redundantes como `Colecao ativa` quando icone e contexto ja bastam.
- Novas dependencias para resolver estilo.
- Abstracoes visuais criadas antes de existir repeticao real.

## Principio de implementacao

Manter diffs pequenos, preservar logica existente e mexer só no visual quando o pedido for visual. Usar Tailwind e utilitarios ja existentes. Nao adicionar dependencias. Preferir remover excesso antes de criar componentes novos.
