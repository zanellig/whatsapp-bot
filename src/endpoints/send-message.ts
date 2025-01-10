import type { CoreClass, ProviderClass } from "@builderbot/bot";

export const registerSendMessage = (provider: ProviderClass, bot: CoreClass) =>
  provider.server.post(
    "/send-message",
    bot.handleCtx(async (bot, req, res) => {
      const { number, message, media } = req.body;
      if (!number) {
        res.writeHead(400);
        res.end(`Missing "number" field`);
        return;
      }
      if (!message) {
        res.writeHead(400);
        res.end(`Missing fields: "message"`);
        return;
      }
      await bot.sendMessage(number, message, {
        media,
      });
      res.end("ok");
      return;
    })
  );
