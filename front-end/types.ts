
export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  MYTHIC = 'Mythic Rare',
}

export enum CardColor {
  WHITE = 'White',
  BLUE = 'Blue',
  BLACK = 'Black',
  RED = 'Red',
  GREEN = 'Green',
  COLORLESS = 'Colorless',
  MULTICOLOR = 'Multicolor',
}

export interface Card {
  id: string;
  name: string;
  manaCost: string;
  type: string;
  rarity: Rarity;
  set: string;
  setName: string; // Full set name
  releaseYear: string; // For sorting
  priceBRL: number;
  imageUrl: string;
  artCropUrl?: string; // URL for the cropped art image
  colors: CardColor[];
  oracleText: string;
  artist: string;
  collectorNumber: string;
  legalities: Record<string, string>; // e.g. { standard: 'legal', commander: 'legal' }
  power?: string;
  toughness?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export type CollectionFilterType = 'tribal' | 'set' | 'artist' | 'type' | 'advanced' | 'list';

export interface AdvancedFilters {
  rarity: string;
  color: string;
  cmc: string;
  power: string;
  toughness: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  timestamp: number;
  criteria: {
    searchTerm: string;
    selectedSet: string | null;
    advancedFilters: AdvancedFilters;
  };
}

// Tipo para uso no front-end que converte _id do MongoDB para id string
import type { UserCollection as BackendUserCollection } from '../backend/services/types';

export type FrontendCollection = Omit<BackendUserCollection, '_id' | 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: string; // Convertido de Date para string no frontend
  updatedAt?: string;
};