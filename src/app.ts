import { createBot, createProvider, createFlow } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";

import loadEnvFile from "~/env";
await loadEnvFile();

import voiceNoteFlow from "~/flows/voice-note-flow";
import textFlow from "~/flows/text-flow";
import pdfFlow from "~/flows/pdf-flow";
import { registerSendMessage } from "~/endpoints/send-message";

const PORT = process.env.PORT ?? 3008;

const flows = [textFlow(), voiceNoteFlow(), pdfFlow()];

async function main() {
  const flow = createFlow(flows);
  const database = new Database();
  const provider = createProvider(Provider);
  const bot = await createBot({
    flow,
    provider,
    database,
  });

  registerSendMessage(provider, bot);
  bot.httpServer(+PORT);
}

main();
