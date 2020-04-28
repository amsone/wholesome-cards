// import underlying types
import { Collection, Message } from "discord.js";
import { Game } from "./pitch";

// statically import commands and create the collection, then export getCommand
// FIXME figure out how to do this dynamically with fs and async/await?
import bid from "./commands/bid";
import cards from "./commands/cards";
import dealmein from "./commands/dealmein";
import help from "./commands/help";
import kick from "./commands/kick";
import lasthand from "./commands/lasthand";
import makebid from "./commands/makebid";
import playcard from "./commands/playcard";
import rules from "./commands/rules";
import score from "./commands/score";
import start from "./commands/start";
import stop from "./commands/stop";
import suit from "./commands/suit";
import trump from "./commands/trump";
import turn from "./commands/turn";

const commands: Collection<string, Command> = new Collection();
commands.set("bid", bid);
commands.set("cards", cards);
commands.set("dealmein", dealmein);
commands.set("help", help);
commands.set("kick", kick);
commands.set("lasthand", lasthand);
commands.set("makebid", makebid);
commands.set("playcard", playcard);
commands.set("rules", rules);
commands.set("score", score);
commands.set("start", start);
commands.set("stop", stop);
commands.set("suit", suit);
commands.set("trump", trump);
commands.set("turn", turn);
export { commands };

export function findCommand(s: string): Command | undefined {
  const command: Command | undefined = commands.get(s);
  if (typeof command !== "undefined") {
    return command;
  } else {
    return commands.find((c: Command): boolean => {
      if (typeof c.aliases !== "undefined") {
        return c.aliases.includes(s);
      } else {
        return false;
      }
    });
  }
}

// export interfaces and type guards
export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  usage?: string;
  details?: string;
}

// the help command is the only command that can be run anywhere, anytime
// it just takes a Message and DMs the author
export interface HelpCommand extends Command {
  executeHelp: (m: Message, args: string[]) => void;
}

export function isHelpCommand(cmd: Command): cmd is HelpCommand {
  return (cmd as HelpCommand).executeHelp !== undefined;
}

// GetCommands require an active Game, but don't change state, just report it
// they can be executed from a DM, unlike StartStoppers or StateChangers
export interface GetCommand extends Command {
  executeGet: (m: Message, g: Game) => void;
}

export function isGetCommand(cmd: Command): cmd is GetCommand {
  return (cmd as GetCommand).executeGet !== undefined;
}

// StartStopCommands start or stop a Game; start requires that there isn't one
// and stop requires that there is. start is the only command (besides help)
// that can be run in any TextChannel; it marks the channel as the gameChannel
export interface StartStopCommand extends Command {
  executeStartStop: (m: Message, g: Game | undefined, args: string[]) =>
  Game | undefined;
}

export function isStartStopCommand(cmd: Command): cmd is StartStopCommand {
  return (cmd as StartStopCommand).executeStartStop !== undefined;
}

// StateChangeCommands require an active Game and change its state; they must
// be run inside the gameChannel
export interface StateChangeCommand extends Command {
  executeStateChange: (m: Message, g: Game, args: string[]) => Game;
}

export function isStateChangeCommand(cmd: Command): cmd is StateChangeCommand {
  return (cmd as StateChangeCommand).executeStateChange !== undefined;
}
