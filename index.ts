import sharp from "sharp";

resizeAndOptimizeImages("./imgs/20260224_110030.jpg").catch((e) =>
  console.error("error happened", e),
);

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
    { platform: "mobile", width: 854, height: 480 }, //480p
    { platform: "desktop", width: 1280, height: 720 }, //720p
  ];

  var pipeline: sharp.Sharp;
  const baseName = "./out/processed_img";

  console.log("-- start transformation --");
  for (var size of sizes) {
    // core pipeline to be replicated across the IMG encoders
    pipeline = sharp(imgPath).resize({
      width: size.width,
      height: size.height,
      fit: "cover", // fit in the shadcn cards nicely
      kernel: "lanczos3", // high qulaity resampling
    });

    await saveImages(pipeline, baseName, size.platform);
  }

  console.log("-- DONE transformation --");
}

async function saveImages(
  pipeline: sharp.Sharp,
  baseName: string,
  platform: Platform,
): Promise<void> {
  // 1. generate AVIF & JPEG in parallel
  await Promise.all([
    pipeline
      .clone()
      .avif({ quality: 65, effort: 4 })
      .toFile(`${baseName}_${platform}.avif`),
    pipeline
      .clone()
      .jpeg({ mozjpeg: true, quality: 75 })
      .toFile(`${baseName}_${platform}.jpg`),
  ]);

  console.log(`+ generated ${platform} versions (AVIF & JPEG).`);
}
