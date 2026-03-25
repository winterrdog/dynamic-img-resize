import sharp from "sharp";
import { rename } from "fs/promises";

const filePaths = process.argv.slice(2);
if (filePaths.length === 0) {
  console.error("Usage: ts-node script.ts <image1.jpg> <image2.jpg> ...");
  process.exit(1);
}

Promise.all(filePaths.map(resizeAndOptimizeImages))
  .then(() => console.log("All files processed successfully!"))
  .catch(console.error);

// ==============================

// === types & interfaces ===
type Platform = "mobile" | "desktop";
interface Size {
  width: number;
  height: number;
  platform: Platform;
}

// === main function ===
async function resizeAndOptimizeImages(imgPath: string) {
  const sizes: Size[] = [
    // { platform: "mobile", width: 854, height: 480 }, //480p
    { platform: "desktop", width: 1280, height: 720 }, //720p
  ];

  console.log(`-- start transformation: ${imgPath} --`);
  for (var size of sizes) {
    // core pipeline to be replicated across the IMG encoders
    const pipeline = sharp(imgPath).resize({
      width: size.width,
      height: size.height,
      fit: "cover", // fit in the shadcn cards nicely
      kernel: "lanczos3", // high quality resampling
    });
    await saveImages(pipeline, imgPath);
  }

  console.log(`-- DONE transformation: ${imgPath} --`);
}

async function saveImages(
  pipeline: sharp.Sharp,
  imgPath: string,
): Promise<void> {
  const tempPath = `${imgPath}.tmp`;

  // 1. generate JPEG only
  await pipeline.clone().jpeg({ mozjpeg: true, quality: 90 }).toFile(tempPath);

  // overwrite original file with processed version
  await rename(tempPath, imgPath);
}
