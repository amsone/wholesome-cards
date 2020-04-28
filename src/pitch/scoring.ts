import { BidValue, highBidValue, highBidder } from "./bidding";
import { Card, Suit } from "./cards";
import { Hand, status } from "./hand-management";
import { Play, trickWinner, Trick, trumpSuit } from "./playing";
import { User } from "discord.js";

// helper functions

function tricksToPlays(ts: readonly Trick[]): readonly Play[] {
  // seems like Array.flat() doesn't exist in Typescript? WTH?
  return ([] as Play[]).concat(...ts);
}

function cardsWon(ts: readonly Trick[], p: User): readonly Card[] {
  const tricksWon: Trick[] = ts.filter(
    (t: Trick): boolean => trickWinner(ts, t) === p);
  const playsInTricksWon: readonly Play[] = tricksToPlays(tricksWon);
  return playsInTricksWon.map((pl: Play): Card => pl.card);
}

function cardWinner(ts: readonly Trick[], c: Card): User | undefined {
  const fromTrick: Trick | undefined = ts.find(
  (t: Trick): boolean => t.some(
  (pl: Play): boolean => pl.card.rank === c.rank && pl.card.suit === c.suit));

  if (typeof fromTrick === "undefined") return undefined;

  return trickWinner(ts, fromTrick);
}

function trumpsPlayed(ts: readonly Trick[]): readonly Card[] {
  const allPlays: readonly Play[] = tricksToPlays(ts);
  const allCards: readonly Card[] = allPlays.map((pl: Play): Card => pl.card);
  return allCards.filter((c: Card): boolean => c.suit === trumpSuit(ts));
}

// point functions

export function highPointWinner(h: Hand): User | undefined {
  const trumps: Suit | undefined = trumpSuit(h.tricks);
  if (typeof trumps === "undefined") return undefined; // no one played yet

  const highTrump: Card = trumpsPlayed(h.tricks).reduce(
  (c1: Card, c2: Card): Card => (c1.rank > c2.rank) ? c1 : c2,
  {rank: 2, suit: trumps}); // the dummy card provided here will always lose
  return cardWinner(h.tricks, highTrump);
}

export function lowPointWinner(h: Hand): User | undefined {
  const trumps: Suit | undefined = trumpSuit(h.tricks);
  if (typeof trumps === "undefined") return undefined; // no one played yet

  const lowTrump: Card = trumpsPlayed(h.tricks).reduce(
  (c1: Card, c2: Card): Card => (c1.rank < c2.rank) ? c1 : c2,
  {rank: 14, suit: trumps}); // the dummy card provided here will always lose
  return cardWinner(h.tricks, lowTrump);
}

export function jackPointWinner(h: Hand): User | undefined {
  const jackOfTrumps: Card | undefined = trumpsPlayed(h.tricks).find(
  (c: Card): boolean => c.rank === 11);

  if (typeof jackOfTrumps === "undefined") {
    return undefined;
  } else {
    return cardWinner(h.tricks, jackOfTrumps);
  }
}

export function gamePointWinner(h: Hand): User | undefined {
  const cardsToGamePts = ((cs: readonly Card[]): number => cs.reduce(
    (sum: number, c: Card) => { switch (c.rank) {
        case 14:
          return sum + 4;
        case 13:
          return sum + 3;
        case 12:
          return sum + 2;
        case 11:
          return sum + 1;
        case 10:
          return sum + 10;
        default:
          return sum;
      }
    }, 0));

  const playerGamePts: number[] = h.players.map((p: User): number =>
    cardsToGamePts(cardsWon(h.tricks, p)));

  const mostGame: number = Math.max(...playerGamePts);

  if (playerGamePts.filter((n: number): boolean => n === mostGame).length > 1) {
    // two or more players tied for Game
    return undefined;
  } else {
    return h.players[playerGamePts.indexOf(mostGame)];
  }
}

export function moonPointWinner(h: Hand): User | undefined {
  // moon is only awarded with a 5 bid
  if (highBidValue(h.bids) < 5) return undefined;

  const bidder: User | undefined = highBidder(h.bids);
  if (typeof bidder === "undefined") return undefined;
  // type guard, can't happen

  const bidderCardsWon: readonly Card[] = cardsWon(h.tricks, bidder);

  // you only receive this point if you win every card
  return (bidderCardsWon.length === h.players.length * 6) ? bidder : undefined;
}

// main scorer

export function scoreHand(h: Hand): ReadonlyMap<User, number> {
  if (status(h) !== "scoring") {
    throw new Error("tried to score a hand in progress");
  }

  // award points
  const highWinner: User | undefined = highPointWinner(h);
  const lowWinner: User | undefined = lowPointWinner(h);
  const jackWinner: User | undefined = jackPointWinner(h);
  const gameWinner: User | undefined = gamePointWinner(h);
  const moonWinner: User | undefined = moonPointWinner(h);

  // type guard, can't happen
  if (typeof highWinner === "undefined" || typeof lowWinner === "undefined") {
    throw new Error("High and Low didn't exist when hand was scored");
  }

  const scoreChanges: Map<User, number> = new Map();
  const zero = ((x: number | undefined): number => x || 0);

  // award High, Low, Jack, and Game
  scoreChanges.set(highWinner, 1);
  scoreChanges.set(lowWinner, zero(scoreChanges.get(lowWinner)) + 1);
  if (typeof jackWinner !== "undefined") {
    scoreChanges.set(jackWinner, zero(scoreChanges.get(jackWinner)) + 1);
  }
  if (typeof gameWinner !== "undefined") {
    scoreChanges.set(gameWinner, zero(scoreChanges.get(gameWinner)) + 1);
  }
  if (typeof moonWinner !== "undefined") {
    scoreChanges.set(moonWinner, zero(scoreChanges.get(moonWinner)) + 1);
  }

  // set back a bidder who missed their bid
  const bidder: User | undefined = highBidder(h.bids);
  const bid: BidValue | undefined = highBidValue(h.bids);
  // type guard, can't happen
  if (typeof bidder === "undefined" || typeof bid === "undefined") {
    throw new Error("There was no bid when hand was scored");
  }
  if (zero(scoreChanges.get(bidder)) < bid) {
    scoreChanges.set(bidder, -bid);
  }

  return scoreChanges;
}
