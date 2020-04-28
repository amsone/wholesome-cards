import { announceNewHand } from "../announcements";
import { Game, GameError, removePlayer } from "../pitch";
import { mentionToUserID } from "../string-converters";
import { Message, TextChannel, User } from "discord.js";
import { StateChangeCommand } from "../commands";

const command: StateChangeCommand = {
  name: "kick",
  usage: "@player",
  aliases: ["remove"],
  description: "Kicks a player and starts a new hand.",
  details:
    "Kicks a player and then starts a new hand. A new hand has to start \
since it's not clear how to change tricks the kicked player was in.",
  executeStateChange: (m: Message, g: Game, args: string[]) => {
    const maybeMention: string | undefined = args[0];
    if (typeof maybeMention !== "undefined") {
      const playerID: string | undefined = mentionToUserID(maybeMention);
      if (typeof playerID !== "undefined") {
        const player: User | undefined = m.client.users.cache.get(playerID);
        if (typeof player !== "undefined") {
          const newGame: Game = removePlayer(g, player);

          announceNewHand(m.channel as TextChannel, newGame);

          return newGame;
        }
      }
    }
    throw new GameError("you must mention a player to kick.");
  },
};

export default command;
