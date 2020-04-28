import { bidValueToString } from "../string-converters";
import { highBidder, highBidValue, Game, status } from "../pitch";
import { GetCommand } from "../commands";
import { Message, User } from "discord.js";

const command: GetCommand = {
  name: "bid",
  description: "Tells you what the current bid is.",
  details: "Will either reply in-channel or in DMs, depending on your message.",
  executeGet: (m: Message, g: Game): void => {
    const bidder: User | undefined = highBidder(g);
    if (typeof bidder === "undefined") {
      m.channel.send("No one has bid yet.");
    } else {
      let n = "";
      if (status(g) === "bidding") {
        n += "Bidding is still open, but t";
      } else {
        n += "T";
      }
      n += `he current high bid is ${bidValueToString(highBidValue(g))} `;
      n += `from <@${bidder}>.`;
      m.channel.send(n);
    }
    return;
  },
};

export default command;
