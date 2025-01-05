import * as fs from "fs/promises";
import * as path from "path";
import { cwd } from "process";
import { type PathLike } from "fs";

/**
 *
 * @param pathName
 * @returns `undefined` if the path creation failed, else returns the **resolved path**
 */
export async function createTempDir(
  pathName: string
): Promise<string | undefined> {
  const resolvedPath = path.resolve(cwd(), "tmp", pathName);
  try {
    try {
      await fs.access(resolvedPath);
      await fs.rm(resolvedPath, { recursive: true, force: true });
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    await fs.mkdir(resolvedPath);
  } catch (e) {
    return undefined;
  }
  return resolvedPath;
}
