/** @format */

const x04 = new WobblyBit("x04", {
  title: "Life!",
  teaser:
    "Thanks for tuning into W0BB, where we play all the hits from 1970! Here's <a href='https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life' target='_blank'>Game of Life</a> by <a href='https://en.wikipedia.org/wiki/John_Horton_Conway' target='_blank'>John Horton Conway</a>.",
  feature: `
  <p>There's a lot of excellent writing out there about Conway's Game of Life and plenty of awe-inspiring implementations (e.g. <a href="https://oimo.io/works/life/" target="_blank">this</a>), and I don't have much new to add. But it would have been silly not to include the preeminent generative 1-bit masterpiece.</p>
  <ul>
    <li><strong class='list-head'>The Implementation</strong>
    <p>Nothing innovative or impressive, but it might be worth saying that the current implementation follows the kernel and growth-function approach used in <a href="https://en.wikipedia.org/wiki/Lenia" target="_blank">Lenia</a>. I am curious to see (in a future experiment) how a continuous version of 2d cellular automata like Lenia might be re-discretized back into a 1-bit state space, or at least visualized as such. The kernel approach also provides some commonality to a (future) implementation of <a href="https://en.wikipedia.org/wiki/Turing_Pattern" target="_blank">Turing Patterns</a> following the work of <a href="https://www.researchgate.net/publication/309877032_An_updated_kernel-based_Turing_model_for_studying_the_mechanisms_of_biological_pattern_formation" target="_blank">Shigeru Kondo</a>.</p>
    </li>
  </ul>
    `,
  citations: [
    {
      title: "Game of Life",
      url: "https://conwaylife.com/wiki/Conway%27s_Game_of_Life",
      source: "LifeWiki",
    },
  ],
});

x04.bitwidth = 128;
x04.blurKernel5 = new Uint8Array([
  64, 32, 16, 32, 64, 32, 16, 8, 16, 32, 16, 8, 4, 8, 16, 32, 16, 8, 16, 32, 64,
  32, 16, 32, 64,
]);
x04.blurKernel3 = new Uint8Array([16, 8, 16, 8, 4, 8, 16, 8, 16]);
x04.sumKernel3 = new Uint8Array([1, 1, 1, 1, 0, 1, 1, 1, 1]);

x04.golGrowth = (alive, sum) => {
  return sum == 3 || (alive && sum == 2) ? 1 : 0;
};

x04.applyKernel = (kernel, growth) => {
  const kernelWidth = Math.floor(Math.sqrt(kernel.length));
  const kernelRadius = (kernelWidth - 1) / 2;
  const buffer = x04.visual.buffer
    .slice(0, (x04.bitwidth * x04.bitwidth) / 8)
    .map((prevByte, i) => {
      const x = (i % (x04.bitwidth / 8)) * 8;
      const y = x04.bitwidth - 1 - Math.floor(i / (x04.bitwidth / 8));
      let byte = 0x00;
      for (let b = 0; b < 8; b++) {
        let alive = 0;
        let sum = 0;
        for (let dx = -kernelRadius; dx <= kernelRadius; dx++) {
          for (let dy = -kernelRadius; dy <= kernelRadius; dy++) {
            const pixel = x04.visual.getPixel(
              (x + dx + b + x04.bitwidth) % x04.bitwidth,
              (y + dy + x04.bitwidth) % x04.bitwidth
            )
              ? 1
              : 0;
            if (dx == 0 && dy == 0) {
              alive = pixel;
            }
            sum +=
              kernel[dx + kernelRadius + (dy + kernelRadius) * kernelWidth] != 0
                ? pixel /
                  kernel[dx + kernelRadius + (dy + kernelRadius) * kernelWidth]
                : 0;
          }
        }
        byte |= growth(alive, sum) << (7 - b);
      }
      return byte;
    });
  return buffer;
};

x04.updateImage(
  new Uint8Array((x04.bitwidth * x04.bitwidth) / 8)
    .fill(0x00)
    .map(
      (_, i) =>
        Math.floor(Math.random() * 0xff) & Math.floor(Math.random() * 0xff)
    ),
  x04.bitwidth
);

x04.toolbar = [
  {
    label: "\uf212",
    classList: ["icon"],
    alt: "Fill Grid with Random Pixels",
    onClick: () => {
      x04.updateImage(
        new Uint8Array((x04.bitwidth * x04.bitwidth) / 8).map(
          (_, i) =>
            Math.floor(Math.random() * 0xff) & Math.floor(Math.random() * 0xff)
        ),
        x04.bitwidth
      );
    },
  },
  x04.playController(
    () => true,
    () => {},
    () => {
      x04.updateImage(
        x04.applyKernel(x04.sumKernel3, x04.golGrowth),
        x04.bitwidth
      );
    }
  ),
];
