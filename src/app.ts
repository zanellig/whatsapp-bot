import { createBot, createProvider, createFlow } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";

import loadEnvFile from "~/env";
loadEnvFile();

import voiceNoteFlow from "~/flows/voice-note-flow";
import textFlow from "~/flows/text-flow";

const PORT = process.env.PORT ?? 3008;

const flows = [textFlow(), voiceNoteFlow()];

async function main() {
  const flow = createFlow(flows);
  const database = new Database();
  const provider = createProvider(Provider);
  const bot = await createBot({
    flow,
    provider,
    database,
  });

  bot.httpServer(+PORT);
}

main();
