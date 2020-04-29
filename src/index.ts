import { activePlayer, BidValue, Card, Game, GameError, status } from "./pitch";
import {
  bidValueToString,
  cardToString,
  stringToBidValue,
  stringToCard,
} from "./string-converters";
import { Channel, Client, Message } from "discord.js";
import {
  Command,
  findCommand,
  isGetCommand,
  isHelpCommand,
  isStartStopCommand,
  isStateChangeCommand,
} from "./commands";
import { prefix, token } from "./config";

// set up state holders
const client = new Client();
let g: Game | undefined = undefined;
let gameChannel: Channel | undefined = undefined;

// ensure we're ready to handle messages
client.once("ready", (): void => {
  console.log(`Logged in as ${client?.user?.tag}`);
});

// handle messages
client.on("message", (m: Message): void => {
  // protect against loops
  if (m.author.bot) return;

  // set up command parsing
  let args: string[] = m.content.toLowerCase().split(/:| +/, 9);
  // (only need 9 above because the longest command, !start, takes max 8 args)
  let commandName: string | undefined = args.shift();
  if (typeof commandName === "undefined") return; // type guard, can't happen

  // first, handle non-command messages from activePlayer in gameChannel
  // and see if they're really bids or plays
  if (
    !commandName.startsWith(prefix) &&
    typeof g !== "undefined" &&
    gameChannel === m.channel &&
    m.author === activePlayer(g)
  ) {
    if (status(g) === "bidding") {
      const maybeBidValue: BidValue | undefined = stringToBidValue(commandName);

      if (typeof maybeBidValue !== "undefined") {
        // this is really a bid
        commandName = `${prefix}makebid`;
        args = [bidValueToString(maybeBidValue).toLowerCase()];
      }
    } else if (status(g) === "playing") {
      const maybeCardName: string = commandName + args.slice(0, 5).join(" ");
      const maybeCard: Card | undefined = stringToCard(maybeCardName);

      if (typeof maybeCard !== "undefined") {
        // this is really a play
        commandName = `${prefix}play`;
        args = [cardToString(maybeCard).toLowerCase()];
      }
    }
  }

  // let users skip ! in DMs...
  if (!commandName.startsWith(prefix) && m.channel.type == "dm") {
    commandName = prefix + commandName;
  }

  // ... but otherwise, at this point, ignore any message that's not a command
  // and set up command handling
  if (!commandName.startsWith(prefix)) return;
  commandName = commandName.slice(prefix.length);
  const command: Command | undefined = findCommand(commandName);

  // stop without complaining if it wasn't a real command
  if (typeof command === "undefined") return;

  // then, try to execute the command
  let n = "";
  try {
    if (isHelpCommand(command)) {
      // do Help first
      command.executeHelp(m, args);
    } else if (isStartStopCommand(command)) {
      // then StartStoppers, since start needs to work outside the gameChannel
      if (command.name === "stop" && m.channel !== gameChannel) {
        if (m.channel.type === "dm") {
          n += "Y";
        } else {
          n += "y";
        }
        n += "ou have to use that command in the game channel.";
        m.reply(n);
      } else if (m.channel.type !== "text") {
        m.reply("You can only start a game in a public channel, not DMs.");
      } else {
        g = command.executeStartStop(m, g, args);
        if (typeof g === "undefined") {
          gameChannel = undefined;
        } else {
          gameChannel = m.channel;
        }
      }
    } else {
      // finally we're handling Getters and StateChangers, who require a game
      if (typeof g !== "undefined") {
        if (isGetCommand(command)) {
          command.executeGet(m, g);
        } else if (isStateChangeCommand(command)) {
          if (m.channel === gameChannel) {
            g = command.executeStateChange(m, g, args);
          } else {
            if (m.channel.type === "dm") {
              n += "Y";
            } else {
              n += "y";
            }
            n += "ou have to use that command in the game channel.";
            m.reply(n);
          }
        }
      } else {
        if (m.channel.type === "dm") {
          n += "T";
        } else {
          n += "t";
        }
        n += "here isn't an active game. You have to start one first.";
        m.reply(n);
      }
    }
  } catch (e) {
    if (e instanceof GameError) {
      m.reply(e.message);
    } else {
      throw e;
    }
  }
});

// log in

client.login(token);
