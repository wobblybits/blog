/** @format */

const x03 = new WobblyBit("x03", {
  title: "Automata!",
  teaser:
    "<a href='https://en.wikipedia.org/wiki/Stephen_Wolfram' target='_blank'>Stephen Wolfram</a>'s numbering system for the simplest 1-d <a href='https://en.wikipedia.org/wiki/Elementary_cellular_automaton' target='_blank'>cellular automata</a> rulesets is designed so that the number IS the rule. What?!",
  feature: `
      <p>There are lots of different types of cellular automata, but this set of 256 rulesets is a good place to start.</p>
      <ul><li>
      <strong class='list-head'>Automata Basics</strong>
      <p>The idea is straightforward: you have a row of cells that can each be either on or off, white or black, alive or dead.You can start with whatever arrangement you want, but the classic starting point is a single "living" pixel. Each subsequent row represents a step forward in time, showing the growth or decay of the living cells based on a set of survival rules.</p>
      <p>The Wolfram codes define every 256 possible ruleset of a certain template. The template is that the survival/birth/death of a cell is determined solely by it's current state and the states of each of the two cells, left and right, that are neighboring it. There are 8 (2<super>3</super>)different possible configurations of these three binary states, and for each of these configurations the ruleset needs to defined whether the center cell will be on or off in the next generation. So we need 8 bits to encode a ruleset, with the bit's value (0 or 1) telling us the new value and the bit's position (0 through 7) determining which of the 8 configurations it is applied to.</p></li>
      <li><strong class='list-head'>Wolfram Code</strong><p>Because the numbers 0-7 are by definition representable as 3-digit binary numbers, the Wolfram code is able to be both a base-10 number indexing the rulesets and a binary encoding of the ruleset itself.</p>
      <p>For example, in rule 89 (0b01011001), the first bit (location 0 = 0b000) is 1. This tells us that when a cell and each of it's neighbors  are off, a new cell will be born in that cell in the next generation. There are three other configurations that will produce a living cell &mdash; bit locations 3 (0b011), 4 (0b100), and 6 (0b110). Together, the rules at location 4 and 6 tell us that if a cell has a living left neighbor but not a living right neighbor it will be alive in the next generation. And the rule at location 3 tells us that a cell with a living right neighbor but a dead left neighbor can survive if it is already living.</p></li>
      <li><strong class='list-head'>The Implementation</strong>
      <p>The code pretty much writes itself, but I've added some interactivity to liven things up a bit. Also worth noting is that I have made the left and right edges of the image wrap around. Once the pattern begins to wrap around, interesting things can start to happen, but it might not look the same as implementations that don't wrap around.</p>
      <p>You can click on the image to change a pixel's color. Since time can only move forward, of course, this also resets the row-generation to the row that contains that pixel.</p>
      <p>You can also click the lightning bolt to add a random row of pixels to the image. For some rulesets, this creates much more interesting patterns that the initial single pixel. For others, it hardly disrupts the pattern.</p>
      <p>The full image is generated immediately upon changing the rule, but a scrolling row-by-row animation is started from the beginning at the same time. Once it has reproduced the full image (you won't notice it changing anything, of course), it scrolls past the bottom row of the original image and create new rows.</p>
      </li>
      

    `,
  citations: [
    {
      title: "Wolfram Code",
      url: "https://en.wikipedia.org/wiki/Wolfram_code",
      source: "Wikipedia",
    },
    {
      title: "Elementary Cellular Automaton",
      url: "https://en.wikipedia.org/wiki/Elementary_cellular_automaton",
      source: "Wikipedia",
    },
  ],
});

x03.bitwidth = 128;
x03.ecaRule = 89;
x03.timer = 0;

x03.changeRule = (delta) => {
  x03.timer = 0;
  x03.ecaRule = (x03.ecaRule + delta + 256) % 256;
  const input = x03.article.querySelector("#x03-rule input");
  input.value = x03.ecaRule;
  x03.updateImage(x03.elementaryAutomaton(), x03.bitwidth);
};

x03.step = () => {
  const buffer = x03.visual
    ? x03.visual.buffer
    : new Uint8Array((x03.bitwidth * x03.bitwidth) / 8).fill(0x00);
  if (x03.timer == 0) {
    const firstRow = new Uint8Array(x03.bitwidth / 8).fill(0x00);
    firstRow[Math.floor(x03.bitwidth / 2 / 8)] = 0x80;
    buffer.set(firstRow, (x03.bitwidth * x03.bitwidth) / 8);
  } else if (x03.timer < x03.bitwidth) {
    const prevRow = buffer.slice(
      ((x03.bitwidth - x03.timer) * x03.bitwidth) / 8,
      ((x03.bitwidth - x03.timer + 1) * x03.bitwidth) / 8
    );
    const nextRow = x03.elementaryAutomatonRow(prevRow);
    buffer.set(nextRow, ((x03.bitwidth - x03.timer - 1) * x03.bitwidth) / 8);
  } else {
    const prevRow = buffer.slice(0, x03.bitwidth / 8);
    const nextRow = x03.elementaryAutomatonRow(prevRow);
    buffer.set(
      [...nextRow, ...buffer.slice(0, (x03.bitwidth * x03.bitwidth) / 8)],
      0
    );
  }
  x03.updateImage(buffer, x03.bitwidth);
  x03.timer++;
};

x03.elementaryAutomatonRow = (prevRow) => {
  const rule = x03.ecaRule % 256 >>> 0;
  const buffer = new Uint8Array(x03.bitwidth / 8).fill(0x00);
  let left = x03.bitwidth - 1;
  for (let i = 0; i < x03.bitwidth; i++) {
    const byte = Math.floor(i / 8);
    const bit = 7 - (i % 8);
    const right = (i + 1) % x03.bitwidth;
    const antecedent =
      ((prevRow[Math.floor(left / 8)] & (1 << (7 - (left % 8))) ? 1 : 0) << 2) |
      ((prevRow[byte] & (1 << (7 - (i % 8))) ? 1 : 0) << 1) |
      ((prevRow[Math.floor(right / 8)] & (1 << (7 - (right % 8))) ? 1 : 0) <<
        0);
    buffer[byte] |= (rule & (1 << antecedent) ? 1 : 0) << bit;
    left = i;
  }
  return buffer;
};

x03.elementaryAutomaton = () => {
  const rule = x03.ecaRule;
  const buffer = [];
  let prevRow = new Uint8Array(x03.bitwidth / 8).fill(0x00);
  prevRow[Math.floor(x03.bitwidth / 2) / 8] = 0x80;
  buffer.push(...prevRow);
  for (let i = 0; i < x03.bitwidth; i++) {
    const nextRow = x03.elementaryAutomatonRow(prevRow);
    buffer.unshift(...nextRow);
    prevRow = nextRow;
  }
  return new Uint8Array(buffer);
};

x03.elements.image.onclick = (e) => {
  e.preventDefault();
  const size = Math.min(
    x03.elements.image.offsetWidth,
    x03.elements.image.offsetHeight
  );
  const pad =
    Math.abs(x03.elements.image.offsetWidth - x03.elements.image.offsetHeight) /
    (2 * size);
  const u =
    e.offsetX / size -
    (x03.elements.image.offsetWidth > x03.elements.image.offsetHeight
      ? pad
      : 0);
  const v =
    e.offsetY / size -
    (x03.elements.image.offsetWidth > x03.elements.image.offsetHeight
      ? 0
      : pad);
  x03.changePixelUV(u, v, pixelFlip);
  x03.timer = Math.floor(v * x03.bitwidth);
};

x03.noScroll = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

x03.toolbar = [
  {
    id: "x03-rule",
    alt: "Wolfram Code",
    label:
      "Rule <input type='number' onmousedown='event.preventDefault(); event.target.focus(); if (event.offsetY < event.target.clientHeight/2) { x03.changeRule(1); } else { x03.changeRule(-1); };' onchange='x03.changeRule(this.value - x03.ecaRule);' value='" +
      x03.ecaRule +
      "' />",
  },
  {
    label: "\uf212",
    classList: ["icon"],
    alt: "Insert Random Pixels",
    onClick: () => {
      const randomRow = new Uint8Array(x03.bitwidth / 8).fill(0x00).map(() => {
        return Math.floor(Math.random() * 256) & 0xff;
      });
      const buffer = x03.visual.buffer;
      buffer.set(
        randomRow,
        (x03.bitwidth *
          (x03.timer < x03.bitwidth ? x03.bitwidth - x03.timer : 0)) /
          8
      );
      x03.updateImage(buffer, x03.bitwidth);
    },
  },
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Reset Image",
    onClick: () => {
      x03.changeRule(0);
    },
  },
  x03.playController(
    () => true,
    () => {
      x03.animation = false;
    },
    () => {
      x03.step();
    }
  ),
];

x03.updateImage(x03.elementaryAutomaton(), x03.bitwidth);
