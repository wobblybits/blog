/** @format */

const pixelOn = (byte, offset, bit = 1) => byte | (1 << offset);
const pixelOff = (byte, offset, bit = 0) => byte & ~(1 << offset);
const pixelSet = (byte, offset, bit) =>
  byte & ~((1 << offset) | ((bit ? 1 : 0) << offset));
const pixelFlip = (byte, offset) => byte ^ (1 << offset);

function OneBitBmp(buffer, width) {
  var _this = this;
  var dataSize =
    buffer instanceof Uint8Array
      ? 8
      : buffer instanceof Uint16Array
      ? 16
      : buffer instanceof Uint32Array
      ? 32
      : 0;
  if (dataSize === 0) {
    throw new Error("Invalid buffer type");
  }
  _this.buffer = buffer;
  _this.width = width;
  _this.height = (buffer.length * dataSize) / width;
  _this.getPixel = (x, y) => {
    const px_index = (_this.height - 1 - y) * _this.width + x;
    const byte_index = Math.floor(px_index / dataSize);
    const bit_offset = dataSize - 1 - (px_index % dataSize);
    return (_this.buffer[byte_index] & (1 << bit_offset)) !== 0;
  };
  _this.changePixel = (x, y, fn) => {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return _this.dataUri;
    }
    const px_index = (_this.height - 1 - y) * _this.width + x;
    const byte_index = Math.floor(px_index / dataSize);
    const base64_index = Math.floor(px_index / 6) + 222; //25 /*bmp header size*/ + 22; /*dataUri prefix*/
    const bit_offset = dataSize - 1 - (px_index % dataSize);
    const base64_offset = 5 - (px_index % 6);
    _this.buffer[byte_index] = fn(_this.buffer[byte_index], bit_offset);
    /* &= ~(
      (1 << bit_offset) |
      ((pixel ? 1 : 0) << bit_offset)
    ); */
    const old_char = Char64ToBit6(_this.dataUri[base64_index]);
    const new_char = Bit6ToChar64(fn(old_char, base64_offset) & 0x3f);
    /*
      (old_char >>> 0) &
        0x3f &
        ~((1 << base64_offset) | ((pixel ? 1 : 0) << base64_offset))
    );
    */
    _this.dataUri =
      _this.dataUri.slice(0, base64_index) +
      new_char +
      _this.dataUri.slice(base64_index + 1);
    return _this.dataUri;
  };
  _this.dataUri =
    "data:image/bmp;base64," +
    btoa(
      String.fromCharCode(
        ...Uint8Array.from([
          ...[0x42, 0x4d], //0x00-0x01 BMP signature
          ...[0x00, 0x00, 0x00, 0x00], //0x02-0x05 File size in bytes, can be zero if uncompressed
          ...[0x00, 0x00, 0x00, 0x00], //0x06-0x09 Reserved
          ...[0x96, 0x00, 0x00, 0x00], //0x0A-0x0D Offset to the pixel array
          ...[0x7c, 0x00, 0x00, 0x00], //0x0E-0x11 Header size
          ...[
            (_this.width >>> 0) & 0xff,
            (_this.width >>> 8) & 0xff,
            (_this.width >>> 16) & 0xff,
            (_this.width >>> 24) & 0xff,
          ], //0x12-0x15 Width
          ...[
            (_this.height >>> 0) & 0xff,
            (_this.height >>> 8) & 0xff,
            (_this.height >>> 16) & 0xff,
            (_this.height >>> 24) & 0xff,
          ], //0x16-0x19 Height
          ...[0x01, 0x00], //0x1A-0x1B Planes
          ...[0x01, 0x00], //0x1C-0x1D Bit count
          ...[0x00, 0x00, 0x00, 0x00], //0x1E-0x21 Compression
          ...[
            (_this.buffer.length >>> 0) & 0xff,
            (_this.buffer.length >>> 8) & 0xff,
            (_this.buffer.length >>> 16) & 0xff,
            (_this.buffer.length >>> 24) & 0xff,
          ], //0x22-0x25 Image size
          ...[0x00, 0x00, 0x00, 0x00], //0x26-0x29 X pixels per meter
          ...[0x00, 0x00, 0x00, 0x00], //0x2A-0x2D Y pixels per meter
          ...[0x02, 0x00, 0x00, 0x00], //0x2E-0x31 Colors used
          ...[0x02, 0x00, 0x00, 0x00], //0x32-0x35 Important colors
          ...fromHexString(
            "0000FF0000FF0000FF000000000000FF424752738FC2F52851B81E151E85EB01333333136666662666666606999999093D0AD703285C8F3200000000000000000000000004000000000000000000000000000000"
          ),
          ...[0x00, 0x00, 0x00, 0x00], //Color palette (Black)
          ...[0xff, 0xff, 0xff, 0x00], //Color palette (White)
          ...[0x00, 0x00, 0x00, 0x00], //padding
          ...new Uint8Array(_this.buffer.buffer),
        ])
      )
    );
  // console.log(_this.buffer.length, _this.dataUri.length);
  return _this;
}
/*
function oneBitBmp(buffer, width) {
  const height = (buffer.length * 8) / width;
  const bmp = Uint8Array.from([
    ...[0x42, 0x4d], //0x00-0x01 BMP signature
    ...[0x00, 0x00, 0x00, 0x00], //0x02-0x05 File size in bytes, can be zero if uncompressed
    ...[0x00, 0x00, 0x00, 0x00], //0x06-0x09 Reserved
    ...[0x92, 0x00, 0x00, 0x00], //0x0A-0x0D Offset to the pixel array
    ...[0x7c, 0x00, 0x00, 0x00], //0x0E-0x11 Header size
    ...[
      (width >>> 0) & 0xff,
      (width >>> 8) & 0xff,
      (width >>> 16) & 0xff,
      (width >>> 24) & 0xff,
    ], //0x12-0x15 Width
    ...[
      (height >>> 0) & 0xff,
      (height >>> 8) & 0xff,
      (height >>> 16) & 0xff,
      (height >>> 24) & 0xff,
    ], //0x16-0x19 Height
    ...[0x01, 0x00], //0x1A-0x1B Planes
    ...[0x01, 0x00], //0x1C-0x1D Bit count
    ...[0x00, 0x00, 0x00, 0x00], //0x1E-0x21 Compression
    ...[
      (buffer.length >>> 0) & 0xff,
      (buffer.length >>> 8) & 0xff,
      (buffer.length >>> 16) & 0xff,
      (buffer.length >>> 24) & 0xff,
    ], //0x22-0x25 Image size
    ...[0x00, 0x00, 0x00, 0x00], //0x26-0x29 X pixels per meter
    ...[0x00, 0x00, 0x00, 0x00], //0x2A-0x2D Y pixels per meter
    ...[0x02, 0x00, 0x00, 0x00], //0x2E-0x31 Colors used
    ...[0x02, 0x00, 0x00, 0x00], //0x32-0x35 Important colors
    ...fromHexString(
      "0000FF0000FF0000FF000000000000FF424752738FC2F52851B81E151E85EB01333333136666662666666606999999093D0AD703285C8F3200000000000000000000000004000000000000000000000000000000"
    ),
    ...[0x00, 0x00, 0x00, 0x00], //Color palette (Black)
    ...[0xff, 0xff, 0xff, 0x00], //Color palette (White)
    ...buffer,
  ]);
  console.log(bmp);
  console.log(toHexString(bmp));
  return "data:image/bmp;base64," + btoa(String.fromCharCode(...bmp));
}
*/
function oneBitPng(buffer, width) {
  const crc_table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let r = i;
    for (let j = 0; j < 8; j++) {
      r = r & 1 ? 0xedb88320 ^ (r >>> 1) : r >>> 1;
    }
    crc_table[i] = r;
  }
  const crc = (bytes) => {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crc_table[(crc ^ bytes[i]) & 0xff];
    }
    return ((crc ^ 0xffffffff) & 0xffffffff) >>> 8;
  };
  const IHD = fromHexString(
    //0x00-0x03 PNG signature
    "0000000D" + //0x04-0x07 IHDR chunk
      "49484452" + //IHDR header
      width.toString(16).padStart(8, "0") + //0x08-0x0B Width
      ((buffer.length * 8) / width).toString(16).padStart(8, "0") + //0x0C-0x0F Height
      "01" + //0x10-0x11 Bit depth
      "00" + //0x12-0x13 Color type
      "00" + //0x14-0x15 Compression method
      "00" + //0x16-0x17 Filter method
      "00" //0x18-0x19 Interlace method
  );
  const IDAT = fromHexString(
    buffer.length.toString(16).padStart(8, "0") + "49444154"
  );
  const IEND = fromHexString("00000000" + "49454E44");
  console.log({
    preamble: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    IHD,
    IHD_crc: fromHexString(crc(IHD).toString(16).padStart(8, "0")),
    IDAT,
    IDAT_crc: fromHexString(crc(IDAT).toString(16).padStart(8, "0")),
    IEND,
    IEND_crc: fromHexString(crc(IEND).toString(16).padStart(8, "0")),
  });
  const png = Uint8Array.from([
    ...[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    ...IHD,
    ...fromHexString(crc(IHD).toString(16).padStart(8, "0")),
    ...IDAT,
    ...buffer,
    ...fromHexString(crc(buffer).toString(16).padStart(8, "0")),
    ...IEND,
    ...fromHexString(crc(IEND).toString(16).padStart(8, "0")),
  ]);
  //);//.push(buffer);
  console.log(png);
  console.log(toHexString(png));
  return "data:image/png;base64," + btoa(String.fromCharCode(...png));
}

function oneBitTiff(buffer, width) {
  const tiff = Uint8Array.from([
    ...//fromHexString(
    (
      "4D4D002A" + //0x00-0x03 TIFF header, endianness, endianness check
      "00000008" + //0x04-0x07 Pointer to first IFD
      "000B" + //0x08-0x09 Number of tags in IFD
      "0100" +
      "0003" +
      "00000001" +
      width.toString(16).padStart(4, "0") +
      "0000" + //0x0A-0x15, value 0x12-0x13 Image width
      "0101" +
      "0003" +
      "00000001" +
      ((buffer.length * 8) / width).toString(16).padStart(4, "0") +
      "0000" + //0x16-0x21, value 0x1E-0x1F Image height
      "0102" +
      "0003" +
      "00000001" +
      "0001" +
      "0000" + //0x22-0x2D, value 0x2A-0x2B Bits per sample
      "0103" +
      "0003" +
      "00000001" +
      "0001" +
      "0000" + //0x2E-0x39, value 0x36-0x37 Compression
      "0106" +
      "0003" +
      "00000001" +
      "0001" +
      "0000" + //0x3A-0x45, value 0x01-0x02 Photometric interpretation
      "0112" +
      "0003" +
      "00000001" +
      "0001" +
      "0000" + //0x46-0x51, value 0x01-0x02 Orientation
      "0115" +
      "0003" +
      "00000001" +
      "0001" +
      "0000" + //0x52-0x5D Samples per pixel
      "011C" +
      "0003" +
      "00000001" +
      "0001" +
      "0000" + //0x5E-0x69 Planar configuration
      "0111" +
      "0004" +
      "00000001" +
      "00000092" + //0x6A-0x6D Strip offsets
      "0116" +
      "0003" +
      "00000001" +
      (buffer.length / width).toString(16).padStart(4, "0") +
      "0000" + //0x6E-0x71 Rows per strip
      "0117" +
      "0004" +
      "00000001" +
      buffer.length.toString(16).padStart(8, "0") + //0x72-0x75 Strip byte counts
      "00000000"
    ) //0x76-0x79 End of IFD
      .match(/.{1,2}/g)
      .map((byte) => parseInt(byte, 16)),
    ...buffer,
  ]);
  //);//.push(buffer);
  console.log(tiff);
  console.log(toHexString(tiff));
  return "data:image/tiff;base64," + btoa(String.fromCharCode(...tiff));
}

const fromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

const Bit6ToChar64 = (bin) =>
  String.fromCharCode(
    bin > 51
      ? bin > 61
        ? bin == 62
          ? 43
          : 47
        : bin - 4
      : bin > 25
      ? bin + 71
      : bin + 65
  );

const Char64ToBit6 = (char) => {
  if (char) {
    const code = char.charCodeAt(0);
    return code < 65
      ? code > 47
        ? code + 4
        : code > 45
        ? 63
        : 62
      : code > 91
      ? code - 71
      : code - 65;
  } else {
    console.log("Char64ToBit6 undefined", char);
    return 0xff;
  }
};
