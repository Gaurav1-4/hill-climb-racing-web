const { Jimp } = require('jimp');

async function removeBackground(file) {
  const img = await Jimp.read(`public/${file}`);
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // We consider a pixel "background" if it's greyscale-ish and light
  // The checkerboard usually consists of #ffffff and #cccccc or #d0d0d0
  function isBg(c) {
    const r = (c >> 24) & 0xff;
    const g = (c >> 16) & 0xff;
    const b = (c >> 8) & 0xff;
    
    // Check if it's greyscale
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min > 30) return false; // not greyscale enough
    if (max < 150) return false; // too dark
    return true;
  }

  // Simple pass: if pixel is bg, make transparent
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = img.getPixelColor(x, y);
      if (isBg(c)) {
        img.setPixelColor(0x00000000, x, y);
      }
    }
  }

  await img.write(`public/${file}`);
  console.log(`Cleaned ${file}`);
}

async function run() {
  await removeBackground('coin.png');
  await removeBackground('fuel_can.png');
  await removeBackground('driver.png');
}

run().catch(console.error);
