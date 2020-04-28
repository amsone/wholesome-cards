import { Bid } from "./bidding";
import { Card, deal } from "./cards";
import { currentTrickComplete, Trick } from "./playing";
import { User } from "discord.js";

// exported interfaces

export type Status = "bidding" | "playing" | "scoring";

// exported functions

export interface Hand {
  readonly players: readonly User[];
  readonly playerCards: ReadonlyMap<User, readonly Card[]>;
  readonly bids: readonly Bid[];
  readonly tricks: readonly Trick[];
  readonly activePlayerIndex: number;
}

export function activePlayer(h: Hand): User {
  return h.players[h.activePlayerIndex];
}

export function dealer(h: Hand): User {
  return h.players[h.players.length - 1];
}

export function newHand(players: readonly User[]): Hand {
  return {
    players: players,
    playerCards: deal(players, 6),
    bids: [],
    tricks: [],
    activePlayerIndex: 0,
  };
}

export function status(h: Hand): Status {
  if (h.bids.length < h.players.length) {
    return "bidding";
  } else if (h.tricks.length < 6) {
    return "playing";
  } else {
    return (!currentTrickComplete(h)) ? "playing" : "scoring";
  }
}
