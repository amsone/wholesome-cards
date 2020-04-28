import { commands, Command, findCommand, HelpCommand } from "../commands";
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
      const cmdList: string = commands
        .map((c: Command): string => `\`${c.name}\`: ${c.description}`)
        .join("\n");

      n = new MessageEmbed();
      n.setTitle("Help");
      n.setDescription(`To start a new game, use ${prefix}start in the channel \
where you want to play, and @mention the other players you're playing with.`);
      n.addField(
        "Command list",
        cmdList + "\n\n Use `help [command]` to get \
more info about a command."
      );
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
