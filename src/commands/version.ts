import { Message } from "discord.js";
import { HelpCommand } from "../commands";
import { version } from "../../package.json";

const command: HelpCommand = {
  name: "version",
  description: "Tells you the current version of wholesome-cards.",
  executeHelp: (m: Message, args: string[]) => {
    m.channel.send(`Currently running wholesome-cards version ${version}.`);
  },
};

export default command;
