import { BidValue, Card, Rank, Suit } from "./pitch";

// private helpers

function rankToString(r: Rank): string {
  switch (r) {
    case 14:
      return "A";
    case 13:
      return "K";
    case 12:
      return "Q";
    case 11:
      return "J";
    case 10:
      return "10";
    case 9:
      return "9";
    case 8:
      return "8";
    case 7:
      return "7";
    case 6:
      return "6";
    case 5:
      return "5";
    case 4:
      return "4";
    case 3:
      return "3";
    default:
      return "2";
  }
}

// exported functions

export function suitToString(s: Suit, longName?: boolean): string {
  if (longName === true) {
    switch (s) {
      case "S":
        return "spades";
      case "H":
        return "hearts";
      case "D":
        return "diamonds";
      default:
        return "clubs";
    }
  } else {
    switch (s) {
      case "S":
        return ":spadecard:"; // requires a custom emoji to deal w dark mode
      case "H":
        return ":hearts:";
      case "D":
        return ":diamonds:";
      default:
        return ":clubcard:"; // requires a custom emoji to deal w dark mode
    }
  }
}

export function bidValueToString(bv: BidValue): string {
  switch (bv) {
    case 0:
      return "pass";
    case 2:
      return "2";
    case 3:
      return "3";
    case 4:
      return "4";
    default:
      return "5";
  }
}

export function cardToString(c: Card): string {
  return `${rankToString(c.rank)}${suitToString(c.suit, false)}`;
}

export function cardArrayToString(
  cs: ReadonlyArray<Card>,
  newLines?: boolean
): string {
  const compareRanks = (c1: Card, c2: Card): number => c2.rank - c1.rank;

  const spades: Card[] = cs
    .filter((c: Card) => c.suit === "S")
    .sort(compareRanks);
  const hearts: Card[] = cs
    .filter((c: Card) => c.suit === "H")
    .sort(compareRanks);
  const diamonds: Card[] = cs
    .filter((c: Card) => c.suit === "D")
    .sort(compareRanks);
  const clubs: Card[] = cs
    .filter((c: Card) => c.suit === "C")
    .sort(compareRanks);

  const spadesStr: string = spades.map(cardToString).join(" ");
  const heartsStr: string = hearts.map(cardToString).join(" ");
  const diamondsStr: string = diamonds.map(cardToString).join(" ");
  const clubsStr: string = clubs.map(cardToString).join(" ");

  const strArray: string[] = [spadesStr, heartsStr, diamondsStr, clubsStr];

  if (newLines === true) {
    return strArray.join("\n");
  } else {
    return strArray.join(" ");
  }
}

export function mentionToUserID(s: string): string | undefined {
  const userIDs = /^<@!?(\d+)>$/;
  const maybeUserIDArr = userIDs.exec(s);
  if (maybeUserIDArr === null) return undefined;
  if (typeof maybeUserIDArr[1] !== "string") return undefined;
  return maybeUserIDArr[1];
}

export function stringToBidValue(m: string): BidValue | undefined {
  const bids = /pass|[2-5]|two|three|four|five|shoot|moon/;

  const maybeBidValueArr = bids.exec(m);

  if (maybeBidValueArr === null) return undefined;

  const maybeBidValue = maybeBidValueArr[0];

  if (maybeBidValue === "pass") {
    return 0;
  } else if (maybeBidValue === "2" || maybeBidValue === "two") {
    return 2;
  } else if (maybeBidValue === "3" || maybeBidValue === "three") {
    return 3;
  } else if (maybeBidValue === "4" || maybeBidValue === "four") {
    return 4;
  } else if (
    maybeBidValue === "5" ||
    maybeBidValue === "five" ||
    maybeBidValue === "shoot" ||
    maybeBidValue === "moon"
  ) {
    return 5;
  } else {
    return undefined;
  }
}

export function stringToCard(m: string): Card | undefined {
  const ranks = /^(((?<!j)a(?![emr]|ce|de)|(?<!c)k(?!i)|q(?!u)|j(?!a)|(?<!h)t(?![ehws]))|(?<!\d)(10|[2-9])(?!\d))|(ace|king|queen|jack|ten|nine|eight|seven|six|five|four|three|two)/;
  const suits = /((?<![bdet])s(?![eip])|h(?![etr])|d(?![eis])|c(?![ekl]))$|(spades|hearts|diamonds|clubs)/;

  const maybeRankArr = ranks.exec(m);
  const maybeSuitArr = suits.exec(m);

  if (maybeRankArr === null || maybeSuitArr === null) return undefined;

  const maybeRank = maybeRankArr[0];
  const maybeSuit = maybeSuitArr[0];

  let foundRank: Rank | undefined = undefined;
  let foundSuit: Suit | undefined = undefined;

  if (maybeRank === "a" || maybeRank === "ace") {
    foundRank = 14;
  } else if (maybeRank === "k" || maybeRank === "king") {
    foundRank = 13;
  } else if (maybeRank === "q" || maybeRank === "queen") {
    foundRank = 12;
  } else if (maybeRank === "j" || maybeRank === "jack") {
    foundRank = 11;
  } else if (maybeRank === "t" || maybeRank === "ten" || maybeRank === "10") {
    foundRank = 10;
  } else if (maybeRank === "9" || maybeRank === "nine") {
    foundRank = 9;
  } else if (maybeRank === "8" || maybeRank === "eight") {
    foundRank = 8;
  } else if (maybeRank === "7" || maybeRank === "seven") {
    foundRank = 7;
  } else if (maybeRank === "6" || maybeRank === "six") {
    foundRank = 6;
  } else if (maybeRank === "5" || maybeRank === "five") {
    foundRank = 5;
  } else if (maybeRank === "4" || maybeRank === "four") {
    foundRank = 4;
  } else if (maybeRank === "3" || maybeRank === "three") {
    foundRank = 3;
  } else if (maybeRank === "2" || maybeRank === "two") {
    foundRank = 2;
  }

  if (maybeSuit === "s" || maybeSuit === "spades") {
    foundSuit = "S";
  } else if (maybeSuit === "h" || maybeSuit === "hearts") {
    foundSuit = "H";
  } else if (maybeSuit === "d" || maybeSuit === "diamonds") {
    foundSuit = "D";
  } else if (maybeSuit === "c" || maybeSuit === "clubs") {
    foundSuit = "C";
  }

  if (foundRank === undefined || foundSuit === undefined) {
    return undefined;
  } else {
    return { rank: foundRank, suit: foundSuit };
  }
}
