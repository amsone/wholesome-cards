import { Message } from "discord.js";
import { HelpCommand } from "../commands";

const command: HelpCommand = {
  name: "version",
  description: "Tells you the current version of wholesome-cards.",
  executeHelp: (m: Message, args: string[]) => {
    m.channel.send(`Currently running wholesome-cards version 1.1.0.`);
  },
};

export default command;
