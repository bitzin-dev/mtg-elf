
export interface ImportResult {
    success: boolean;
    data: {
        ids: string[];
        quantities: Record<string, number>;
    };
    error?: string;
    details?: {
        totalFound: number;
        totalUnique: number;
    }
}

export const parseImportFile = async (file: File): Promise<ImportResult> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                resolve({ success: false, data: { ids: [], quantities: {} }, error: "Arquivo vazio" });
                return;
            }

            // Detect JSON
            if (file.name.endsWith('.json') || content.trim().startsWith('{')) {
                try {
                    const json = JSON.parse(content);
                    const cards = json.data?.all_cards || [];
                    
                    if (!Array.isArray(cards)) {
                         resolve({ success: false, data: { ids: [], quantities: {} }, error: "Formato JSON inválido. Esperado data.all_cards array." });
                         return;
                    }

                    const ids: string[] = [];
                    const quantities: Record<string, number> = {};

                    cards.forEach((card: any) => {
                        if (card.id) {
                            // If ID exists in JSON, assume it's valid.
                            // The schema doesn't have "quantity", so we assume 1.
                            // If duplicates exist in array, we sum them up?
                            // Schema seems to be a list of individual cards.
                            
                            if (!quantities[card.id]) {
                                ids.push(card.id);
                                quantities[card.id] = 0;
                            }
                            quantities[card.id] += 1;
                        }
                    });

                    resolve({ 
                        success: true, 
                        data: { ids, quantities },
                        details: { totalFound: cards.length, totalUnique: ids.length }
                    });

                } catch (err) {
                    resolve({ success: false, data: { ids: [], quantities: {} }, error: "Erro ao ler JSON: " + (err as any).message });
                }
            } 
            // Generic CSV / Text
            else {
                const lines = content.split('\n').filter(l => l.trim().length > 0);
                // We actually can't easily resolve CSV to IDs purely on frontend WITHOUT Scryfall search
                // UNLESS the CSV has IDs.
                // The current app logic in App.tsx (handleDashboardFileChange) attempts to match names against *loaded* cards.
                // For NEW collection import, we don't have loaded cards context if we are creating from scratch.
                // However, the `CreateCollectionModal` uses `fetchCardsFromIdentifiers`.
                // So parsing CSV should return a structure that can be used to Fetch validation, OR return IDs if provided.
                
                // For this Utility, let's strictly handle the JSON schema provided which has IDs.
                // For CSV, we'll return a specific error or handling hint if we can't implement full resolver here (it's async/api dependent).
                // BUT, the existing `CreateCollectionModal` handles CSV by calling API.
                // Let's stick to JSON support here mostly, or basic CSV parsing only.
                
                resolve({ success: false, data: { ids: [], quantities: {} }, error: "Importação via CSV deve ser feita processando linha a linha (não implementado neste utilitário simples ainda)." });
            }
        };

        reader.onerror = () => resolve({ success: false, data: { ids: [], quantities: {} }, error: "Erro ao ler arquivo" });
        reader.readAsText(file);
    });
};
