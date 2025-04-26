/** @format */

const x09 = new WobblyBit("x09", {
  title: "Flow Fields!",
  teaser: "Lines swirling towards an attractor like a whirlpool or a cowlick.",
  feature: `
      <p><a href="https://en.wikipedia.org/wiki/Vector_field" target="_blank">Vector fields</a> are commonplace ways of representing directional information in discretized space (i.e. grids) in physical modeling. But I wasn't all that familiar with their continuous brethren or their use in generative art until I came across the work of <a href="https://www.tylerxhobbs.com/words/flow-fields" target="_blank">Tyler Hobbs</a> and then soon realizing that was just the tip of the iceberg.</p>
      <p>This experiment is a simple implementation using different chaotic attractors to create vector fields that are randomize-able but are smooth and have convergence points. The lines are created by starting at a random point and tracing the path of the field's directional information for a preset length.</p>
      <p>It took a few tries to find an interesting way to animate these lines. Tracing the line's path just looked like an impoverished version of using actual particles (implemented in <a href="${getBaseUrl()}/?${new Date().getTime()}#x0a">Wobbly Bit 0x0a</a>). The most visually pleasing results were created by combining the path trace with a slow rotation of each line's starting point around the origin point.</p>
      <p>Most of the attractors are defined using four parameters. If you interact with the image, these parameters get changed, but only based on the x and y coordinates of the interaction. You can't create four independent parameter values out of two, so the the full parameter space is not represented.</p>
      <ul>
      <li><strong class="list-head">Possible Future Improvements</strong>
      <ol>
      <li><strike><a href="${getBaseUrl()}/?${new Date().getTime()}#x0b">Particle-based animation</a></strike></li>
      <li>Add new attractor types (<strike>Peter De Jong</strike>, <strike>Tinkerbell</strike>, <strike>Gumowski-Mira</strike>)</li>
      </ol>
      </li>
      </ul>`,
  citations: [
    {
      title: "Flow Fields, Part I",
      url: "https://medium.com/@bit101/flow-fields-part-i-3ebebc688fd8",
      source: "Medium",
    },
    {
      title: "2D Chaotic Attractors",
      url: "https://sequelaencollection.home.blog/2d-chaotic-attractors/",
      source: "The Sequelaen Collection",
    },
  ],
});

x09.elements.image.onmousedown =
  x09.elements.image.ontouchstart =
  x09.elements.image.ontouchmove =
  x09.elements.image.click =
    (e) => {
      e.preventDefault();
    };

x09.elements.image.onpointermove = (e) => {
  x09.attractor.b = -((e.offsetX / e.target.offsetWidth) * 6 - 3);
  x09.attractor.c = -((Math.atan2(e.offsetY, e.offsetX) / Math.PI) * 2);
  x09.attractor.d = -((e.offsetY / e.target.offsetHeight) * 5 - 2.5);
  if (!x09.animation) {
    x09.drawFlowField();
  }
};

x09.attractor = {
  a: Math.random() * 4 - 2,
  b: Math.random() * 4 - 2,
  c: Math.random() * 4 - 2,
  d: Math.random() * 4 - 2,
};
x09.attractorGumowskiMira = (x, y, scale) => {
  var f = (o) =>
    x09.attractor.a * o +
    2 * (1 - x09.attractor.a) * o * o * Math.pow(1 + o * o, -2);
  var x1 = x09.attractor.b * y + f(x);
  var y1 = f(x1) - x;
  return Math.atan2(y1 - y, x1 - x);
};
x09.attractorTinkerbell = (x, y, scale) => {
  var x1 = x * (x + x09.attractor.a) - y * (y - x09.attractor.b);
  var y1 = 2 * x * y + x09.attractor.c * x + x09.attractor.d * y;
  return Math.atan2(y1 - y, x1 - x);
};
x09.attractorDeJong = (x, y, scale) => {
  var x1 = Math.sin(x09.attractor.a * y) - Math.cos(x09.attractor.b * x);
  var y1 = Math.sin(x09.attractor.b * x) - Math.cos(x09.attractor.d * y);
  return Math.atan2(y1 - y, x1 - x);
};
x09.attractorClifford = (x, y, scale) => {
  var x1 =
    Math.sin(x09.attractor.a * y) +
    x09.attractor.c * Math.cos(x09.attractor.a * x);
  var y1 =
    Math.sin(x09.attractor.b * x) +
    x09.attractor.d * Math.cos(x09.attractor.b * y);
  return Math.atan2(y1 - y, x1 - x);
};
x09.attractorScale = 0.025;
x09.attractorFns = [
  x09.attractorClifford,
  x09.attractorDeJong,
  x09.attractorTinkerbell,
  x09.attractorGumowskiMira,
];
x09.attractorFnIndex = 0;

x09.bitwidth = 256;
x09.getFlowValue = (x, y) => {
  x = (x - x09.bitwidth / 2) * x09.attractorScale;
  y = (y - x09.bitwidth / 2) * x09.attractorScale;
  return x09.attractorFns[x09.attractorFnIndex](x, y, x09.attractorScale);
};

x09.drawThread = (buffer, x, y, length, color = 1) => {
  const angle = x09.getFlowValue(x, y);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  // const steps = Math.max(Math.abs(dx), Math.abs(dy));
  // const xIncrement = dx / steps;
  // const yIncrement = dy / steps;
  if (length > 0) {
    const _x = (Math.round(x + dx) + x09.bitwidth) % x09.bitwidth;
    const _y = (Math.round(y + dy) + x09.bitwidth) % x09.bitwidth;
    const byte = Math.floor((_x + _y * x09.bitwidth) / 8);
    const bit = 7 - (_x % 8);
    buffer[byte] = (buffer[byte] & ~(1 << bit)) | (color << bit);
    x09.drawThread(buffer, x + dx, y + dy, length - 1);
  }
};

x09.timer = 0;

x09.stepSegment = (buffer, x, y, length, color = 1) => {
  const angle = x09.getFlowValue(x, y);
  const dx = length * Math.cos(angle);
  const dy = length * Math.sin(angle);
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const xIncrement = dx / steps;
  const yIncrement = dy / steps;
  for (let i = 0; i < steps; i++) {
    const _x = Math.round(x + i * xIncrement);
    const _y = Math.round(y + i * yIncrement);
    if (_x < 0 || _x >= x09.bitwidth || _y < 0 || _y >= x09.bitwidth) {
      continue;
    }
    const byte = Math.floor((_x + _y * x09.bitwidth) / 8);
    const bit = 7 - (_x % 8);
    buffer[byte] = (buffer[byte] & ~(1 << bit)) | (color << bit);
  }
  return { x: x + dx, y: y + dy };
};

x09.threadLength = 16;
x09.segmentLength = 2;
x09.numThreads = 3000;

x09.threads = new Array(x09.numThreads).fill(0).map(() => ({
  x: Math.random() * x09.bitwidth,
  y: Math.random() * x09.bitwidth,
  r: Math.random() * x09.bitwidth,
  theta: Math.random() * 2 * Math.PI,
  length: x09.threadLength,
  age: Math.random() * 2 * x09.threadLength,
}));

x09.drawFlowField = () => {
  const buffer = new Uint8Array((x09.bitwidth * x09.bitwidth) / 8).fill(0x00);
  for (let i = 0; i < x09.threads.length; i++) {
    const thread = x09.threads[i];
    let length = x09.threadLength - Math.abs(x09.threadLength - thread.age);
    let coords = {
      x: thread.r * Math.cos(thread.theta + x09.timer / 100) + x09.bitwidth / 2,
      y: thread.r * Math.sin(thread.theta + x09.timer / 100) + x09.bitwidth / 2,

      // x: thread.r * Math.cos(thread.theta) + x09.bitwidth / 2,
      // y: thread.r * Math.sin(thread.theta) + x09.bitwidth / 2,
    };
    while (length > 0) {
      coords = x09.stepSegment(
        buffer,
        coords.x,
        coords.y,
        x09.segmentLength,
        (((length + x09.threadLength) % x09.threadLength) +
          (x09.timer % ((i % 4) + 4))) %
          ((i % 4) + 4) ==
          0
          ? 0
          : 1
      );
      length -= 1;
    }
    thread.age -= 1;
    if (thread.age < 0) {
      thread.age = Math.random() * 2 * x09.threadLength;
      thread.theta = Math.random() * 2 * Math.PI;
      thread.r = Math.random() * x09.bitwidth;
    }
  }
  x09.updateImage(buffer, x09.bitwidth);
};

x09.drawFlowField();

x09.toolbar = [
  {
    label: "+",
    alt: "Zoom In",
    onClick: () => {
      x09.attractorScale /= 1.25;
      if (!x09.animation) {
        x09.drawFlowField();
      }
    },
  },
  {
    label: "-",
    alt: "Zoom Out",
    onClick: () => {
      x09.attractorScale *= 1.25;
      if (!x09.animation) {
        x09.drawFlowField();
      }
    },
  },
  x09.optionController("Attractor", x09.attractorFns, (value, index) => {
    x09.attractorFnIndex = index;
    return ["Clifford", "Peter De Jong", "Tinkerbell", "Gumowski-Mira"][index];
  }),
  x09.optionController(
    "Line Settings",
    [
      { numThreads: 3000, threadLength: 16, label: "Medium" },
      { numThreads: 300, threadLength: 96, label: "Long" },
      { numThreads: 6000, threadLength: 4, label: "Short" },
    ],
    (value, index) => {
      x09.numThreads = value.numThreads;
      x09.threadLength = value.threadLength;
      if (x09.numThreads < x09.threads.length) {
        x09.threads.splice(x09.numThreads, x09.threads.length - x09.numThreads);
      } else {
        x09.threads.push(
          ...new Array(x09.numThreads - x09.threads.length).fill(0).map(() => ({
            x: Math.random() * x09.bitwidth,
            y: Math.random() * x09.bitwidth,
            r: Math.random() * x09.bitwidth,
            theta: Math.random() * 2 * Math.PI,
            length: x09.threadLength,
            age: Math.random() * 2 * x09.threadLength,
          }))
        );
      }
      return value.label;
    }
  ),
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Random Attractor",
    id: "x09-reset",
    onClick: () => {
      x09.attractorScale = 0.025;
      x09.attractor = {
        a: Math.random() * 4 - 2,
        b: Math.random() * 4 - 2,
        c: Math.random() * 4 - 2,
        d: Math.random() * 4 - 2,
      };
      x09.drawFlowField();
    },
  },
  x09.playController(
    () => true,
    () => {},
    () => {
      x09.timer += 0.4;
      x09.drawFlowField();
    }
  ),
];
