import React from 'react';
import { Card, CardColor, Rarity } from './types';

export interface MtgSet {
  code: string;
  name: string;
  year: string;
  totalCards: number;
  ownedCards: number;
  iconSvg?: React.ReactNode; 
}

export const MOCK_SETS: MtgSet[] = [
  { code: 'LEA', name: 'Limited Edition Alpha', year: '1993', totalCards: 2, ownedCards: 0 },
  { code: 'LEB', name: 'Limited Edition Beta', year: '1993', totalCards: 2, ownedCards: 0 },
  { code: '2ED', name: 'Unlimited Edition', year: '1993', totalCards: 2, ownedCards: 0 },
  { code: 'CED', name: "Collectors' Edition", year: '1993', totalCards: 2, ownedCards: 0 },
  { code: 'CEI', name: "Intl. Collectors' Edition", year: '1993', totalCards: 2, ownedCards: 0 },
  { code: 'ONE', name: "Phyrexia: All Will Be One", year: '2023', totalCards: 271, ownedCards: 15 },
  { code: 'WAR', name: "War of the Spark", year: '2019', totalCards: 264, ownedCards: 42 },
];

export const MOCK_CARDS: Card[] = [
  {
    id: '1',
    name: 'Tyvar, Jubilant Brawler',
    manaCost: '1BG',
    type: 'Legendary Planeswalker',
    rarity: Rarity.RARE,
    set: 'ONE',
    setName: 'Phyrexia: All Will Be One',
    releaseYear: '2023',
    priceBRL: 15.00,
    imageUrl: 'https://cards.scryfall.io/normal/front/2/2/2281cea6-11d2-4ac7-a32b-3ab5cd49d131.jpg',
    colors: [CardColor.BLACK, CardColor.GREEN],
    oracleText: '',
    artist: 'Victor Adame Minguez',
    collectorNumber: '218',
    legalities: { standard: 'legal', pioneer: 'legal', modern: 'legal', commander: 'legal' }
  },
  {
    id: '2',
    name: 'Evolution Sage',
    manaCost: '2G',
    type: 'Creature',
    rarity: Rarity.UNCOMMON,
    set: 'WAR',
    setName: 'War of the Spark',
    releaseYear: '2019',
    priceBRL: 2.50,
    imageUrl: 'https://cards.scryfall.io/normal/front/2/4/24d12c67-5ad9-4cbe-903c-39237780f757.jpg',
    colors: [CardColor.GREEN],
    oracleText: '',
    artist: 'Simon Dominic',
    collectorNumber: '159',
    legalities: { commander: 'legal', modern: 'legal', legacy: 'legal' }
  },
  {
    id: '3',
    name: 'Oakwood Safewright',
    manaCost: '1G',
    type: 'Creature',
    rarity: Rarity.COMMON,
    set: 'M21',
    setName: 'Core Set 2021',
    releaseYear: '2020',
    priceBRL: 0.50,
    imageUrl: 'https://cards.scryfall.io/normal/front/a/7/a772c78a-c0b1-4f10-85f0-61361c470942.jpg', // Placeholder logic
    colors: [CardColor.GREEN],
    oracleText: '',
    artist: 'Unknown',
    collectorNumber: '001',
    legalities: { commander: 'legal' }
  },
  {
    id: '4',
    name: 'Ironhand Dissident',
    manaCost: '2B',
    type: 'Creature',
    rarity: Rarity.COMMON,
    set: 'NEO',
    setName: 'Kamigawa: Neon Dynasty',
    releaseYear: '2022',
    priceBRL: 0.25,
    imageUrl: 'https://cards.scryfall.io/normal/front/4/f/4f8e5f71-671e-47aa-9243-c063f27f8045.jpg', // Placeholder logic
    colors: [CardColor.BLACK],
    oracleText: '',
    artist: 'Unknown',
    collectorNumber: '002',
    legalities: { commander: 'legal' }
  },
  {
    id: '5',
    name: 'Devoted Druid',
    manaCost: '1G',
    type: 'Creature',
    rarity: Rarity.UNCOMMON,
    set: 'SHM',
    setName: 'Shadowmoor',
    releaseYear: '2008',
    priceBRL: 12.00,
    imageUrl: 'https://cards.scryfall.io/normal/front/5/c/5c8a8dbb-cba7-4e1d-8888-73ab6f4aff07.jpg',
    colors: [CardColor.GREEN],
    oracleText: '',
    artist: 'Vance Kovacs',
    collectorNumber: '110',
    legalities: { modern: 'legal', commander: 'legal' }
  },
  {
    id: '6',
    name: 'Marwyn, the Nurturer',
    manaCost: '2G',
    type: 'Legendary Creature',
    rarity: Rarity.RARE,
    set: 'DOM',
    setName: 'Dominaria',
    releaseYear: '2018',
    priceBRL: 8.00,
    imageUrl: 'https://cards.scryfall.io/normal/front/a/a/aad61d99-5c8e-47b7-ab1a-e70905f59205.jpg',
    colors: [CardColor.GREEN],
    oracleText: '',
    artist: 'Chris Rahn',
    collectorNumber: '172',
    legalities: { commander: 'legal', pioneer: 'legal', modern: 'legal' }
  },
  {
    id: '7',
    name: 'Glissa Sunslayer',
    manaCost: '1BG',
    type: 'Legendary Creature',
    rarity: Rarity.RARE,
    set: 'ONE',
    setName: 'Phyrexia: All Will Be One',
    releaseYear: '2023',
    priceBRL: 22.00,
    imageUrl: 'https://cards.scryfall.io/normal/front/b/2/b2bf633e-0470-4b87-99ed-5ad1683b0954.jpg',
    colors: [CardColor.BLACK, CardColor.GREEN],
    oracleText: '',
    artist: 'Kieran Yanner',
    collectorNumber: '202',
    legalities: { standard: 'legal', commander: 'legal' }
  },
  {
    id: '8',
    name: 'Tyvar, the Evermore',
    manaCost: '4BG',
    type: 'Legendary Planeswalker',
    rarity: Rarity.MYTHIC,
    set: 'ONE',
    setName: 'Phyrexia: All Will Be One',
    releaseYear: '2023',
    priceBRL: 18.00,
    imageUrl: 'https://cards.scryfall.io/normal/front/2/2/2281cea6-11d2-4ac7-a32b-3ab5cd49d131.jpg', // Reusing Tyvar image for vibe
    colors: [CardColor.BLACK, CardColor.GREEN],
    oracleText: '',
    artist: 'Victor Adame Minguez',
    collectorNumber: '300',
    legalities: { commander: 'legal' }
  }
];