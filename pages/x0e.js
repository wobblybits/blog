/** @format */

const x0e = new WobblyBit("x0e", {
  title: "Slide!",
  teaser:
    "Got some time to kill and something to prove? Tap the bottom row and get to work!",
  feature: `
    <p>I came across an image on the wikipedia page for <a href="https://en.wikipedia.org/wiki/Sliding_puzzle">Sliding Puzzle</a> and it's black and white design caught my eye. The description below the photograph says "A 7x7 sliding puzzle. The goal is for each image to appear only once horizontally, vertically, and diagonally. There is more than one solution to this puzzle." There's not really anything else to say.</p>
    <ul>
    <li><strong class='list-head'>Possible Improvements</strong>
    <ol>
      <li>Sound effects?</li>
      <li>A move counter?</li>
      <li>A prize for winning?</li>
      <li>An automatic solver?</li>
    </ol>
    </li>
    </ul>
    `,
  citations: [
    {
      title: "Source Image",
      url: "https://commons.wikimedia.org/w/index.php?curid=149183768",
      source: "Wikimedia Commons",
    },
  ],
});

x0e.bitwidth = 192;
x0e.animation = false;

x0e.tileSize = Math.floor(x0e.bitwidth / 9);
x0e.padding = {
  x: Math.floor((x0e.bitwidth - x0e.tileSize * 8) / 2),
  y: Math.floor((x0e.bitwidth - x0e.tileSize * 7) / 2),
};

x0e.drawTile = (buffer, x, y, designFn) => {
  if (!designFn) return;
  for (let dx = 0; dx < x0e.tileSize; dx++) {
    for (let dy = 0; dy < x0e.tileSize; dy++) {
      const byte = Math.floor((x + dx + (y + dy) * x0e.bitwidth) / 8);
      const bit = (x + dx + (y + dy) * x0e.bitwidth) % 8;
      if (
        dy == 0 ||
        dy == x0e.tileSize - 1 ||
        dx == 0 ||
        dx == x0e.tileSize - 1
      ) {
        if (dy == dx || Math.abs(dy - dx) == x0e.tileSize - 1) {
          buffer[byte] &= ~(1 << (7 - bit));
        } else if (dx == 0 || dy == x0e.tileSize - 1) {
          buffer[byte] |= 1 << (7 - bit);
        } else {
          buffer[byte] =
            (buffer[byte] & ~(1 << (7 - bit))) | ((dx + dy) % 2 << (7 - bit));
        }
        continue;
      }
      const color = designFn(dx, dy);
      buffer[byte] = (buffer[byte] & ~(1 << (7 - bit))) | (color << (7 - bit));
    }
  }
  return buffer;
};

x0e.circleDesign = (dx, dy) => {
  const distance = Math.hypot(
    dx - x0e.tileSize / 2 + 0.5,
    dy - x0e.tileSize / 2 + 0.5
  );
  return distance < x0e.tileSize * 0.3 ? 1 : 0;
};

x0e.squareDesign = (dx, dy) => {
  return 0;
};

x0e.diamondDesign = (dx, dy) => {
  return Math.abs(dx - x0e.tileSize / 2 + 0.5) +
    Math.abs(dy - x0e.tileSize / 2 + 0.5) <
    x0e.tileSize * 0.4
    ? 1
    : 0;
};

x0e.crossDesign = (dx, dy) => {
  return Math.abs(dx - x0e.tileSize / 2 + 0.5) < x0e.tileSize / 6 ||
    Math.abs(dy - x0e.tileSize / 2 + 0.5) < x0e.tileSize / 6
    ? 0
    : 1;
};

x0e.rightTriangleDesign = (dx, dy) => {
  return dx < dy ? 1 : 0;
};

x0e.upwardTriangleDesign = (dx, dy) => {
  return Math.abs(
    Math.abs(x0e.tileSize / 2 - dx - 0.5) - ((x0e.tileSize - 2 - dy) * 2) / 4
  ) <= 1 || dy < 2.5
    ? 0
    : 1;
};

x0e.downwardTriangleDesign = (dx, dy) => {
  return Math.abs(x0e.tileSize / 2 - dx) > dy / 2 ? 1 : 0;
};

x0e.emptyDesign = (dx, dy) => {
  return (dx + dy) % 2;
};

x0e.designs = [
  x0e.emptyDesign,
  x0e.squareDesign,
  x0e.diamondDesign,
  x0e.crossDesign,
  x0e.rightTriangleDesign,
  x0e.upwardTriangleDesign,
  x0e.downwardTriangleDesign,
  x0e.circleDesign,
];

x0e.state = [
  [5, 4, 3, 2, 7, 7, 4, 0],
  [2, 3, 3, 4, 3, 5, 4],
  [3, 2, 7, 2, 2, 7, 7],
  [7, 1, 1, 1, 1, 1, 1],
  [5, 4, 5, 5, 4, 5, 3],
  [6, 6, 6, 6, 6, 6, 6],
  [1, 2, 3, 2, 4, 5, 7],
];

x0e.freeRow = 0;
x0e.freeCol = x0e.state[0].length - 1;

x0e.elements.image.onpointerdown = (e) => {
  e.preventDefault();

  const row = Math.floor(
    ((1 - e.offsetY / x0e.elements.image.offsetHeight) * x0e.bitwidth -
      x0e.padding.y) /
      x0e.tileSize
  );
  const col = Math.floor(
    ((e.offsetX / x0e.elements.image.offsetWidth) * x0e.bitwidth -
      x0e.padding.x) /
      x0e.tileSize
  );

  if (row == x0e.freeRow && row >= 0 && row < x0e.state.length) {
    if (col < x0e.freeCol && col >= 0) {
      x0e.state[row] = [
        ...x0e.state[row].slice(0, col),
        0,
        ...x0e.state[row].slice(col, x0e.freeCol),
        ...x0e.state[row].slice(x0e.freeCol + 1),
      ];
      x0e.freeCol = col;
    } else if (col > x0e.freeCol && col < x0e.state[row].length) {
      x0e.state[row] = [
        ...x0e.state[row].slice(0, x0e.freeCol),
        ...x0e.state[row].slice(x0e.freeCol + 1, col + 1),
        0,
        ...x0e.state[row].slice(col + 1),
      ];
      x0e.freeCol = col;
    }
  } else if (col == x0e.freeCol && col >= 0) {
    if (row < x0e.freeRow && row >= 0 && col < x0e.state[row].length) {
      for (let i = x0e.freeRow; i > row; i--) {
        x0e.state[i][col] = x0e.state[i - 1][col];
      }
      x0e.state[row][col] = 0;
      x0e.freeRow = row;
    } else if (
      row > x0e.freeRow &&
      row < x0e.state.length &&
      col < x0e.state[row].length
    ) {
      for (let i = x0e.freeRow; i < row; i++) {
        x0e.state[i][col] = x0e.state[i + 1][col];
      }
      x0e.state[row][col] = 0;
      x0e.freeRow = row;
    }
  }

  x0e.updateImage(x0e.drawState(), x0e.bitwidth);
};

x0e.drawState = () => {
  const output = new Uint8Array((x0e.bitwidth * x0e.bitwidth) / 8).fill(0x00);
  for (let y = 0; y < x0e.state.length; y++) {
    for (let x = 0; x < x0e.state[y].length; x++) {
      const byte = Math.floor(
        (x0e.padding.x +
          x0e.padding.y * x0e.bitwidth +
          (x + y * x0e.bitwidth) * x0e.tileSize) /
          8
      );
      const bit = (x0e.padding.x + x * x0e.tileSize) % 8;
      //console.log(x0e.state[y][x], x0e.designs[x0e.state[y][x]]);
      x0e.drawTile(
        output,
        x * x0e.tileSize + x0e.padding.x,
        y * x0e.tileSize + x0e.padding.y,
        x0e.designs[x0e.state[y][x]]
      );
    }
  }
  //console.log(output);
  return output;
};

x0e.updateImage(x0e.drawState(), x0e.bitwidth);
