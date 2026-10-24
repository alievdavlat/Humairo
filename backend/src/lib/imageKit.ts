import ImageKit, { NotFoundError } from "@imagekit/nodejs";
import type { Env } from "./env";

/* deletes an imageKit file by 'fileId'  from our db*/
export async function deleteImageKitAsset(env: Env, fileId: string | null) {
  if (!fileId) return;
  const client = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });
  try {
    await client.files.delete(fileId);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      console.warn(`ImageKit asset with fileId ${fileId} not found`);
      return;
    }
    throw error;
  }
}
