import { activePlayer, dealer, Game, GameError } from "./pitch";
import { cardArrayToString } from "./string-converters";
import { MessageEmbed, TextChannel } from "discord.js";

export function announceNewHand(ch: TextChannel, g: Game): void {
  const n = `A new hand has started! <@${dealer(g)}> is the dealer; \
<@${activePlayer(g)}> is first to bid.`;
  ch.send(n);

  for (const player of g.currentHand.players) {
    const psCards = g.currentHand.playerCards.get(player);
    if (typeof psCards === "undefined") {
      throw new GameError("you don't have any cards right now.");
    }

    const n = new MessageEmbed();
    n.setTitle("Your cards");
    n.setDescription(cardArrayToString(psCards));

    try {
      player.send(n);
    } catch (e) {
      console.log(e);
      ch.send(
        `<@${player}>, I couldn't send you your cards. Have you blocked my DMs?`
      );
    }
  }
}
