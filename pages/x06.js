/** @format */

const x06 = new WobblyBit("x06", {
  title: "Truchet Tiles!",
  teaser: "Simple entanglements that never leave you hanging.",
  feature: `
      <p>Truchet tiles are not very complicated but visually delightful. The basic Truchet tile sets are made from distinct rotations of a single square design. This idea can be expanded to include additional tiles that have the same edge connections but different internal designs.</p>
      <ul>
      <li>
        <strong class="list-head">Possible Future Improvements</strong>
        <ol>
          <li>More tile sets</li>
          <li>Multi-scale tiling like those developed by <a href="https://christophercarlson.com/portfolio/multi-scale-truchet-patterns/">Christopher Carlson</a></li>
          <li>Interactive modes like the <a href="https://en.wikipedia.org/wiki/Black_Path_Game">Black Path Game</a></li>
          <li>Data visualizations using tiles (?)</li>
        </ol>
      </li>
      </ul>
    `,
  citations: [
    {
      title: "Truchet Tiles",
      url: "https://en.wikipedia.org/wiki/Truchet_tiles",
      source: "Wikipedia",
    },
    {
      title: "Truchet-Carlson Tiles",
      url: "https://observablehq.com/@osteele/truchet-carlson-tiles",
      source: "Observable",
    },
  ],
});

x06.bitwidth = 192;
x06.tileSize = 8;

x06.drawTriangleTile = (
  buffer,
  x,
  y,
  rotation,
  isInverted = false,
  isOutline = false,
  scale = 1
) => {
  rotation = rotation % 4;

  const offset = ((x + y) / (x06.tileSize * scale)) % 2;
  console.log(offset);

  for (let dx = 0; dx < x06.tileSize * scale; dx++) {
    for (let dy = 0; dy < x06.tileSize * scale; dy++) {
      const byte = Math.floor((x + dx + (y + dy) * x06.bitwidth) / 8);
      const bit = 7 - ((x + dx) % 8);
      const color = x06.isOutline
        ? (((rotation >> 1 ? dx : x06.tileSize * scale - 1 - dx) == dy) &
            (rotation + dx + dy + offset)) %
          2
        : ((rotation >> 1 ? dx : x06.tileSize * scale - 1 - dx) < dy) ^
          (rotation + isInverted) % 2;
      buffer[byte] = (buffer[byte] & ~(1 << bit)) | (color << bit);
    }
  }
};

x06.drawQuarterCircleTile = (
  buffer,
  x,
  y,
  rotation,
  isInverted = false,
  isOutline = false,
  scale = 1
) => {
  rotation = rotation % 2;
  for (let dx = 0; dx < x06.tileSize * scale; dx++) {
    for (let dy = 0; dy < x06.tileSize * scale; dy++) {
      const byte = Math.floor((x + dx + (y + dy) * x06.bitwidth) / 8);
      const bit = 7 - ((x + dx) % 8);
      let centerX = 0;
      let centerY = rotation == 0 ? x06.tileSize * scale - 1 : 0;
      const distance1 = Math.hypot(dx - centerX, dy - centerY);
      const distance2 = Math.hypot(
        centerX + x06.tileSize * scale - 1 - dx,
        ((centerY / (x06.tileSize * scale - 1) + 1) % 2) *
          (x06.tileSize * scale - 1) -
          dy
      );
      const color =
        (Math.abs(distance1 + 0.5 - (x06.tileSize * scale) / 2) <=
          (x06.tileSize * scale) / 6 &&
          (!isOutline ||
            Math.abs(distance1 + 0.5 - (x06.tileSize * scale) / 2) >=
              (x06.tileSize * scale) / 6 - 1)) ||
        (Math.abs(distance2 + 0.5 - (x06.tileSize * scale) / 2) <=
          (x06.tileSize * scale) / 6 &&
          (!isOutline ||
            Math.abs(distance2 + 0.5 - (x06.tileSize * scale) / 2) >=
              (x06.tileSize * scale) / 6 - 1))
          ? isInverted
          : !isInverted;
      buffer[byte] = (buffer[byte] & ~(1 << bit)) | ((color ? 1 : 0) << bit);
    }
  }
};

x06.drawBridgeTile = (
  buffer,
  x,
  y,
  rotation,
  isInverted = false,
  isOutline = false,
  scale = 1
) => {
  rotation = rotation % 2;
  for (let dx = 0; dx < x06.tileSize * scale; dx++) {
    for (let dy = 0; dy < x06.tileSize * scale; dy++) {
      const byte = Math.floor((x + dx + (y + dy) * x06.bitwidth) / 8);
      const bit = 7 - ((x + dx) % 8);
      const xWidth = Math.abs(dx + 0.5 - (x06.tileSize * scale) / 2);
      const yWidth = Math.abs(dy + 0.5 - (x06.tileSize * scale) / 2);
      const topWidth = rotation == 0 ? xWidth : yWidth;
      const bottomWidth = rotation == 0 ? yWidth : xWidth;
      let color = isInverted ? 0 : 1;
      if (topWidth < (x06.tileSize * scale) / 6) {
        if (topWidth >= (isOutline ? (x06.tileSize * scale) / 6 - 1 : 0))
          color = 1 - color;
      } else if (
        bottomWidth < (x06.tileSize * scale) / 6 &&
        bottomWidth >= (isOutline ? (x06.tileSize * scale) / 6 - 1 : 0)
      ) {
        color = 1 - color;
      }
      buffer[byte] = (buffer[byte] & ~(1 << bit)) | (color << bit);
    }
  }
};

x06.drawQuarterCircleOrBridgeTile = (
  buffer,
  x,
  y,
  rotation,
  isInverted = false,
  isOutline = false,
  scale = 1
) => {
  rotation = rotation % 4;
  if (rotation < 2) {
    x06.drawQuarterCircleTile(
      buffer,
      x,
      y,
      rotation,
      isInverted,
      isOutline,
      scale
    );
  } else {
    x06.drawBridgeTile(buffer, x, y, rotation, isInverted, isOutline, scale);
  }
};

x06.minTileSize = 8;
x06.placedTiles = [];
x06.tileScale = 4;
x06.isOutline = true;
x06.isInverted = true;
x06.drawFunctions = [
  x06.drawQuarterCircleOrBridgeTile,
  x06.drawTriangleTile,
  x06.drawQuarterCircleTile,
  x06.drawBridgeTile,
];
x06.drawFunctionNames = ["Pipes", "Triangles", "Elbows", "Weaves"];
x06.drawFunctionIndex = 0;

x06.swapTile = () => {
  const buffer = x06.visual.buffer;
  const x = Math.floor(Math.random() * x06.placedTiles.length);
  const y = Math.floor(Math.random() * x06.placedTiles[x].length);
  const tile = x06.placedTiles[x][y];
  x06.drawFunctions[x06.drawFunctionIndex](
    buffer,
    x * x06.tileSize * tile.scale,
    y * x06.tileSize * tile.scale,
    (tile.rotation + 3) % 4,
    tile.isInverted,
    tile.isOutline,
    tile.scale
  );
  x06.placedTiles[x][y].rotation = (tile.rotation + 3) % 4;
  x06.updateImage(buffer, x06.bitwidth);
};

x06.fillRandom = (
  scale = x06.tileScale,
  isInverted = x06.isInverted,
  isOutline = x06.isOutline
) => {
  const buffer = new Uint8Array((x06.bitwidth * x06.bitwidth) / 8).fill(0);
  x06.placedTiles = new Array(Math.floor(x06.bitwidth / (x06.tileSize * scale)))
    .fill(null)
    .map(() =>
      new Array(Math.floor(x06.bitwidth / (x06.tileSize * scale)))
        .fill(null)
        .map(() => ({}))
    );
  for (let y = 0; y < x06.bitwidth; y += x06.tileSize * scale) {
    for (let x = 0; x < x06.bitwidth; x += x06.tileSize * scale) {
      const rotation = Math.floor(Math.random() * 4);
      x06.drawFunctions[x06.drawFunctionIndex](
        buffer,
        x,
        y,
        rotation,
        isInverted,
        isOutline,
        scale
      );
      if (
        Math.floor(x / (x06.tileSize * scale)) < x06.placedTiles.length &&
        Math.floor(y / (x06.tileSize * scale)) <
          x06.placedTiles[Math.floor(x / (x06.tileSize * scale))].length
      ) {
        x06.placedTiles[Math.floor(x / (x06.tileSize * scale))][
          Math.floor(y / (x06.tileSize * scale))
        ] = {
          x,
          y,
          rotation,
          isInverted,
          isOutline,
          scale,
        };
      }
    }
  }
  x06.updateImage(buffer, x06.bitwidth);
};

x06.fillRandom(x06.tileScale, x06.isInverted, x06.isOutline);
x06.scalePresets = [4, 6, 8, 2, 3];
x06.tileScale = x06.scalePresets[0];

x06.toolbar = [
  x06.optionController("Tile Set", x06.drawFunctions, (value, index) => {
    x06.drawFunctionIndex = index;
    x06.fillRandom(x06.tileScale, x06.isInverted, x06.isOutline);
    return x06.drawFunctionNames[index];
  }),
  x06.optionController(undefined, [true, false], (value, index) => {
    x06.isOutline = value;
    x06.fillRandom(x06.tileScale, x06.isInverted, x06.isOutline);
    return value ? "Outline" : "Fill";
  }),
  {
    label: "Invert",
    id: "x06-invert",
    onClick: () => {
      x06.isInverted = !x06.isInverted;
      x06.fillRandom(x06.tileScale, x06.isInverted, x06.isOutline);
    },
  },
  x06.optionController("Tile Size", x06.scalePresets, (value, index) => {
    x06.placedTiles = null;
    x06.tileScale = x06.scalePresets[index];
    x06.fillRandom(x06.tileScale, x06.isInverted, x06.isOutline);
    return `${x06.tileScale * x06.tileSize}px`;
  }),
  x06.playController(
    () => true,
    () => {},
    () => {
      x06.swapTile();
    }
  ),
];
