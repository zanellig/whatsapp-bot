import { addKeyword, EVENTS } from "@builderbot/bot";
import { ERROR_MESSAGES } from "~/constants/messages";

const textFlow = () => {
  return addKeyword(EVENTS.WELCOME).addAction(async (ctx, { ..._ }) => {
    await _.provider.vendor.sendPresenceUpdate("online", ctx.key.remoteJid);
    await _.provider.vendor.sendPresenceUpdate("composing", ctx.key.remoteJid);
    const n8nResponse = await fetch(new URL(process.env.API_ENTRY), {
      method: "POST",
      body: ctx.body,
      headers: {
        "x-phone-number": ctx.from,
      },
    })
      .then(async (r) => await r.text())
      .catch(() => ERROR_MESSAGES.PROCESSING_ERROR);


    await _.flowDynamic(n8nResponse);

    await _.provider.vendor.sendPresenceUpdate("paused", ctx.key.remoteJid);
  });
};

export default textFlow;
