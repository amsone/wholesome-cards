import { Game, leadSuit, Suit } from "../pitch";
import { GetCommand } from "../commands";
import { Message } from "discord.js";
import { suitToString } from "../string-converters";

const command: GetCommand = {
  name: "suit",
  description: "Tells you what suit was led.",
  details: "Will either reply in-channel or in DMs, depending on your message.",
  aliases: ["lead", "led"],
  executeGet: (m: Message, g: Game): void => {
    const lead: Suit | undefined = leadSuit(g);
    if (typeof lead === "undefined") {
      m.channel.send("Nothing has been led yet.");
    } else {
      m.channel.send(`${suitToString(lead, true)} were led.`);
    }
    return;
  },
};

export default command;
