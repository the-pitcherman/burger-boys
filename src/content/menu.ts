/**
 * Single source of truth for everything with a price.
 * Rendered into HTML at build time (vite.config.ts) and imported at runtime by the bag + combo builder.
 * Prices are integer euro cents. Items carried over unchanged from v1 of the site.
 */
import type { ImageKey } from './images';

export type Cents = number;
export type BurgerId = 'smash' | 'bbq' | 'special' | 'truffle';
export type DipId = 'dip-spicy' | 'dip-boys' | 'dip-truffle';
export type DrinkId = 'lemon' | 'shake';
export type SideId = 'fries' | 'tfries';
export type ItemId = BurgerId | DipId | DrinkId | SideId;

export interface Item {
  id: ItemId;
  name: string;
  price: Cents;
  image: ImageKey;
  alt: string;
  blurb: string;
}

export interface Burger extends Item {
  id: BurgerId;
  short: string; // name without "The"
  ingredients: string[];
  /** board colour + accent, from the brand palette */
  bg: string;
  accent: string;
}

export const COMBO_UPCHARGE: Cents = 395;
export const COMBO_SIDE: SideId = 'fries';
export const COMBO_INCLUDES = 'Good Mood Fries, a dip and any drink';

export const BURGERS: readonly Burger[] = [
  {
    id: 'smash',
    name: 'The Smash Classic',
    short: 'Smash Classic',
    price: 995,
    image: 'menu-smash',
    alt: 'The Smash Classic: smashed plant-based patty with melted cheddar-style slice, iceberg, tomato and pink burger sauce on a sesame bun, on a sky-blue backdrop',
    blurb: 'Hard-smashed patty, cashew cheddar, iceberg, vine tomato, Boys Sauce.',
    ingredients: ['Smash patty', 'Cashew cheddar', 'Iceberg', 'Vine tomato', 'Boys Sauce'],
    bg: 'var(--sky)',
    accent: 'var(--pink)',
  },
  {
    id: 'bbq',
    name: 'The BBQ Bacon',
    short: 'BBQ Bacon',
    price: 1150,
    image: 'menu-bbq',
    alt: 'The BBQ Bacon: plant-based patty piled with smoky coconut bacon, crispy onions and sticky BBQ glaze on a lilac backdrop',
    blurb: 'Smoky coconut bacon, crispy red onion, cashew cheddar, sticky BBQ glaze.',
    ingredients: ['Smash patty', 'Coconut bacon', 'Crispy red onion', 'Cashew cheddar', 'BBQ glaze'],
    bg: 'var(--lilac)',
    accent: 'var(--pink)',
  },
  {
    id: 'special',
    name: 'The Boys Special',
    short: 'Boys Special',
    price: 1195,
    image: 'menu-special',
    alt: 'The Boys Special: double plant-based patties, double melted cheese, pickles, iceberg and extra sauce on a sunshine-yellow backdrop',
    blurb: 'Double patty, double cheese, dill pickles, iceberg and extra Boys Sauce. The big one.',
    ingredients: ['Double smash patty', 'Double cheese', 'Dill pickles', 'Iceberg', 'Extra Boys Sauce'],
    bg: 'var(--sun)',
    accent: 'var(--sky)',
  },
  {
    id: 'truffle',
    name: 'The Truffle Delight',
    short: 'Truffle Delight',
    price: 1150,
    image: 'menu-truffle',
    alt: 'The Truffle Delight: plant-based patty topped with garlic mushrooms, truffle mayo, melted cheese and lettuce on a mint backdrop',
    blurb: 'Garlic-butter mushrooms, truffle mayo, cashew cheddar, iceberg.',
    ingredients: ['Smash patty', 'Garlic-butter mushrooms', 'Truffle mayo', 'Cashew cheddar', 'Iceberg'],
    bg: 'var(--mint)',
    accent: 'var(--sky)',
  },
];

export const SIDES: readonly Item[] = [
  {
    id: 'fries',
    name: 'Good Mood Fries',
    price: 375,
    image: 'side-fries',
    alt: 'Golden skin-on fries in a pink paper carton on a sky-blue backdrop',
    blurb: 'Skin-on, sea salt, crispy.',
  },
  {
    id: 'tfries',
    name: 'Truffle Mayo Fries',
    price: 425,
    image: 'side-truffle-fries',
    alt: 'Fries loaded with truffle mayo, black pepper and chives in a kraft tray',
    blurb: 'Our fries, drowned in the good stuff.',
  },
];

export const DRINKS: readonly Item[] = [
  {
    id: 'lemon',
    name: 'Sparkling Lemonade',
    price: 325,
    image: 'drink-lemonade',
    alt: 'Tall glass of sparkling lemonade with lemon slices, mint and a pink striped straw',
    blurb: 'House-made, not too sweet.',
  },
  {
    id: 'shake',
    name: 'Strawberry Oat Shake',
    price: 495,
    image: 'drink-shake',
    alt: 'Thick pink strawberry oat shake with whipped topping and fresh strawberries',
    blurb: 'Thick enough to need a spoon.',
  },
];

export const DIPS: readonly Item[] = [
  {
    id: 'dip-spicy',
    name: 'Spicy Sunshine',
    price: 100,
    image: 'dip-spicy',
    alt: 'Pot of deep red chipotle dip seen from above',
    blurb: 'Chipotle, smoked paprika and a squeeze of lime. Warm, not wild.',
  },
  {
    id: 'dip-boys',
    name: 'Boys Sauce',
    price: 100,
    image: 'dip-boys',
    alt: 'Pot of peach-coloured pickle-flecked burger sauce with a fry dipped in it',
    blurb: 'The tangy, pickle-flecked house sauce. On every burger, by law.',
  },
  {
    id: 'dip-truffle',
    name: 'Truffle Mayo',
    price: 100,
    image: 'dip-truffle',
    alt: 'Pot of creamy truffle mayo speckled with black truffle',
    blurb: 'Aquafaba mayo, black truffle, a little garlic. Dangerous with fries.',
  },
];

export const CATALOG: Readonly<Record<ItemId, Item>> = Object.fromEntries(
  [...BURGERS, ...SIDES, ...DRINKS, ...DIPS].map((i) => [i.id, i]),
) as Record<ItemId, Item>;

export const isBurger = (id: ItemId): id is BurgerId => BURGERS.some((b) => b.id === id);

/** "€9,95" — matches the brand's own price style (no space, comma decimal). */
export const eur = (c: Cents): string => `€${Math.floor(c / 100)},${String(Math.abs(c) % 100).padStart(2, '0')}`;

/** Combo price is derived, never stored: burger + upcharge. */
export const comboPrice = (burger: BurgerId): Cents => CATALOG[burger].price + COMBO_UPCHARGE;

export const ANATOMY = [
  { id: 'bun-top', name: 'Brioche-style bun', text: 'Egg-free, butter-glazed and toasted to order.' },
  { id: 'lettuce', name: 'Crunchy iceberg', text: 'Shredded fresh every morning.' },
  { id: 'tomato', name: 'Vine tomato', text: 'Thick-cut, ripe, lightly salted.' },
  { id: 'cheese', name: 'Cashew cheddar', text: 'Melts, drips and stretches like it should.' },
  { id: 'patty', name: 'The smash patty', text: 'Pea & fava protein, smashed hard on a screaming-hot plate.' },
  { id: 'bun-bottom', name: 'Boys Sauce base', text: 'Our tangy house sauce, on every bottom bun.' },
] as const;
