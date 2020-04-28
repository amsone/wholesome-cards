import { Card, Game, GameError } from "../pitch";
import { GetCommand } from "../commands";
import { Message } from "discord.js";
import { cardArrayToString } from "../string-converters";

const command: GetCommand = {
  name: "cards",
  description: "DMs your cards to you.",
  aliases: ["hand", "myhand"],
  executeGet: (m: Message, g: Game): void => {
    const psCards: readonly Card[] | undefined =
    g.currentHand.playerCards.get(m.author);
    if (typeof psCards === "undefined") {
      throw new GameError("you don't have any cards right now.");
    }

    const n = "**Your cards**: " + cardArrayToString(psCards);

    try {
      m.author.send(n);
    } catch (e) {
      console.log(e);
      m.reply("I couldn't send you your cards. Have you blocked my DMs?");
    }

    if (m.channel.type !== "dm") {
      m.react("✅");
    }

    return;
  }
}

export default command;
