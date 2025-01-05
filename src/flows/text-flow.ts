import { addKeyword, EVENTS } from "@builderbot/bot";

const textFlow = () => {
  return addKeyword(EVENTS.WELCOME).addAction(async (ctx, { ..._ }) => {
    const n8nResponse = await fetch(new URL(process.env.API_ENTRY), {
      method: "POST",
      body: ctx.body,
    }).then(async (r) => await r.text());

    await _.flowDynamic(n8nResponse);
  });
};

export default textFlow;
