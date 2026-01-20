
import { Card, CardColor, Rarity } from '../types';

const BASE_URL = 'https://api.scryfall.com';
const PROXY_URL = 'https://api.allorigins.win/get?url=';

// Cache Keys Prefix
const CACHE_PREFIX = 'portal_mtg_';

// Cache Utilities
const getFromCache = <T>(key: string): T | null => {
    try {
        const item = sessionStorage.getItem(CACHE_PREFIX + key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

const saveToCache = (key: string, data: any) => {
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
        // Silent fail
    }
};

export const clearSessionCache = () => {
    try {
        // Clear only keys related to this app to avoid messing with other extensions/apps
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (e) {
        // Silent fail
    }
};

// Cache the dollar rate
let dollarRate = 6.0;
let rateFetched = false;

const fetchDollarRate = async () => {
    if (rateFetched) return;
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const data = await response.json();
        if (data.USDBRL && data.USDBRL.bid) {
            dollarRate = parseFloat(data.USDBRL.bid);
        }
        rateFetched = true;
    } catch (e) {
        // Fallback silently
    }
};

// Queue system for LigaMagic scraping
const priceQueue: { cardName: string, setName: string, resolve: (price: number) => void }[] = [];
let isProcessingQueue = false;

const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const processPriceQueue = async () => {
    if (isProcessingQueue || priceQueue.length === 0) return;
    isProcessingQueue = true;

    const { cardName, setName, resolve } = priceQueue.shift()!;

    try {
        const targetUrl = `https://www.ligamagic.com.br/?view=cards/card&card=${encodeURIComponent(cardName)}`;
        const response = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`);
        const data = await response.json();

        if (data.contents) {
            // Attempt to match the specific set name first
            // Look for SetName ... followed by price (Normal price usually appears first or explicitly labeled)
            // We use a loose match because Scryfall Set Names might differ slightly from LigaMagic
            // But strict enough to avoid matching wrong sets.

            // Strategy: Find the set name in the HTML, then grab the first R$ value that appears after it.
            // This works because LigaMagic lists editions in blocks.
            const cleanSetName = setName.replace(/ edition| set| core set/gi, "").trim(); // Simple normalization
            const setRegex = new RegExp(escapeRegExp(cleanSetName) + "[\\s\\S]*?R\\$\\s?(\\d{1,3}(?:\\.\\d{3})*,\\d{2})", "i");
            const setMatch = data.contents.match(setRegex);

            if (setMatch && setMatch[1]) {
                const priceStr = setMatch[1].replace('R$', '').trim().replace('.', '').replace(',', '.');
                const price = parseFloat(priceStr);
                if (!isNaN(price) && price > 0) {
                    saveToCache(`price_${cardName}_${setName}`, price);
                    resolve(price);
                    isProcessingQueue = false;
                    processPriceQueue();
                    return;
                }
            }

            // Fallback: Global minimum (original logic) if set specific price not found
            // Regex to find prices like "R$ 15,00" or "R$ 0,50"
            const priceMatches = data.contents.match(/R\$\s?(\d{1,3}(?:\.\d{3})*,\d{2})/g);

            if (priceMatches && priceMatches.length > 0) {
                const values = priceMatches.map((p: string) => {
                    const clean = p.replace('R$', '').trim().replace('.', '').replace(',', '.');
                    return parseFloat(clean);
                }).filter((v: number) => !isNaN(v) && v > 0);

                if (values.length > 0) {
                    const minPrice = Math.min(...values);
                    saveToCache(`price_${cardName}_${setName}`, minPrice); // Save to cache with set specificity
                    resolve(minPrice);
                } else {
                    resolve(0);
                }
            } else {
                resolve(0);
            }
        } else {
            resolve(0);
        }

        // 3. Delay before next request to be polite to the proxy/target
        await new Promise(r => setTimeout(r, 300));

    } catch (e) {
        resolve(0);
    }

    isProcessingQueue = false;
    processPriceQueue(); // Process next
};

export const getLigaMagicPrice = (cardName: string, setName: string, bypassCache: boolean = false): Promise<number> => {
    return new Promise((resolve) => {
        // Check cache synchronously first
        if (!bypassCache) {
            const cachedPrice = getFromCache<number>(`price_${cardName}_${setName}`);
            if (cachedPrice !== null) {
                resolve(cachedPrice);
                return;
            }
        }

        priceQueue.push({ cardName, setName, resolve });
        processPriceQueue();
    });
};


interface ScryfallCard {
    id: string;
    name: string;
    mana_cost?: string;
    type_line: string;
    rarity: string;
    set: string;
    set_name: string;
    released_at: string;
    prices: {
        usd?: string;
        eur?: string;
        tix?: string;
    };
    image_uris?: {
        normal: string;
        small: string;
        art_crop?: string;
        large?: string;
    };
    colors?: string[];
    oracle_text?: string;
    artist?: string;
    collector_number?: string;
    legalities?: Record<string, string>;
    power?: string;
    toughness?: string;
    card_faces?: {
        image_uris?: {
            normal: string;
            art_crop?: string;
            large?: string;
        };
        colors?: string[];
        mana_cost?: string;
        name: string;
        oracle_text?: string;
        power?: string;
        toughness?: string;
    }[];
}

const mapColors = (colors: string[] | undefined): CardColor[] => {
    if (!colors || colors.length === 0) return [CardColor.COLORLESS];
    if (colors.length > 1) return [CardColor.MULTICOLOR];

    return colors.map(c => {
        switch (c) {
            case 'W': return CardColor.WHITE;
            case 'U': return CardColor.BLUE;
            case 'B': return CardColor.BLACK;
            case 'R': return CardColor.RED;
            case 'G': return CardColor.GREEN;
            default: return CardColor.COLORLESS;
        }
    });
};

const mapRarity = (rarity: string): Rarity => {
    switch (rarity) {
        case 'mythic': return Rarity.MYTHIC;
        case 'rare': return Rarity.RARE;
        case 'uncommon': return Rarity.UNCOMMON;
        default: return Rarity.COMMON;
    }
};

const transformScryfallData = (data: ScryfallCard[]): Card[] => {
    return data.map((sc: ScryfallCard) => {
        const image = sc.image_uris?.normal || sc.card_faces?.[0]?.image_uris?.normal || 'https://cards.scryfall.io/back.png';
        const artCrop = sc.image_uris?.art_crop || sc.card_faces?.[0]?.image_uris?.art_crop || image;

        const mana = sc.mana_cost || sc.card_faces?.[0]?.mana_cost || '';
        const oracle = sc.oracle_text || sc.card_faces?.[0]?.oracle_text || '';

        const power = sc.power || sc.card_faces?.[0]?.power;
        const toughness = sc.toughness || sc.card_faces?.[0]?.toughness;

        // Ensure prices object exists before accessing usd
        const prices = sc.prices || {};
        const initialPrice = prices.usd ? parseFloat(prices.usd) * dollarRate : 0;

        return {
            id: sc.id,
            name: sc.name,
            manaCost: mana,
            type: sc.type_line,
            rarity: mapRarity(sc.rarity),
            set: sc.set.toUpperCase(),
            setName: sc.set_name,
            releaseYear: sc.released_at ? sc.released_at.substring(0, 4) : '????',
            priceBRL: initialPrice,
            imageUrl: image,
            artCropUrl: artCrop,
            colors: mapColors(sc.colors || sc.card_faces?.[0]?.colors),
            oracleText: oracle,
            artist: sc.artist || 'Desconhecido',
            collectorNumber: sc.collector_number || '000',
            legalities: sc.legalities || {},
            power,
            toughness
        };
    });
}

export const getCreatureTypes = async (): Promise<string[]> => {
    const cacheKey = 'creature_types';
    const cached = getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${BASE_URL}/catalog/creature-types`);
        const data = await response.json();
        const types = data.data || [];
        saveToCache(cacheKey, types);
        return types;
    } catch (error) {
        return [];
    }
};

export const getSets = async (): Promise<{ code: string, name: string }[]> => {
    const cacheKey = 'sets_list';
    const cached = getFromCache<{ code: string, name: string }[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${BASE_URL}/sets`);
        const data = await response.json();
        const sets = data.data.filter((s: any) => ['core', 'expansion', 'masters'].includes(s.set_type)).map((s: any) => ({
            code: s.code.toUpperCase(),
            name: s.name
        }));
        saveToCache(cacheKey, sets);
        return sets;
    } catch (error) {
        return [];
    }
};

export const getCardTypes = async (): Promise<string[]> => {
    return [
        "Artifact", "Battle", "Conspiracy", "Creature", "Emblem", "Enchantment",
        "Hero", "Instant", "Land", "Phenomenon", "Plane", "Planeswalker",
        "Scheme", "Sorcery", "Tribal", "Vanguard", "Token"
    ];
};

export const searchScryfall = async (query: string, onProgress?: (cards: Card[]) => void): Promise<Card[]> => {
    // Check Cache
    const cacheKey = `search_${query}`;
    const cachedCards = getFromCache<Card[]>(cacheKey);
    if (cachedCards) {
        if (onProgress) onProgress(cachedCards);
        return cachedCards;
    }

    let allCards: Card[] = [];
    let url = `${BASE_URL}/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=released&dir=desc`;
    let hasMore = true;

    try {
        if (!rateFetched) await fetchDollarRate();

        while (hasMore) {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) return [];
                if (allCards.length > 0) {
                    saveToCache(cacheKey, allCards);
                    return allCards;
                }
                throw new Error(`Scryfall API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const batch = transformScryfallData(data.data);
            allCards = [...allCards, ...batch];

            // Notify progress
            if (onProgress) {
                onProgress(allCards);
            }

            hasMore = data.has_more;
            url = data.next_page;

            if (hasMore) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        // Save to Cache
        saveToCache(cacheKey, allCards);
        return allCards;

    } catch (error) {
        return allCards.length > 0 ? allCards : [];
    }
};

/**
 * Fetches cards using the /cards/collection endpoint.
 * Useful for resolving specific cards by ID or Set/Name/Number combination.
 */
export const fetchCardsFromIdentifiers = async (identifiers: any[]): Promise<Card[]> => {
    if (identifiers.length === 0) return [];

    try {
        if (!rateFetched) await fetchDollarRate();

        // Scryfall limits to 75 identifiers per request
        const chunks = [];
        for (let i = 0; i < identifiers.length; i += 75) {
            chunks.push(identifiers.slice(i, i + 75));
        }

        let allFoundCards: Card[] = [];

        for (const chunk of chunks) {
            const response = await fetch(`${BASE_URL}/cards/collection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifiers: chunk })
            });

            if (!response.ok) continue;

            const data = await response.json();
            const found = transformScryfallData(data.data || []);
            allFoundCards = [...allFoundCards, ...found];

            // Be nice to the API
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return allFoundCards;

    } catch (error) {
        console.error("Batch fetch failed", error);
        return [];
    }
};


// Function to get all printings of a card name to help user select edition
export const getCardPrintings = async (cardName: string): Promise<Card[]> => {
    // Exact name match, unique prints
    const query = `!"${cardName}" unique:prints`;
    return searchScryfall(query);
};

export const getRandomCardArt = async (): Promise<string> => {
    try {
        const query = "(t:elf or name:nissa or name:tyvar) is:highres";
        const response = await fetch(`${BASE_URL}/cards/random?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.image_uris?.art_crop || data.card_faces?.[0]?.image_uris?.art_crop || 'https://cards.scryfall.io/art_crop/front/b/2/b2bf633e-0470-4b87-99ed-5ad1683b0954.jpg';
    } catch (e) {
        return 'https://cards.scryfall.io/art_crop/front/b/2/b2bf633e-0470-4b87-99ed-5ad1683b0954.jpg';
    }
}

export const getFeaturedCards = async (): Promise<Card[]> => {
    try {
        const query = "!(Sheoldred, the Apocalypse) OR !(The One Ring) OR !(Black Lotus) include:extras unique:prints";
        const response = await fetch(`${BASE_URL}/cards/search?q=${encodeURIComponent(query)}&order=usd&dir=desc`);
        const data = await response.json();

        if (data.data) {
            return transformScryfallData(data.data.slice(0, 3));
        }
        return [];
    } catch (e) {
        return [];
    }
}

export const getLandingPageCards = async (): Promise<Card[]> => {
    try {
        const cardTargets = [
            { set: 'ecl', number: '176' }, // Front Card
            { set: 'ecl', number: '171' }, // Second Card (Behind/Right)
            { set: 'fdn', number: '227' }  // Third Card (Last/Left)
        ];

        const promises = cardTargets.map(target =>
            fetch(`${BASE_URL}/cards/${target.set}/${target.number}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch ${target.set}/${target.number}`);
                    return res.json();
                })
                .catch(err => {
                    return null;
                })
        );

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r && r.object !== 'error');

        if (validResults.length > 0) {
            return transformScryfallData(validResults as ScryfallCard[]);
        }
        return [];
    } catch (e) {
        return [];
    }
}

export const getCardRulings = async (cardId: string): Promise<{ published_at: string, comment: string }[]> => {
    const cacheKey = `rulings_${cardId}`;
    const cached = getFromCache<{ published_at: string, comment: string }[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${BASE_URL}/cards/${cardId}/rulings`);
        if (!response.ok) return [];
        const data = await response.json();
        const rulings = data.data || [];
        saveToCache(cacheKey, rulings);
        return rulings;
    } catch (e) {
        return [];
    }
}
