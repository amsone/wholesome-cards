import { activePlayer, Hand, status } from "./hand-management";
import { Card, Suit } from "./cards";
import { GameError } from "./GameError";
import { User } from "discord.js";

// exported interfaces

export interface Play {
  readonly player: User;
  readonly card: Card;
}

export type Trick = readonly Play[];

// exported functions

export function currentTrick(ts: readonly Trick[]): Trick | undefined {
  return ts[ts.length - 1];
}

export function currentTrickComplete(h: Hand): boolean {
  const t: Trick | undefined = currentTrick(h.tricks);
  if (typeof t === "undefined") return true;
  return t.length === h.players.length;
}

export function leadSuit(t: Trick | undefined): Suit | undefined {
  if (typeof t === "undefined") return undefined;
  const firstPlay: Play | undefined = t[0];
  if (typeof firstPlay === "undefined") return undefined;
  return firstPlay.card.suit;
}

export function trumpSuit(ts: readonly Trick[]): Suit | undefined {
  const firstTrick: Trick | undefined = ts[0];
  if (typeof firstTrick === "undefined") return undefined;
  const firstPlay: Play | undefined = firstTrick[0];
  if (typeof firstPlay === "undefined") return undefined;
  return firstPlay.card.suit;
}

export function trickWinner(ts: readonly Trick[], t: Trick): User | undefined {
  const trumps: Suit | undefined = trumpSuit(ts);
  if (typeof trumps === "undefined") return undefined;

  const lead: Suit | undefined = leadSuit(t);
  if (typeof lead === "undefined") return undefined;

  const winningSuit: Suit = t.some(
    (pl: Play): boolean => pl.card.suit === trumps
  )
    ? trumps
    : lead;

  const winningSuitPlays: Play[] = t.filter(
    (pl: Play): boolean => pl.card.suit === winningSuit
  );

  const winningPlay: Play = winningSuitPlays.reduce(
    (pl1: Play, pl2: Play): Play => (pl1.card.rank > pl2.card.rank ? pl1 : pl2)
  );

  return winningPlay.player;
}

export function playCard(h: Hand, p: User, c: Card): Hand {
  // check if p can play at all right now
  if (p !== activePlayer(h) || status(h) !== "playing") {
    throw new GameError("you can't play now.");
  }

  const psCards: readonly Card[] | undefined = h.playerCards.get(p);
  if (typeof psCards === "undefined") {
    throw new Error("player didn't have a card array, should be impossible");
  }

  // check if p has c in their hand
  if (
    !psCards.some((d: Card): boolean => c.rank === d.rank && c.suit === d.suit)
  ) {
    throw new GameError("you can't play a card you don't have.");
  }

  // check if p is NOT allowed to play c now: "your play is restricted if..."
  // ...it's not a new trick (bc you can always open with anything)
  if (!currentTrickComplete(h)) {
    // ...p isn't playing trump (bc you can always play any trump you have)
    if (c.suit !== trumpSuit(h.tricks)) {
      // ...and p could follow suit (bc if you can't, you can play anything)
      if (
        psCards.some(
          (d: Card): boolean => d.suit === leadSuit(currentTrick(h.tricks))
        )
      ) {
        // ...but they're not following
        if (c.suit !== leadSuit(currentTrick(h.tricks))) {
          throw new GameError("you must follow suit (or play trumps).");
        }
      }
    }
  }
  // at this point, {player: p, card: c} is a legal Play

  // first, take c out of p's hand
  const newPsCards: readonly Card[] = psCards.filter(
    (d: Card): boolean => c.suit !== d.suit || c.rank !== d.rank
  );
  const newPlayerCards: Map<User, readonly Card[]> = new Map(
    h.playerCards.entries()
  );
  newPlayerCards.set(p, newPsCards);

  // set up h.tricks's return values
  let newCurrTrick: Trick | undefined = currentTrick(h.tricks);
  let newTricks: readonly Trick[];

  // add {p: p, c: c} to the current trick (or start a new one, depending)
  if (
    typeof newCurrTrick === "undefined" ||
    newCurrTrick.length === h.players.length
  ) {
    newCurrTrick = [{ player: p, card: c }];
    newTricks = [...h.tricks, newCurrTrick];
  } else {
    newCurrTrick = [...newCurrTrick, { player: p, card: c }];
    newTricks = [...h.tricks.slice(0, -1), newCurrTrick];
  }

  // set the new API, either next player or trick winner
  let newAPI: number = (h.activePlayerIndex + 1) % h.players.length;
  if (newCurrTrick.length === h.players.length) {
    const winner: User | undefined = trickWinner(newTricks, newCurrTrick);
    // type guard, can't happen
    if (typeof winner === "undefined") {
      throw new Error("complete trick had no winner, should be impossible");
    }
    newAPI = h.players.indexOf(winner);
  }

  return {
    ...h,
    playerCards: newPlayerCards,
    tricks: newTricks,
    activePlayerIndex: newAPI,
  };
}
