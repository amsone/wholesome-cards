import { Game, Suit, trumpSuit } from "../pitch";
import { GetCommand } from "../commands";
import { Message } from "discord.js";
import { suitToString } from "../string-converters";

const command: GetCommand = {
  name: "trump",
  description: "Tells you what trump is.",
  details: "Will either reply in-channel or in DMs, depending on your message.",
  aliases: ["trumps"],
  executeGet: (m: Message, g: Game): void => {
    const trump: Suit | undefined = trumpSuit(g);
    if (typeof trump === "undefined") {
      m.channel.send("Trumps haven't been led yet.");
    } else {
      m.channel.send(`${suitToString(trump, true)} are trump.`);
    }
    return;
  }
}

export default command;
