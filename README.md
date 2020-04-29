# wholesome-cards
Simple cards-playing Discord bot, written in TypeScript for Node.js using discord.js. Intended to play trick-based games.

This is currently in a very early version that only has cutthroat pitch. Future versions will have a more generic structure to support at least partnership pitch and rubber bridge.

The code is split into commands that interact with Discord (e.g. send messages/DMs) in src/commands/, and a purely-functional gamestate implementation, in src/pitch/. The best starting points for each of those are src/commands.ts and src/pitch.ts, respectively.
