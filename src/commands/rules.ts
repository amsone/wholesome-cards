import { Message } from "discord.js";
import { HelpCommand } from "../commands";

const command: HelpCommand = {
  name: "rules",
  description: "DMs you a link to the rules.",
  executeHelp: (m: Message, args: string[]) => {
    const n = "Pagat's rules for \"cutthroat\" pitch: \
https://www.pagat.com/allfours/pitch.html";

    try {
      m.author.send(n);
    } catch (e) {
      console.log(e);
      m.reply("I couldn't send you the rules. Have you blocked my DMs?");
    }

    if (m.channel.type !== "dm") {
      m.react("✅");
    }
  }
}

export default command;
