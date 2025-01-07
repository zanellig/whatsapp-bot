import { addKeyword, EVENTS } from "@builderbot/bot";
import { ERROR_MESSAGES } from "~/constants/messages";

const textFlow = () => {
  return addKeyword(EVENTS.WELCOME).addAction(async (ctx, { ..._ }) => {
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
  });
};

export default textFlow;
