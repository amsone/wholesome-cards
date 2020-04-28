import { addPlayer, Game } from "../pitch";
import { Message } from "discord.js";
import { StateChangeCommand } from "../commands";

const command: StateChangeCommand = {
  name: "dealmein",
  description: "Adds you to the current game.",
  aliases: ["addme"],
  executeStateChange: (m: Message, g: Game, args: string[]): Game => {
    const newGame: Game = addPlayer(g, m.author);
    m.reply("you'll be dealt into the next hand.");
    return newGame;
  },
};

export default command;
