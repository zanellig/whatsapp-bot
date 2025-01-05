import * as fs from "fs/promises";
import path from "path";
import { addKeyword, EVENTS } from "@builderbot/bot";
import { createTempDir } from "~/utils/tmp-dir";

const voiceNoteFlow = () =>
  addKeyword(EVENTS.VOICE_NOTE)
    .addAnswer("Dame un momento para escuchar tu audio...")
    .addAction(async (ctx, { ..._ }) => {
      const tempdir = await createTempDir(ctx.body);
      const localPath: string = await _.provider.saveFile(ctx, {
        path: tempdir,
      });
      const fileBuffer = await fs.readFile(localPath);
      const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

      const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(
          `Content-Disposition: form-data; name="file"; filename="${path.basename(
            localPath
          )}"\r\n`
        ),
        Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);
      const n8nResponse = await fetch(new URL(process.env.API_ENTRY), {
        body: body,
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length.toString(),
        },
      }).then(async (r) => await r.text());
      await fs.rm(tempdir, { recursive: true, force: true });
      await _.flowDynamic(n8nResponse);
    });

export default voiceNoteFlow;
