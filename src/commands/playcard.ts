import {
  activePlayer,
  Card,
  currentTrickComplete,
  gamePointWinner,
  Game,
  GameError,
  highBidder,
  highBidValue,
  highPointWinner,
  jackPointWinner,
  lowPointWinner,
  moonPointWinner,
  nextHand,
  playCard,
  status,
  Suit,
  trumpSuit,
  updateScores,
} from "../pitch";
import { announceNewHand } from "../announcements";
import { Message, TextChannel, User } from "discord.js";
import { cardToString, stringToCard, suitToString } from "../string-converters";
import { StateChangeCommand } from "../commands";
import cards from "./cards";
import score from "./score";

const command: StateChangeCommand = {
  name: "playcard",
  description: "Tries to play a card for you.",
  usage: "[card]",
  aliases: ["play"],
  details:
    "Tries to play the card you specify. You can use shorthand, like 'KH' for \
the king of hearts or '8C' for the eight of clubs, or use emoji, like \
'10:diamonds:', or write it out, like 'the ace of spades'.\
\n\n\
You don't need to use this command explicitly. If you're the active player \
during a hand and you say something that looks like a card, it will just work.",
  executeStateChange: (m: Message, g: Game, args: string[]): Game => {
    const card: Card | undefined = stringToCard(args.join(" "));
    if (typeof card === "undefined") {
      throw new GameError("you must name a card you want to play.");
    }
    const isFirstCard: boolean = currentTrickComplete(g);

    let newGame = playCard(g, m.author, card);

    // play successful (otherwise playCard would have thrown)
    let n = `<@${m.author}> `;
    if (isFirstCard) {
      n += `led ${cardToString(card)} to open the trick`;
    } else {
      n += `played ${cardToString(card)}`;
    }

    // report the next player (and the winner if applicable)
    if (currentTrickComplete(newGame)) {
      n += ` to end the trick. <@${activePlayer(newGame)}> `;
      if (status(newGame) === "playing") {
        n += "won and is next to play.";
      } else {
        n += "won the last trick.";
      }
    } else {
      n += `; <@${activePlayer(newGame)}> is next to play.`;
    }
    m.channel.send(n);

    // unless it's the last trick, send the player their new cards
    if (newGame.currentHand.tricks.length < 6) {
      cards.executeGet(m, newGame);
    }

    // report the game end, if applicable
    if (status(newGame) === "scoring") {
      const bidder: User | undefined = highBidder(newGame);
      const trumps: Suit | undefined = trumpSuit(newGame);
      const high: User | undefined = highPointWinner(newGame);
      const low: User | undefined = lowPointWinner(newGame);
      if (
        typeof bidder === "undefined" ||
        typeof trumps === "undefined" ||
        typeof high === "undefined" ||
        typeof low === "undefined"
      ) {
        throw new Error("type guard, can't happen");
      }

      const jack: User | undefined = jackPointWinner(newGame);
      let jackString = "there was no";
      if (typeof jack !== "undefined") jackString = `<@${jack}> got`;

      const game: User | undefined = gamePointWinner(newGame);
      let gameString = "there was a tie for";
      if (typeof game !== "undefined") gameString = `<@${game}> got`;

      n = `The hand is over. <@${highBidder(newGame)}> bid `;
      n += `${highBidValue(newGame)} in ${suitToString(trumps, true)} to `;
      n += `start. <@${high}> got High, <@${high}> got Low, ${jackString} `;
      n += `Jack, and ${gameString} Game.`;
      m.channel.send(n);

      const moon: User | undefined = moonPointWinner(newGame);
      if (typeof moon !== "undefined") {
        m.channel.send(`<@${moon}> successfully shot the moon!`);
      }

      // update scores, report them, and start a new hand
      newGame = updateScores(newGame);
      score.executeGet(m, newGame);
      newGame = nextHand(newGame);
      announceNewHand(m.channel as TextChannel, newGame);
    }

    return newGame;
  },
};

export default command;
