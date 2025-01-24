import * as fs from "fs/promises";

import { addKeyword, EVENTS } from "@builderbot/bot";
import { createTempDir } from "~/utils/tmp-dir";
import FormDataTransformer from "~/utils/file-transformer";
import { ERROR_MESSAGES } from "~/constants/messages";

const pdfFlow = () => {
  return addKeyword([EVENTS.DOCUMENT, EVENTS.MEDIA]).addAction(
    async (ctx, { ..._ }) => {
      await _.provider.vendor.sendPresenceUpdate("online", ctx.key.remoteJid);
      const tempdir = await createTempDir(ctx.body);
      try {
        const localPath: string = await _.provider.saveFile(ctx, {
          path: tempdir,
        });
        const tf = new FormDataTransformer();
        const body = await tf.transformFile(localPath);

        const n8nResponse = await fetch(new URL(process.env.API_ENTRY), {
          body: body,
          method: "POST",
          headers: {
            "Content-Type": tf.getContentTypeHeader(),
            "Content-Length": body.length.toString(),
            "x-phone-number": ctx.from,
          },
        })
          .then(async (r) => await r.text())
          .catch(() => ERROR_MESSAGES.PROCESSING_ERROR);

        await _.provider.vendor.sendPresenceUpdate(
          "composing",
          ctx.key.remoteJid
        );

        await _.flowDynamic(n8nResponse);

        await _.provider.vendor.sendPresenceUpdate("paused", ctx.key.remoteJid);
      } finally {
        await fs.rm(tempdir, { recursive: true, force: true });
      }
    }
  );
};

export default pdfFlow;
