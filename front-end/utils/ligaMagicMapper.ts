
// Utility to map Scryfall Set Codes to LigaMagic Set Codes
// LigaMagic generally uses UpperCase, but older sets have specific codes.

const scryfallToLigaMap: Record<string, string> = {
    // Base Sets
    'lea': '1ED', // Alpha
    'leb': '2ED', // Beta
    '2ed': 'UN',  // Unlimited
    '3ed': 'RV',  // Revised
    '4ed': '4ED',
    '5ed': '5ED',
    '6ed': '6ED',
    '7ed': '7ED',
    
    // Modern Horizons & Remasters
    'mh1': 'MH1',
    'mh2': 'MH2',
    'mh3': 'MH3',
    'dmr': 'DMR',
    'tsr': 'TSR',

    // Promos & Specials
    'prm': 'PRM',
    'plist': 'PLIST',
    'fmb1': 'MYSTOR', // Mystery Booster

    // Expansions (Known deviations)
    'exo': 'EX',
    'sth': 'ST',
    'tpr': 'TE',
    'wth': 'WL',
    'tmp': 'TE', // Sometimes shared
    'mir': 'MI',
    'vis': 'VI',
    
    // Most others match (uppercase)
};

// Create a reverse map for import
const ligaToScryfallMap: Record<string, string> = Object.entries(scryfallToLigaMap).reduce((acc, [key, value]) => {
    acc[value.toUpperCase()] = key;
    return acc;
}, {} as Record<string, string>);

// Manual Overrides for Import
ligaToScryfallMap['US'] = 'usg'; // Urza's Saga (Scryfall: usg, Liga usually US or USG)
ligaToScryfallMap['UL'] = 'ulg'; // Urza's Legacy
ligaToScryfallMap['UD'] = 'uds'; // Urza's Destiny
ligaToScryfallMap['1E'] = 'lea';
ligaToScryfallMap['2E'] = 'leb';

export const mapScryfallToLigaMagic = (scryfallCode: string): string => {
    const code = scryfallCode.toLowerCase();
    return scryfallToLigaMap[code] || code.toUpperCase();
};

export const mapLigaMagicToScryfall = (ligaCode: string): string => {
    const code = ligaCode.toUpperCase().trim();
    // Check explicit map first
    if (ligaToScryfallMap[code]) return ligaToScryfallMap[code];
    
    // Default to lowercase (works for standard sets like ONE, WAR, DOM)
    return code.toLowerCase();
};