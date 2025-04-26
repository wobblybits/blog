/** @format */

const x0f = new WobblyBit("x0f", {
  title: "Sona!",
  teaser:
    "Sona are geometric drawings made in sand. They showcase the unique knowledge and cultural traditions that come from Central Africa.",
  feature: `
      <p>Part of the Intangible Cultural Heritage of Humanity, Sona refers to patterns and designs drawn in the sand by the Lunda Cokwe and neighboring peoples in Central Africa. Their significance extends well beyond the beauty of the patterns themselves, as their use is intertwined with many social functions including storytelling and knowledge transmission.</p>
      <p>I first came across Sona about a decade ago when I stumbled upon the books <a href="https://www.amazon.com/Drawings-Angola-Mathematics-Paulus-Gerdes/dp/1430323132/" target="_blank">Drawings from Angola</a> and <a href="https://www.amazon.com/Lunda-Geometry-Polyominoes-Patterns-Symmetries/dp/1435726294/" target="_blank">Lunda Geometry</a> by <a href="https://en.wikipedia.org/wiki/Paulus_Gerdes" target="_blank">Paulus Gerdes</a>, a Dutch mathematician and pioneer in ethnomathematics.</p>
      <p>There are several different features of the Sona patterns that are worth exploring, but for the initial experiment I've focused on the use of "mirrors" to determine the traversals of a single path through the grid. Add new mirrors by tapping on the image. If you "pause" the image, you will be shown the complete path every time you add a mirror.</p>
    `,
  citations: [
    {
      title: "Sona Drawings and Geometric Figures on Sand",
      url: "https://ich.unesco.org/en/RL/sona-drawings-and-geometric-figures-on-sand-01994",
      source: "UNESCO",
    },
    {
      title:
        "Sona Patterns: Revisiting Contributions of People from Sub-Saharan Africa to Modern Mathematics",
      url: "https://www.sahistory.org.za/article/sona-patterns-revisiting-contributions-people-sub-saharan-africa-modern-mathematics#endnote-1-ref",
      source: "South African History Online",
    },
  ],
});

x0f.bitwidth = 192;
x0f.grid = {
  x: 11,
  y: 8,
};
x0f.cellSize = Math.round(
  x0f.bitwidth / (2 * Math.max(x0f.grid.x + 1, x0f.grid.y + 1))
);

x0f.padding = {
  x: Math.floor((x0f.bitwidth - x0f.grid.x * x0f.cellSize * 2) / 2),
  y: Math.floor((x0f.bitwidth - x0f.grid.y * x0f.cellSize * 2) / 2),
};

x0f.turtle = {
  x: x0f.padding.x + 1 * x0f.cellSize,
  y: x0f.padding.y + 2 * x0f.cellSize,
  angleDegrees: 450,
};

x0f.mirrors = {
  horizontal: new Array(x0f.grid.y + 1)
    .fill(0)
    .map((_, y) =>
      new Uint8Array(x0f.grid.x)
        .fill(0)
        .map((_, x) => (y == 0 || y == x0f.grid.y ? 1 : 0))
    ),
  vertical: new Array(x0f.grid.y)
    .fill(0)
    .map((_, y) =>
      new Uint8Array(x0f.grid.x + 1)
        .fill(0)
        .map((_, x) => (x == 0 || x == x0f.grid.x ? 1 : 0))
    ),
};

for (let i = 1; i < x0f.mirrors.horizontal.length - 1; i++) {
  for (let j = 1; j < x0f.mirrors.horizontal[i].length - 1; j++) {
    x0f.mirrors.horizontal[i][j] = Math.random() > 0.75 ? 1 : 0;
  }
}
for (let i = 1; i < x0f.mirrors.vertical.length - 1; i++) {
  for (let j = 1; j < x0f.mirrors.vertical[i].length - 1; j++) {
    x0f.mirrors.vertical[i][j] = Math.random() > 0.75 ? 1 : 0;
  }
}

x0f.voyage = {};

x0f.drawCells = (buffer) => {
  for (let i = 0; i < Object.keys(x0f.voyage).length; i++) {
    const [x, y] = Object.keys(x0f.voyage)[i].split(",");
    const color = x0f.voyage[[x, y]] % 4;
    for (let dx = 0; dx < x0f.cellSize; dx++) {
      for (let dy = 0; dy < x0f.cellSize; dy++) {
        if (
          color == 0 ||
          (color == 1 && dx % 2 == 0) ||
          (color == 2 && dy % 2 == 0) ||
          (color == 3 && (dx + dy) % 2 == 0)
        ) {
          x0f.visual.changePixel(
            x * x0f.cellSize + dx + x0f.padding.x,
            y * x0f.cellSize + dy + x0f.padding.y,
            pixelOn
          );
        }
      }
    }
  }
  return buffer;
};

x0f.drawPoints = (buffer) => {
  for (
    let x = x0f.cellSize + x0f.padding.x;
    x < x0f.cellSize * x0f.grid.x * 2 + x0f.padding.x;
    x += 2 * x0f.cellSize
  ) {
    for (
      let y = x0f.cellSize + x0f.padding.y;
      y < x0f.cellSize * x0f.grid.y * 2 + x0f.padding.y;
      y += 2 * x0f.cellSize
    ) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -2; dy <= 0; dy++) {
          if (Math.abs(dy + 1) == Math.abs(dx)) continue;
          buffer[Math.floor((x + dx + (y + dy) * x0f.bitwidth) / 8)] =
            (buffer[Math.floor((x + dx + (y + dy) * x0f.bitwidth) / 8)] &
              ~(1 << (7 - ((x + dx) % 8)))) |
            ((x0f.hideDots ? 0 : 1) << (7 - ((x + dx) % 8)));
        }
      }
    }
  }
  return buffer;
};

x0f.drawGrid = (buffer) => {
  for (
    let x = x0f.padding.x;
    x <= x0f.cellSize * x0f.grid.x * 2 + x0f.padding.x;
    x += x0f.cellSize
  ) {
    for (
      let y = x0f.padding.y;
      y <= x0f.cellSize * x0f.grid.y * 2 + x0f.padding.y;
      y++
    ) {
      buffer[Math.floor((x + y * x0f.bitwidth) / 8)] |=
        ((x + y) % 3 == 2) << (7 - (x % 8));
    }
  }
  for (
    let y = x0f.padding.y;
    y <= x0f.cellSize * x0f.grid.y * 2 + x0f.padding.y;
    y += x0f.cellSize
  ) {
    for (
      let x = x0f.padding.x;
      x <= x0f.cellSize * x0f.grid.x * 2 + x0f.padding.x;
      x++
    ) {
      buffer[Math.floor((x + y * x0f.bitwidth) / 8)] |=
        ((x + y) % 3 == 2) << (7 - (x % 8));
    }
  }
  return buffer;
};
x0f.drawMirrors = (buffer) => {
  for (let row = 0; row < x0f.mirrors.horizontal.length; row++) {
    for (let col = 0; col < x0f.mirrors.horizontal[row].length; col++) {
      if (x0f.mirrors.horizontal[row][col] == 1) {
        for (let dx = 0; dx <= 2 * x0f.cellSize; dx++) {
          const x = x0f.padding.x + col * 2 * x0f.cellSize + dx;
          const y = x0f.bitwidth - (x0f.padding.y + row * 2 * x0f.cellSize);
          buffer[Math.floor((x + y * x0f.bitwidth) / 8)] =
            (buffer[Math.floor((x + y * x0f.bitwidth) / 8)] &
              ~(1 << (7 - (x % 8)))) |
            (((x0f.hideMirrors ? 0 : 1) & ((x + y) % 2 == 0)) << (7 - (x % 8)));
        }
      }
    }
  }
  for (let row = 0; row < x0f.mirrors.vertical.length; row++) {
    for (let col = 0; col < x0f.mirrors.vertical[row].length; col++) {
      if (x0f.mirrors.vertical[row][col] == 1) {
        for (let dy = 0; dy <= 2 * x0f.cellSize; dy++) {
          const x = x0f.padding.x + col * 2 * x0f.cellSize;
          const y =
            x0f.bitwidth - (x0f.padding.y + row * 2 * x0f.cellSize + dy);
          buffer[Math.floor((x + y * x0f.bitwidth) / 8)] =
            (buffer[Math.floor((x + y * x0f.bitwidth) / 8)] &
              ~(1 << (7 - (x % 8)))) |
            (((x0f.hideMirrors ? 0 : 1) & ((x + y) % 2 == 0)) << (7 - (x % 8)));
        }
      }
    }
  }
  return buffer;
};
x0f.colorCells = (buffer) => {
  return buffer;
};
x0f.stepLine = (buffer) => {
  const bend = 30;
  const dx = Math.cos((x0f.turtle.angleDegrees * Math.PI) / 1800) > 0 ? 1 : -1;
  const dy = Math.sin((x0f.turtle.angleDegrees * Math.PI) / 1800) > 0 ? 1 : -1;

  const turtlePos = {
    x: x0f.turtle.x - x0f.padding.x,
    y: x0f.turtle.y - x0f.padding.y,
  };

  const turtleCell = {
    x: turtlePos.x / x0f.cellSize,
    y: turtlePos.y / x0f.cellSize,
  };

  const horizontalCheck = {
    x: Math.round(turtleCell.x - 1) / 2,
    y: Math.round(turtleCell.y) / 2,
  };
  const verticalCheck = {
    x: Math.round(turtleCell.x) / 2,
    y: Math.round(turtleCell.y - 1) / 2,
  };

  const isAtHorizontalMirror =
    Math.abs((turtlePos.x - x0f.cellSize) / (2 * x0f.cellSize)) % 1 < 0.001 &&
    x0f.mirrors.horizontal[horizontalCheck.y][horizontalCheck.x];

  const isAtVerticalMirror =
    Math.abs((turtlePos.y - x0f.cellSize) / (2 * x0f.cellSize)) % 1 < 0.001 &&
    x0f.mirrors.vertical[verticalCheck.y][verticalCheck.x];

  const isApproachingHorizontalMirror =
    (turtlePos.x / (2 * x0f.cellSize)) % 1 < 0.01 &&
    x0f.mirrors.horizontal[
      Math.min(
        x0f.mirrors.horizontal.length - 1,
        Math.max(
          0,
          horizontalCheck.y +
            0.5 *
              (x0f.isTurningY > 0
                ? x0f.isTurningY < x0f.cellSize
                  ? -1
                  : 1
                : 1) *
              (dy > 0 ? 1 : -1)
        )
      )
    ][
      Math.min(
        x0f.mirrors.horizontal[0].length - 1,
        Math.max(
          0,
          horizontalCheck.x +
            0.5 *
              (x0f.isTurningX > 0
                ? x0f.isTurningX < x0f.cellSize
                  ? -1
                  : -1
                : 1) *
              (dx > 0 ? 1 : -1)
        )
      )
    ];

  const isApproachingVerticalMirror =
    (turtlePos.y / (2 * x0f.cellSize)) % 1 < 0.01 &&
    x0f.mirrors.vertical[
      Math.min(
        x0f.mirrors.vertical.length - 1,
        Math.max(
          0,
          verticalCheck.y +
            0.5 *
              (x0f.isTurningY > 0
                ? x0f.isTurningY < x0f.cellSize
                  ? -1
                  : -1
                : 1) *
              (dy > 0 ? 1 : -1)
        )
      )
    ][
      Math.min(
        x0f.mirrors.vertical[0].length - 1,
        Math.max(
          0,
          verticalCheck.x +
            0.5 *
              (x0f.isTurningX > 0
                ? x0f.isTurningX < x0f.cellSize
                  ? -1
                  : 1
                : 1) *
              (dx > 0 ? 1 : -1)
        )
      )
    ];

  if (isAtHorizontalMirror) {
    x0f.turtle.angleDegrees += dx * dy > 0 ? -900 : 900;
    x0f.turtle.x += dx;
    x0f.turtle.y -= dy;
  } else if (isAtVerticalMirror) {
    x0f.turtle.angleDegrees += dx * dy > 0 ? 900 : -900;
    x0f.turtle.x -= dx;
    x0f.turtle.y += dy;
  } else {
    x0f.turtle.x += dx;
    x0f.turtle.y += dy;
  }

  if (isApproachingVerticalMirror) {
    x0f.isTurningX = 1;
  } else if (x0f.isTurningX > 0 && x0f.isTurningX < 2 * x0f.cellSize) {
    x0f.isTurningX = (x0f.isTurningX || 0) + 1;
  } else {
    x0f.isTurningX = 0;
  }
  if (isApproachingHorizontalMirror) {
    x0f.isTurningY = 1;
  } else if (x0f.isTurningY > 0 && x0f.isTurningY < 2 * x0f.cellSize) {
    x0f.isTurningY = (x0f.isTurningY || 0) + 1;
  } else {
    x0f.isTurningY = 0;
  }

  if (
    Object.keys(x0f.voyage).length > 0 &&
    x0f.voyage[[Math.floor(turtleCell.x), Math.floor(turtleCell.y)]] >= 0
  ) {
    if (
      x0f.voyage[[Math.floor(turtleCell.x), Math.floor(turtleCell.y)]] == 0 &&
      Object.keys(x0f.voyage).length > 1 &&
      x0f.turtle.angleDegrees % 3600 == 450
    ) {
      x0f.stop();
    }
  } else if (
    Math.abs(
      (turtlePos.x - x0f.padding.x - x0f.cellSize * 0.5) / x0f.cellSize
    ) %
      1 <
    0.1
  ) {
    x0f.voyage[[Math.floor(turtleCell.x), Math.floor(turtleCell.y)]] =
      Object.keys(x0f.voyage).length;
  }
  const drawX = Math.floor(
    x0f.turtle.x +
      (x0f.isTurningX > 0
        ? dx *
          (x0f.isTurningX > x0f.cellSize + 1
            ? 2 * x0f.cellSize -
              x0f.isTurningX -
              0.5 *
                x0f.cellSize *
                Math.sin((x0f.isTurningX * 0.5 * Math.PI) / x0f.cellSize)
            : -x0f.isTurningX +
              (x0f.cellSize + 1 == x0f.isTurningX ? 2 : 0) +
              0.5 *
                x0f.cellSize *
                Math.sin((x0f.isTurningX * 0.5 * Math.PI) / x0f.cellSize))
        : 0)
  );

  const drawY = Math.floor(
    x0f.turtle.y +
      (x0f.isTurningY > 0
        ? dy *
          (x0f.isTurningY > x0f.cellSize + 1
            ? 2 * x0f.cellSize -
              x0f.isTurningY -
              0.5 *
                x0f.cellSize *
                Math.sin((x0f.isTurningY * 0.5 * Math.PI) / x0f.cellSize)
            : -x0f.isTurningY +
              (x0f.cellSize + 1 == x0f.isTurningY ? 2 : 0) +
              0.5 *
                x0f.cellSize *
                Math.sin((x0f.isTurningY * 0.5 * Math.PI) / x0f.cellSize))
        : 0)
  );

  x0f.visual.changePixel(drawX, drawY, pixelOn);
  x0f.visual.changePixel(drawX + 1, drawY, pixelOn);
  x0f.visual.changePixel(drawX, drawY + 1, pixelOn);
  x0f.visual.changePixel(drawX + 1, drawY + 1, pixelOn);

  x0f.countSteps++;

  return buffer;
};

x0f.resetTurtle = () => {
  x0f.turtle = {
    x: x0f.padding.x + 1 * x0f.cellSize,
    y: x0f.padding.y + 2 * x0f.cellSize,
    angleDegrees: 450,
  };
  x0f.voyage = {};
  x0f.countSteps = 0;
};

x0f.draw = () => {
  const buffer = new Uint8Array((x0f.bitwidth * x0f.bitwidth) / 8).map(
    (_, i) => 0x00
  );
  //x0f.drawGrid(buffer);
  if (!x0f.hideDots) x0f.drawPoints(buffer);
  if (!x0f.hideMirrors) x0f.drawMirrors(buffer);
  x0f.updateImage(buffer, x0f.bitwidth);
  x0f.resetTurtle();
};

x0f.hideDots = false;
x0f.hideMirrors = false;
x0f.hideCells = true;
x0f.countSteps = 0;

x0f.draw();

x0f.isFinished = () => {
  const turtlePos = {
    x: x0f.turtle.x - x0f.padding.x,
    y: x0f.turtle.y - x0f.padding.y,
  };
  const turtleCell = {
    x: turtlePos.x / x0f.cellSize,
    y: turtlePos.y / x0f.cellSize,
  };
  return (
    x0f.countSteps > x0f.cellSize * 4 * x0f.grid.x * x0f.grid.y ||
    (x0f.voyage[[Math.floor(turtleCell.x), Math.floor(turtleCell.y)]] == 0 &&
      Object.keys(x0f.voyage).length > 1 &&
      x0f.turtle.angleDegrees % 3600 == 450)
  );
};

x0f.complete = () => {
  x0f.resetTurtle();
  while (!x0f.isFinished()) {
    x0f.stepLine(false);
  }
};

x0f.elements.image.onpointerdown = (e) => {
  const x =
    ((e.offsetX / x0f.elements.image.offsetWidth) * x0f.bitwidth -
      x0f.padding.x) /
    (x0f.cellSize * 2);
  const y =
    ((e.offsetY / x0f.elements.image.offsetHeight) * x0f.bitwidth -
      x0f.padding.y) /
    (x0f.cellSize * 2);

  if (
    Math.abs(0.5 - (x % 1)) > 0.16 &&
    Math.abs(0.5 - (y % 1)) < 0.33 &&
    Math.round(x) > 0 &&
    Math.round(x) < x0f.mirrors.vertical[0].length - 1
  ) {
    x0f.mirrors.vertical[Math.floor(y)][Math.round(x)] =
      x0f.mirrors.vertical[Math.floor(y)][Math.round(x)] == 1 ? 0 : 1;
    if (!x0f.completionMode) {
      x0f.draw();
      x0f.start();
    } else {
      x0f.draw();
      x0f.complete();
      x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
    }
  } else if (
    Math.abs(0.5 - (x % 1)) < 0.33 &&
    Math.abs(0.5 - (y % 1)) > 0.16 &&
    Math.round(y) > 0 &&
    Math.round(y) < x0f.mirrors.horizontal.length - 1
  ) {
    x0f.mirrors.horizontal[Math.round(y)][Math.floor(x)] =
      x0f.mirrors.horizontal[Math.round(y)][Math.floor(x)] == 1 ? 0 : 1;
    if (!x0f.completionMode) {
      x0f.draw();
      x0f.start();
    } else {
      x0f.draw();
      x0f.complete();
      x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
    }
  }
};

x0f.completionMode = false;

x0f.toolbar = [
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Clear Mirrors",
    onClick: () => {
      for (let i = 1; i < x0f.mirrors.horizontal.length - 1; i++) {
        for (let j = 0; j < x0f.mirrors.horizontal[i].length; j++) {
          x0f.mirrors.horizontal[i][j] = 0;
        }
      }
      for (let i = 0; i < x0f.mirrors.vertical.length; i++) {
        for (let j = 1; j < x0f.mirrors.vertical[i].length - 1; j++) {
          x0f.mirrors.vertical[i][j] = 0;
        }
      }
      x0f.draw();
      if (!x0f.completionMode) {
        x0f.start();
      } else {
        x0f.complete();
        x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
      }
    },
  },
  {
    label: "\uf212",
    classList: ["icon"],
    alt: "Random Mirror Placement",
    onClick: () => {
      for (let i = 1; i < x0f.mirrors.horizontal.length - 1; i++) {
        for (let j = 1; j < x0f.mirrors.horizontal[i].length - 1; j++) {
          x0f.mirrors.horizontal[i][j] = Math.random() > 0.75 ? 1 : 0;
        }
      }
      for (let i = 1; i < x0f.mirrors.vertical.length - 1; i++) {
        for (let j = 1; j < x0f.mirrors.vertical[i].length - 1; j++) {
          x0f.mirrors.vertical[i][j] = Math.random() > 0.75 ? 1 : 0;
        }
      }
      x0f.draw();
      if (!x0f.completionMode) {
        x0f.start();
      } else {
        x0f.complete();
        x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
      }
    },
  },
  // {
  //   label: "Pattern",
  //   alt: "Toggle Underlying Grid Pattern",
  //   onClick: () => {
  //     x0f.hideCells = !x0f.hideCells;
  //     if (!x0f.hideCells) {
  //       x0f.stop();
  //       x0f.complete();
  //       x0f.visual.buffer.fill(0x00);
  //       x0f.drawCells();
  //       x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
  //     } else {
  //       x0f.visual.buffer.fill(0x00);
  //       x0f.draw();
  //       if (!x0f.completionMode) {
  //         x0f.start();
  //       } else {
  //         x0f.complete();
  //         x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
  //       }
  //     }
  //   },
  // },
  x0f.playController(
    () => {
      x0f.completionMode = false;
      x0f.draw();
      return true;
    },
    () => {
      x0f.completionMode = true;
      x0f.draw();
      x0f.complete();
      x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
    },
    () => {
      x0f.stepLine();
      x0f.stepLine();
      x0f.updateImage(x0f.visual.buffer, x0f.bitwidth);
      if (x0f.isFinished()) {
        x0f.stop();
      }
    }
  ),
];
