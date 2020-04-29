import { highBidValue as highBidValueOfArray } from "./pitch/bidding";
import { highBidder as highBidderOfArray } from "./pitch/bidding";
import { makeBid as makeBidInHand } from "./pitch/bidding";
import { BidValue } from "./pitch/bidding";

import { Card, Rank, Suit } from "./pitch/cards";

import { GameError } from "./pitch/GameError";

import { activePlayer as activePlayerInHand } from "./pitch/hand-management";
import { dealer as dealerInHand } from "./pitch/hand-management";
import { Hand } from "./pitch/hand-management";
import { newHand as setUpNewHand } from "./pitch/hand-management";
import { status as statusInHand } from "./pitch/hand-management";
import { Status } from "./pitch/hand-management";

import { currentTrick as currentTrickOfArray } from "./pitch/playing";
import { currentTrickComplete as currentTrickCompleteInHand } from "./pitch/playing";
import { leadSuit as leadSuitOfTrick } from "./pitch/playing";
import { playCard as playCardInHand } from "./pitch/playing";
import { trumpSuit as trumpSuitOfArray } from "./pitch/playing";
import { Trick } from "./pitch/playing";

import { highPointWinner as highPointWinnerInHand } from "./pitch/scoring";
import { lowPointWinner as lowPointWinnerInHand } from "./pitch/scoring";
import { jackPointWinner as jackPointWinnerInHand } from "./pitch/scoring";
import { gamePointWinner as gamePointWinnerInHand } from "./pitch/scoring";
import { moonPointWinner as moonPointWinnerInHand } from "./pitch/scoring";
import { scoreHand } from "./pitch/scoring";

import { User } from "discord.js";

// export interfaces

export { BidValue, Card, GameError, Rank, Status, Suit };

export interface Game {
  readonly players: ReadonlyArray<User>;
  readonly scores: ReadonlyMap<User, number>;
  readonly currentHand: Hand;
}

// export functions

export function activePlayer(g: Game): User {
  return activePlayerInHand(g.currentHand);
}

export function addPlayer(g: Game, p: User): Game {
  if (g.players.includes(p)) {
    throw new GameError("you are already in the game.");
  }
  if (g.players.length >= 8) {
    throw new GameError("you can't join; the game already has 8 players.");
  }

  const newPlayers: Array<User> = [p, ...g.players];

  const newScores: Map<User, number> = new Map(g.scores.entries());
  // if the player is joining the game for the first time, score them at 0
  if (typeof g.scores.get(p) === "undefined") {
    newScores.set(p, 0);
  }

  return { players: newPlayers, scores: newScores, currentHand: g.currentHand };
}

export function currentTrickComplete(g: Game): boolean {
  return currentTrickCompleteInHand(g.currentHand);
}

export function dealer(g: Game): User {
  return dealerInHand(g.currentHand);
}

export function gamePointWinner(g: Game): User | undefined {
  return gamePointWinnerInHand(g.currentHand);
}

export function highBidValue(g: Game): BidValue {
  return highBidValueOfArray(g.currentHand.bids);
}

export function highBidder(g: Game): User | undefined {
  return highBidderOfArray(g.currentHand.bids);
}

export function highPointWinner(g: Game): User | undefined {
  return highPointWinnerInHand(g.currentHand);
}

export function jackPointWinner(g: Game): User | undefined {
  return jackPointWinnerInHand(g.currentHand);
}

export function leadSuit(g: Game): Suit | undefined {
  const t: Trick | undefined = currentTrickOfArray(g.currentHand.tricks);
  return typeof t === "undefined" ? undefined : leadSuitOfTrick(t);
}

export function lowPointWinner(g: Game): User | undefined {
  return lowPointWinnerInHand(g.currentHand);
}

export function makeBid(g: Game, p: User, bv: BidValue): Game {
  return { ...g, currentHand: makeBidInHand(g.currentHand, p, bv) };
}

export function moonPointWinner(g: Game): User | undefined {
  return moonPointWinnerInHand(g.currentHand);
}

export function newGame(newPlayers: User[]): Game {
  const dedupedPlayers: User[] = Array.from(new Set(newPlayers));

  if (dedupedPlayers.length < 2 || dedupedPlayers.length > 8) {
    throw new GameError("games require between 2 and 8 players.");
  }

  const newScores: Map<User, number> = new Map();
  for (const p of dedupedPlayers) {
    newScores.set(p, 0);
  }

  const newHand: Hand = setUpNewHand(dedupedPlayers);

  return { players: dedupedPlayers, scores: newScores, currentHand: newHand };
}

export function nextHand(g: Game): Game {
  let newPlayers = g.players;

  // if the dealer's still playing, rotate the deal
  if (g.players.includes(dealer(g))) {
    newPlayers = [...g.players.slice(-1), ...g.players.slice(0, -1)];
  }

  const newHand: Hand = setUpNewHand(newPlayers);

  return { players: newPlayers, scores: g.scores, currentHand: newHand };
}

export function playCard(g: Game, p: User, c: Card): Game {
  return { ...g, currentHand: playCardInHand(g.currentHand, p, c) };
}

export function removePlayer(g: Game, p: User): Game {
  if (!g.players.includes(p)) {
    throw new GameError(`<@${p}> already isn't in the game!`);
  }
  if (g.players.length <= 2) {
    let n = `no one can leave; the game only has 2 players. If you're done,`;
    n += " stop the game.";
    throw new GameError(n);
  }

  return { ...g, players: g.players.filter((q: User) => p !== q) };
}

export function status(g: Game): Status {
  return statusInHand(g.currentHand);
}

export function trumpSuit(g: Game): Suit | undefined {
  return trumpSuitOfArray(g.currentHand.tricks);
}

export function updateScores(g: Game): Game {
  if (status(g) !== "scoring") {
    return g;
  } else {
    const zero = (x: number | undefined): number => x || 0;

    const newScores: Map<User, number> = new Map(g.scores.entries());
    const scoreChanges: [User, number][] = Array.from(
      scoreHand(g.currentHand).entries()
    );

    for (const [player, scoreChange] of scoreChanges) {
      newScores.set(player, zero(newScores.get(player)) + scoreChange);
    }

    return { ...g, scores: newScores };
  }
}
