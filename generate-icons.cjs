// Simple Node.js script to generate solid PNG icons with zlib
const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(2, 9); // color type 2 (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw pixel data: each scanline has 1 filter byte (0) + width * 3 bytes (R, G, B)
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineLength;
    rawData[offset] = 0; // Filter: None
    
    // Check if pixel is in center circle
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < width * 0.35) {
        // Orange center #F97316
        rawData[px] = 249;
        rawData[px + 1] = 115;
        rawData[px + 2] = 22;
      } else {
        // Dark background #1A1D24
        rawData[px] = 26;
        rawData[px + 1] = 29;
        rawData[px + 2] = 36;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buffer = Buffer.alloc(4 + 4 + len + 4);
  buffer.writeUInt32BE(len, 0);
  buffer.write(type, 4);
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + len));
  buffer.writeUInt32BE(crc, 8 + len);
  return buffer;
}

// CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = c ^ buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

fs.writeFileSync('public/icons/icon-192.png', createPng(192, 192, 249, 115, 22));
fs.writeFileSync('public/icons/icon-512.png', createPng(512, 512, 249, 115, 22));
console.log('PWA PNG icons generated successfully!');
