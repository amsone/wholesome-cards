import { Game } from "../pitch";
import { GetCommand } from "../commands";
import { Message, MessageEmbed, User } from "discord.js";

const command: GetCommand = {
  name: "score",
  description: "Shows the scores in the current game.",
  aliases: ["points", "scores"],
  details:
    "Note that players who have left the game are included; they may rejoin at \
any time and keep their score.\n\n\
Will either reply in-channel or in DMs, depending on your message.",
  executeGet: (m: Message, g: Game): void => {
    const scores: [User, number][] = Array.from(g.scores);
    scores.sort(([, s1], [, s2]): number => -(s1 - s2));

    const s: string = scores
      .map(([p, s]): string => `<@${p}>: ${s}`)
      .join("\n");

    const embed: MessageEmbed = new MessageEmbed()
      .setTitle("Current score")
      .setDescription(s);

    m.channel.send(embed);
  },
};

export default command;
