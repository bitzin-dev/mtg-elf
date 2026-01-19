
# 📘 Portal ColeçãoMTG - Documentação Técnica & Arquitetura

Bem-vindo à documentação técnica do frontend do **ColeçãoMTG React**. Este documento detalha a arquitetura, as funcionalidades avançadas de IA e os padrões de design utilizados na versão 2.4.4.

---

## 🛠 Tech Stack

### Frontend Core
*   **React 19:** Biblioteca de UI com Hooks e Context API.
*   **TypeScript:** Tipagem estática rigorosa para interfaces (`Card`, `UserCollection`, etc.).
*   **Tailwind CSS:** Estilização utilitária (`bg-portal-bg`, `text-emerald-500`).
*   **Lucide React:** Ícones vetoriais leves.
*   **Vite:** Build tool (implícito).

### Bibliotecas Especializadas
*   **`@google/genai`:** SDK oficial do Google Gemini para recursos de IA (Chat e Visão).
*   **`react-pageflip`:** Motor de simulação de física de papel para o modo Fichário (Binder).
*   **`html2canvas` / `jspdf` (Conceitual):** Lógica nativa implementada para geração de PDF e impressão.

### Serviços de Dados
*   **Scryfall API:** Dados oficiais de cartas, imagens e metadados.
*   **LigaMagic Proxy:** Scraper customizado (via `allorigins`) para obter preços em Reais (BRL).
*   **Gemini 3 Flash:** Modelo de IA multimodal para reconhecimento de imagem e chat.

---

## 🚀 Funcionalidades Principais (Deep Dive)

### 1. 📷 Scanner IA (`ScannerModal.tsx`)
Um sistema de visão computacional alimentado pelo Google Gemini.
*   **Fluxo:** Captura frame de vídeo (`<canvas>`) -> Envia base64 para `gemini-3-flash-preview` -> Retorna JSON com Nome/Set -> Busca detalhes na Scryfall.
*   **Recursos de Hardware:** Suporte a Torch (Lanterna) e Foco Manual via `MediaTrackCapabilities`.
*   **Edição Inteligente:** Se a IA identifica a carta mas erra a edição, o usuário pode trocar a edição num dropdown filtrado apenas com prints daquela carta.

### 2. 📖 Modo Fichário 3D (`BinderView.tsx`)
Uma experiência imersiva skeuomórfica.
*   **Renderização:** Usa `HTMLFlipBook` para virar páginas com física realista.
*   **Customização de Capa:** O usuário pode escolher a arte de qualquer carta da coleção para estampar a capa. A imagem é salva na propriedade `coverImage` da coleção.
*   **Estética:** Camadas de CSS para simular reflexo plástico (gloss), textura de couro e sombras de lombada.

### 3. 🛒 Listas Globais (`GlobalListModal.tsx`)
Gerenciamento centralizado de cartas.
*   **Lista de Compras:** Agrega cartas marcadas. Permite exportação formatada especificamente para o "Deck Builder" da LigaMagic (formato: `QTD Nome [SET]`).
*   **Lista de Impressão (Proxies):**
    *   **Modo Grid A4:** Gera uma visualização exata de impressão A4 (9 cartas/página).
    *   **Marca D'água:** Adiciona overlay "PROXY" opcional para evitar falsificação.
    *   **Zoom Dinâmico:** Controles de zoom para inspeção de alta qualidade antes da impressão.

### 4. 📥 Importação Inteligente (`CreateCollectionModal.tsx`)
Parser avançado para migração de dados.
*   **Formatos Suportados:** Texto simples, CSV (ManaBox, Moxfield) e **LigaMagic CSV**.
*   **Mapper de Sets:** Utiliza `utils/ligaMagicMapper.ts` para converter códigos de set da LigaMagic (ex: `1ED`, `MI`) para códigos Scryfall (`lea`, `mir`), garantindo compatibilidade de dados.
*   **Resolução em Lote:** Usa o endpoint `/cards/collection` do Scryfall para resolver centenas de cartas em uma única requisição.

### 5. 🤖 Assistente Oráculo (`AIAssistant.tsx`)
Chatbot contextual.
*   Conecta-se ao modelo Gemini para responder dúvidas de regras, sugestões de deck e lore, atuando como um "Juiz" virtual.

---

## 🏗 Arquitetura de Dados

### Estrutura de Coleção (`types.ts`)
O estado da aplicação é normalizado na interface `UserCollection`.

```typescript
export interface UserCollection {
  id: string;
  name: string;
  ownedCardIds: string[]; // Array de IDs Scryfall (Checklist)
  quantities: Record<string, number>; // Mapa ID -> Quantidade
  coverImage?: string; // URL da arte cropada para a capa do Binder
  filterType: 'tribal' | 'set' | 'artist' | 'list';
  // ...
}
```

### Estratégia de Cache (`scryfallService.ts`)
Para evitar rate-limiting e economizar dados:
1.  **SessionStorage:** Cache agressivo de buscas, preços e metadados de sets.
2.  **Fila de Preços:** O fetch de preços da LigaMagic usa uma fila (`priceQueue`) com delay (throttle) para não bloquear a UI nem ser bloqueado pelo proxy.

---

## 📂 Estrutura de Diretórios

```bash
/
├── components/       
│   ├── BinderView.tsx        # Fichário 3D e Lógica de Capa
│   ├── ScannerModal.tsx      # Câmera e Integração Gemini Vision
│   ├── GlobalListModal.tsx   # Gestão de Compras e Impressão (Proxies)
│   ├── CreateCollectionModal.tsx # Importação e Parsing
│   └── ...
├── services/         
│   ├── geminiService.ts      # Cliente Google GenAI
│   ├── scryfallService.ts    # API Wrapper + Cache + LigaMagic Scraper
│   └── honoClient.ts         # (Draft) Cliente RPC para futuro Backend
├── utils/            
│   └── ligaMagicMapper.ts    # Tradutor de códigos de edição (PT <-> EN)
├── types.ts                  # Definições de Tipos Globais
└── App.tsx                   # Controller Principal e State Management
```

---

## 🔮 Roadmap de Integração Backend

O projeto está preparado para migrar do `localStorage` para um backend **Bun + Hono**.

### Passos para Migração:
1.  Subir servidor Hono com rotas RPC.
2.  Atualizar `services/honoClient.ts` com o `AppType` do backend.
3.  Substituir as chamadas de `setCollections` em `App.tsx` pelos métodos `client.collections.$post` e `client.collections.$get`.

---

## 📝 Guia de Manutenção

### Adicionar Nova Fonte de Preço
1.  Edite `services/scryfallService.ts`.
2.  Modifique `getLigaMagicPrice` ou crie `getCardKingdomPrice`.
3.  Atualize `DashboardCard.tsx` para consumir a nova função.

### Customizar Capa do Binder
A lógica de capa reside em dois lugares:
1.  **Estado:** `App.tsx` (função `handleUpdateCollectionCover`).
2.  **UI:** `BinderView.tsx` (Modal de seleção de arte).
    *   Para mudar o tamanho da imagem cropada, edite a propriedade `artCropUrl` em `transformScryfallData` no `scryfallService.ts`.
