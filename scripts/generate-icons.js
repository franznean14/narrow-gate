const fs = require('fs');
const path = require('path');

// Read the existing icon (which is base64 encoded)
const publicDir = path.join(__dirname, '..', 'public');
const existingIconPath = path.join(publicDir, 'icon-192.png');

let iconBuffer;

if (fs.existsSync(existingIconPath)) {
  const iconContent = fs.readFileSync(existingIconPath, 'utf8').trim();
  
  // Check if it's base64 encoded
  try {
    iconBuffer = Buffer.from(iconContent, 'base64');
    // Verify it's a valid PNG by checking the signature
    if (iconBuffer[0] === 0x89 && iconBuffer[1] === 0x50 && iconBuffer[2] === 0x4E && iconBuffer[3] === 0x47) {
      console.log('✓ Found valid PNG in icon-192.png (base64 encoded)');
    } else {
      throw new Error('Not a valid PNG');
    }
  } catch (err) {
    // If not base64, try reading as binary
    try {
      iconBuffer = fs.readFileSync(existingIconPath);
      if (iconBuffer[0] === 0x89 && iconBuffer[1] === 0x50) {
        console.log('✓ Found valid PNG in icon-192.png (binary)');
      } else {
        throw new Error('Not a valid PNG');
      }
    } catch (e) {
      // Create a minimal placeholder PNG
      console.log('⚠ icon-192.png is not a valid PNG, creating placeholder...');
      iconBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
    }
  }
} else {
  // Create a minimal placeholder PNG
  console.log('⚠ icon-192.png not found, creating placeholder...');
  iconBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

// Create all required icon files
const icons = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-precomposed.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-152x152-precomposed.png', size: 152 },
];

console.log('\nGenerating temporary apple-touch-icon files...\n');

icons.forEach(icon => {
  const iconPath = path.join(publicDir, icon.name);
  
  // For now, just copy the existing icon buffer
  // Browsers will scale it appropriately
  // In production, you'd want to resize to exact dimensions
  fs.writeFileSync(iconPath, iconBuffer);
  console.log(`✓ Created ${icon.name}`);
});

console.log('\n✅ All apple-touch-icon files created!');
console.log('Note: These are temporary icons copied from icon-192.png.');
console.log('For production, consider resizing to exact dimensions (180x180, 152x152).');
