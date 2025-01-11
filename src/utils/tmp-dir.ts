import * as fs from "fs/promises";
import * as path from "path";
import { cwd } from "process";

/**
 *
 * @param pathName
 * @returns `undefined` if the path creation failed, else returns the **resolved path**
 */
export async function createTempDir(
  pathName: string
): Promise<string | undefined> {
  const tmpPath = path.resolve(cwd(), "tmp");
  const resolvedPath = path.resolve(tmpPath, pathName);
  try {
    await fs.access(tmpPath).catch(async (e) => {
      if (e.code === "ENOENT") await fs.mkdir(tmpPath);
    });
    try {
      await fs.access(resolvedPath);
      await fs.rm(resolvedPath, { recursive: true, force: true });
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    await fs.mkdir(resolvedPath);
  } catch (e) {
    return undefined;
  }
  return resolvedPath;
}
