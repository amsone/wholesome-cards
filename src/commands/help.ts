import {
  commands,
  Command,
  findCommand,
  HelpCommand,
  isGetCommand,
  isHelpCommand,
  isStartStopCommand,
  isStateChangeCommand,
} from "../commands";
import { Message, MessageEmbed } from "discord.js";
import { prefix } from "../config";

const command: HelpCommand = {
  name: "help",
  description: "DMs you a list of commands.",
  usage: "[command]",
  aliases: ["commands"],
  executeHelp: (m: Message, args: string[]): void => {
    let request: string | undefined = args[0];
    if (typeof request !== "undefined" && request.startsWith(prefix)) {
      request = request.slice(prefix.length);
    }
    const command: Command | undefined = findCommand(request);
    let n: string | MessageEmbed = "";

    if (typeof request === "undefined") {
      const helpCmdList: string = commands
        .filter((c: Command): boolean => isHelpCommand(c))
        .map((c: Command): string => `\`${c.name}\``)
        .join(" ");
      const startStopCmdList: string = commands
        .filter((c: Command): boolean => isStartStopCommand(c))
        .map((c: Command): string => `\`${c.name}\``)
        .join(" ");

      const getCmdList: string = commands
        .filter((c: Command): boolean => isGetCommand(c))
        .map((c: Command): string => `\`${c.name}\``)
        .join(" ");

      const stateChangeCmdList: string = commands
        .filter((c: Command): boolean => isStateChangeCommand(c))
        .map((c: Command): string => `\`${c.name}\``)
        .join(" ");

      n = new MessageEmbed();
      n.setTitle("Help");
      n.setDescription(
        "Here are all the commands I support. Use `help [command]` to get more \
info about a specific command."
      );
      n.addField("Help commands", helpCmdList);
      n.addField("Starting and stopping games", startStopCmdList);
      n.addField("Getting info about a game", getCmdList);
      n.addField("Playing", stateChangeCmdList);
    } else {
      if (typeof command === "undefined") {
        n = "I don't recognize that command.";
        m.channel.send(n);
      } else {
        n = new MessageEmbed();
        n.setTitle(command.name);
        n.setDescription(command.description);
        let usageDesc = `\`${prefix}${command.name}`;
        if (command.usage) {
          usageDesc += ` ${command.usage}`;
        }
        usageDesc += "`";
        n.addField("Usage", usageDesc, true);
        if (command.aliases) {
          const as = "`" + command.aliases.join("`, `") + "`";
          n.addField("Aliases", as, true);
        }
        if (command.details) {
          n.addField("Details", command.details);
        }
      }
    }
    try {
      m.author.send(n);
    } catch (e) {
      console.log(e);
      m.reply("I couldn't send you a help message. Have you blocked my DMs?");
    }
    if (m.channel.type !== "dm") {
      m.react("✅");
    }
  },
};

export default command;
