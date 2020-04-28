import { GameError } from "./GameError";
import { User } from "discord.js";

// exported interfaces

export type Rank = 14 | 13 | 12 | 11 | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2;
export type Suit = "S" | "H" | "D" | "C";

export interface Card {
  readonly rank: Rank;
  readonly suit: Suit;
}

// exported functions

export function deal(
  players: readonly User[],
  handSize: number
): ReadonlyMap<User, readonly Card[]> {
  // make a new deck with one of each card
  const newDeck: Card[] = [];
  const ranks: Rank[] = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const suits: Suit[] = ["S", "H", "D", "C"];
  for (const suit of suits) {
    for (const rank of ranks) {
      newDeck.push({ rank: rank, suit: suit });
    }
  }

  // make sure we're not dealing more than the deck size
  if (players.length * handSize > newDeck.length) {
    throw new GameError("you tried to deal too many cards.");
  }

  // Fisher-Yates shuffle the cards
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    const x: Card = newDeck[i];
    newDeck[i] = newDeck[j];
    newDeck[j] = x;
  }

  // make a new Map with handSize-many Cards for each player
  const playerCards: Map<User, readonly Card[]> = new Map();
  for (const p of players) {
    playerCards.set(p, newDeck.splice(0, handSize));
  }
  return playerCards;
}
