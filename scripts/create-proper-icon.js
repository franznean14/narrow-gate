const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const sourceImage = path.join(publicDir, 'Gemini_Generated_Image_4bcxga4bcxga4bcx.png');

// Create icons from the Gemini-generated image
async function createIcon(size, outputPath) {
  try {
    // Resize the source image to the desired size
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 2, g: 6, b: 23 } // Dark background #020617
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Created ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`Error creating ${path.basename(outputPath)}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Creating icon files from Gemini-generated image...\n');
  
  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error(`Error: Source image not found at ${sourceImage}`);
    console.log('Please ensure Gemini_Generated_Image_4bcxga4bcxga4bcx.png exists in the public folder.');
    process.exit(1);
  }
  
  try {
    // Get source image info
    const metadata = await sharp(sourceImage).metadata();
    console.log(`Source image: ${metadata.width}x${metadata.height}px\n`);
    
    // Create main icon
    await createIcon(192, path.join(publicDir, 'icon-192.png'));
    
    // Create apple touch icons
    await createIcon(180, path.join(publicDir, 'apple-touch-icon.png'));
    await createIcon(180, path.join(publicDir, 'apple-touch-icon-precomposed.png'));
    await createIcon(152, path.join(publicDir, 'apple-touch-icon-152x152.png'));
    await createIcon(152, path.join(publicDir, 'apple-touch-icon-152x152-precomposed.png'));
    
    console.log('\n✅ All icon files created successfully!');
    console.log('Icons generated from Gemini_Generated_Image_4bcxga4bcxga4bcx.png');
    
  } catch (error) {
    console.error('Error creating icons:', error.message);
    process.exit(1);
  }
}

main();
