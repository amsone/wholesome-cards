import { activePlayer, dealer, Hand, status } from "./hand-management";
import { GameError } from "./GameError";
import { User } from "discord.js";

// exported interfaces

export type BidValue = 0 | 2 | 3 | 4 | 5;

export interface Bid {
  readonly bidder: User;
  readonly value: BidValue;
}

// exported functions

export function highBidValue(bids: readonly Bid[]): BidValue {
  const bidValues: BidValue[] = bids.map((b: Bid): BidValue => b.value);

  if (bidValues.length === 0) {
    return 0;
  } else {
    return Math.max(...bidValues) as BidValue;
  }
}

export function highBidder(bids: readonly Bid[]): User | undefined {
  const revBids: Bid[] = bids.slice().reverse();
  // the reverse() handles dealer steals

  const highBid: Bid | undefined = revBids.find(
    (b: Bid): boolean => b.value === highBidValue(bids));

  if (typeof highBid === "undefined") {
    return undefined;
  } else {
    return highBid.bidder;
  }
}

export function makeBid(h: Hand, p: User, bv: BidValue): Hand {
  if (p !== activePlayer(h) || status(h) !== "bidding") {
    throw new GameError("you can't bid now.");
  }

  const hbv: BidValue = highBidValue(h.bids);

  let newBids: Bid[] = h.bids.slice();
  let newAPI = (h.activePlayerIndex + 1) % h.players.length;

  // find out if the bid's legal, and if it is, add it to newBids
  if (p === dealer(h)) {
    if (bv === 0) {
      // dealer may only pass if someone else has already bid
      if (hbv > 0) {
        newBids = [...newBids, {bidder: p, value: bv}];
      } else {
        let m = "you can't pass; since everyone passed, the dealer is forced.";
        m += " bid";
        throw new GameError(m);
      }
    } else if (bv >= hbv) {
      // dealer can steal bids
      newBids = [...newBids, {bidder: p, value: bv}];
    } else {
      throw new GameError("you can't bid lower than the high bid.");
    }
  } else {
    // everyone other than the dealer can always pass
    if (bv === 0) {
      newBids = [...newBids, {bidder: p, value: bv}];
    } else if (bv > hbv) {
      // everyone other than the dealer must strictly overbid
      newBids = [...newBids, {bidder: p, value: bv}];
    } else {
      throw new GameError("you must bid more than the high bid.");
    }
  }

  // find out if we're done bidding, and if so, move API to the winner
  if (newBids.length >= h.players.length) {
    const bidder: User | undefined = highBidder(newBids);
    // type guard, can't happen
    if (typeof bidder === "undefined") {
      throw new Error("no winning bidder when bids ended");
    }
    newAPI = h.players.indexOf(bidder);
  }

  return {...h, bids: newBids, activePlayerIndex: newAPI};
}
