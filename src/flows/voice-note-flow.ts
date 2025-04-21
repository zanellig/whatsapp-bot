import * as fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { addKeyword, EVENTS } from "@builderbot/bot";
import { createTempDir } from "~/utils/tmp-dir";
import FormDataTransformer from "~/utils/file-transformer";
import { ERROR_MESSAGES } from "~/constants/messages";

const voiceNoteFlow = () => {
  return addKeyword(EVENTS.VOICE_NOTE)
    .addAnswer("Dame un momento para escuchar tu audio... 🔉")
    .addAction(async (ctx, { ..._ }) => {
      await _.provider.vendor.sendPresenceUpdate(
        "available",
        ctx.key.remoteJid
      );

      const tempdir = await createTempDir(ctx.body);
      try {
        const localPath: string = await _.provider.saveFile(ctx, {
          path: tempdir,
        });
        const tf = new FormDataTransformer();
        const body = await tf.transformFile(localPath);
        await _.provider.vendor.sendPresenceUpdate(
          "composing",
          ctx.key.remoteJid
        );
        const n8nResponse = await fetch(new URL(process.env.API_ENTRY), {
          body: body,
          method: "POST",
          headers: {
            "Content-Type": tf.getContentTypeHeader(),
            "Content-Length": body.length.toString(),
            "x-phone-number": ctx.from,
          },
        })
          .then(async (r) => {
            const contentType = r.headers.get("content-type");
            if (contentType.includes("text")) {
              return await r.text();
            }
            if (contentType.includes("audio")) {
              const arrayBuffer = await r.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const fileHash = crypto.randomUUID();
              const filePath = path.join(
                tempdir,
                `response_audio_${fileHash}.mp3`
              );

              await fs.writeFile(filePath, buffer);

              await _.flowDynamic([{ media: filePath }]);

              await fs.rm(filePath, { force: true, recursive: true });

              // this skips the next flowDynamic
              return;
            }
          })
          .catch((e) => ERROR_MESSAGES.PROCESSING_ERROR);
        await _.provider.vendor.sendPresenceUpdate("paused", ctx.key.remoteJid);
        await _.flowDynamic(n8nResponse);
      } finally {
        await fs.rm(tempdir, { recursive: true, force: true });
      }
    });
};

export default voiceNoteFlow;
