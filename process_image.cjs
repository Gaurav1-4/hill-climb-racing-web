const { Jimp } = require('jimp');

async function processImage() {
  const image = await Jimp.read('/Users/gauravgoyal/.gemini/antigravity/brain/2ad891f0-74c9-4128-addc-5a1e22b3f9a7/media__1781071371080.png');
  
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Let's guess the wheel centers
  // Assume back wheel is around 20% from left, 80% from top
  // Assume front wheel is around 80% from left, 80% from top
  // Radius ~ 15% of width
  const backCx = Math.floor(width * 0.21);
  const frontCx = Math.floor(width * 0.79);
  const cy = Math.floor(height * 0.77);
  const radius = Math.floor(width * 0.14);

  // 1. Extract the back wheel and save as wheel.png
  const wheel = image.clone();
  wheel.crop({ x: backCx - radius, y: cy - radius, w: radius * 2, h: radius * 2 });
  
  // Make the wheel circular by making outside pixels transparent
  for (let y = 0; y < wheel.bitmap.height; y++) {
    for (let x = 0; x < wheel.bitmap.width; x++) {
      const dx = x - radius;
      const dy = y - radius;
      if (dx*dx + dy*dy > radius*radius) {
        wheel.setPixelColor(0x00000000, x, y);
      }
    }
  }
  await wheel.write('public/wheel_real.png');

  // 2. Erase the wheels from the main image
  const chassis = image.clone();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dxBack = x - backCx;
      const dyBack = y - cy;
      const dxFront = x - frontCx;
      const dyFront = y - cy;

      // Erase a slightly larger radius to ensure the wheel is gone
      const eraseRadius = radius * 1.1; 
      if (dxBack*dxBack + dyBack*dyBack < eraseRadius*eraseRadius ||
          dxFront*dxFront + dyFront*dyFront < eraseRadius*eraseRadius) {
        chassis.setPixelColor(0x00000000, x, y);
      }
    }
  }
  await chassis.write('public/chassis_real.png');
  console.log('Processed image');
}

processImage().catch(console.error);
