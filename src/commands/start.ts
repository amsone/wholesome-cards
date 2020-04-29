import { announceNewHand } from "../announcements";
import { Game, GameError, newGame } from "../pitch";
import { mentionToUserID } from "../string-converters";
import { Message, TextChannel, User } from "discord.js";
import { StartStopCommand } from "../commands";

const command: StartStopCommand = {
  name: "start",
  description: "Starts a new game within a channel.",
  usage: "@player1 @player2 @player3...",
  aliases: ["newgame", "startnewgame"],
  details:
    "You must specify 1-7 other players to play with, and there can't be a \
game in progress. Once you start a game, all commands (except `help`) must be \
used in the game's channel, or in DMs.",
  executeStartStop: (
    m: Message,
    g: Game | undefined,
    args: string[]
  ): Game | undefined => {
    if (typeof g !== "undefined") {
      let n = "there is an active game. You have to `stop` it before starting ";
      n += "a new one.";
      throw new GameError(n);
    }

    const maybePlayerIDs: (string | undefined)[] = args.map(mentionToUserID);
    const playerIDs: string[] = [];
    for (const mPID of maybePlayerIDs) {
      if (typeof mPID === "string") playerIDs.push(mPID);
    }

    const maybePlayers: (User | undefined)[] = playerIDs.map((id: string):
      | User
      | undefined => m.client.users.cache.get(id));
    const players: User[] = [];
    for (const p of maybePlayers) {
      if (typeof p !== "undefined") players.push(p);
    }
    players.push(m.author);

    const ng: Game = newGame(players);
    announceNewHand(m.channel as TextChannel, ng);
    return ng;
  },
};

export default command;
