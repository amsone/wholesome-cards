import { Game, GameError } from "../pitch";
import { Message } from "discord.js";
import { StartStopCommand } from "../commands";

const command: StartStopCommand = {
  name: "stop",
  description: "Stops the active game.",
  aliases: ["stopgame"],
  details: "Note: This erases everything, including everyone's scores.",
  executeStartStop: (m: Message, g: Game | undefined, args: string[]):
  Game | undefined => {
    if (typeof g === "undefined") {
      throw new GameError("there isn't an active game to stop.");
    }

    m.channel.send("Game stopped.");
    return undefined;
  }
}

export default command;
