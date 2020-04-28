import { activePlayer, Game, status } from "../pitch";
import { GetCommand } from "../commands";
import { Message } from "discord.js";

const command: GetCommand = {
  name: "turn",
  description: "Tells you whose turn it is.",
  details: "Will either reply in-channel or in DMs, depending on your message.",
  aliases: ["who"],
  executeGet: (m: Message, g: Game): void => {
    if (status(g) === "bidding" || status(g) === "playing") {
      m.channel.send(`It's <@${activePlayer(g)}>'s turn.`);
    } else {
      m.channel.send(`It's no one's turn, we're between hands.`);
    }
    return;
  }
}

export default command;
