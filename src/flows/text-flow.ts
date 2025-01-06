import { addKeyword, EVENTS } from "@builderbot/bot";

const textFlow = () => {
  return addKeyword(EVENTS.WELCOME)
    .addAnswer(
      [
        "Dame un momento para pensar... ⌛",
        "Dejame leer tu mensaje...",
        "Hmmm, dame un momento...",
      ][Math.floor(Math.random() * 3)]
    )
    .addAction(async (ctx, { ..._ }) => {
      const n8nResponse = await fetch(new URL(process.env.API_ENTRY), {
        method: "POST",
        body: ctx.body,
        headers: {
          "x-phone-number": ctx.from,
        },
      }).then(async (r) => await r.text());

      await _.flowDynamic(n8nResponse);
    });
};

export default textFlow;
