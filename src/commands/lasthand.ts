import { Game, removePlayer } from "../pitch";
import { Message } from "discord.js";
import { StateChangeCommand } from "../commands";

const command: StateChangeCommand = {
  name: "lasthand",
  description: "Removes you from the next hand.",
  aliases: ["dealmeout"],
  details: "Removes you from the game, starting with the next hand. Your score \
will be kept, and you'll get it back if you join the same game again.",
  executeStateChange: (m: Message, g: Game, args: string[]) => {
    const newGame: Game = removePlayer(g, m.author);

    m.reply("you won't be dealt any new cards next hand.");

    return newGame;
  }
}

export default command;
