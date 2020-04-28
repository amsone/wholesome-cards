import { activePlayer, BidValue, Game, GameError, highBidder, highBidValue,
  makeBid, status } from "../pitch";
import { Message } from "discord.js";
import { stringToBidValue } from "../string-converters";
import { StateChangeCommand } from "../commands";

const command: StateChangeCommand = {
  name: "makebid",
  description: "Tries to make a bid for you.",
  usage: "[bid]",
  details: "Tries to make the bid you specify, either 'pass' or a number \
from 2 to 5.\n\n\
You don't need to use this command explicitly. If you're the active player \
during bidding, and you say something that looks like a bid (like 'pass' or \
'3'), it will just work.",
  executeStateChange: (m: Message, g: Game, args: string[]): Game => {
    console.log(`makebid: args: ${args}`);
    const bidValue: BidValue | undefined = stringToBidValue(args.join(" "));
    console.log(`makebid: bidValue: ${bidValue}`);
    if (typeof bidValue === "undefined") {
      throw new GameError("you must 'pass' or bid a number from 2 to 5.");
    }

    const newGame = makeBid(g, m.author, bidValue);

    // bid successful (otherwise makeBid would have thrown)
    m.react("✅");

    // if this was the last bid, report the high bidder and their bid
    if (status(newGame) === "playing") {
      let r = `Bidding complete. <@${highBidder(newGame)}> won with a `;
      r += `${highBidValue(newGame)} bid. They will lead the first trick.`;
      m.channel.send(r);
    } else {
      m.channel.send(`<@${activePlayer(newGame)}> is next to bid.`);
    }

    return newGame;
  }
}

export default command;
