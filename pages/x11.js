/** @format */

const x11 = new WobblyBit("x11", {
  title: "Reaction-Diffusion!",
  teaser:
    "These blobbies are at the root of a whole lot of phenomena. It's time you got to know them.",
  feature: `
    <p style='color: salmon'>Warning: Some of the patterns can flicker rapidly, especially if the speed setting is increased. I would not recommend using higher speed settings if you have any photosensitivity.</p>
    <p>The equations that define reaction-diffusion systems essentially govern the process of two chemicals intermixing. In this way, they also serve as models for generating <a href='https://en.wikipedia.org/wiki/Turing_pattern'>Turing patterns</a>, which Alan Turing proposed as explanations for how patterns in life-forms are created, like stripes on zebra skin, hair-follicle distribution, the way coral grows, and even the way that our brains are wired. And in this way, they also have relationship to the purely computational systems of discrete cellular automata. Pretty wild!</p>
    <ul>
    <li><strong class='list-head'>The Implementation</strong>
    <p>There are lots of different ways to try to optimize these kind of grid-based, time-stepping simulations. Additionally there are different compromises made between realism, efficiency, and reliable results in terms of how to discretize the differential equations involved. The code can quickly get more opaque as the variety of optimizations and improvements increases. For this initial experiment with the Gray-Scott model, I wanted to begin my learning with a straightforward implementation of the basic algorithm. I followed a student example from the University of Frankfurt that I found online as my starting point and adapted from there.</p>
    </li>
    <li><strong class='list-head'>Interaction Design</strong>
    <p>Moving your mouse or finger around on the image will invert it's color. A lot of the patterns are surprisingly resistant to changing, but you can still get them to nudge around with some extra work. With others it can look like moving your hand through rippling water.</p>
    <p>Figuring out what types of interactivity would work well with the Gray-Scott model was a bit of a challenge. There are many parameters that dictate the outcomes, and the vast majority of parameter configurations do not produce interesting patterns. I initially created controls for the two main parameters ("feed" and "kill"), but it would really need to have both coarse- and fine-tuning for each parameter and even then, it would be difficult to find patterns different from the current stability point.</p>
    <p>While the basic feed and kill controls in place, I began working on an automatic tuning mechanism that would try to find a stabilized pattern close to user-selected parameters. If the image goes completely dark, it tweaks the kill down and the feed up. If the image goes completely white, it tweaks the kill up and the feed down. It wasn't perfect, but it definitely helped. I then created the randomize button to set new parameters based on a very general heuristic of what be close to something might work and then allow the auto-tuner to seek it out.</p>
    <p>While still not perfect, this ended up being the better interface for the system. It also allowed for a third parameter (one of the diffusion coefficients) to be added to the mix.
 After tweaking the heuristics through trial and error, I'm happy enough with the results and hope you get to see some of the interesting and distinct results this model can produce.</p>
 <p>Then came the Exposure control, which allows the user to determine what the cutoff is for black versus white pixel coloring (the underlying grid has a continuous value between 0 and 1 representing the mixture of the two "chemicals"). While this might seem like a purely visual control, because the auto-tuner is also responding at the visual level (all-white or all-black screens), tweaking this threshold will change the auto-tuner's target behavior.</p>
 <p>If you think of the Exposure control as a low-pass filter, allowing only values below a certain cutoff, then the Band-Pass control is a... band-pass filter. It adds a second cutoff at the square of the Exposure value and only values between those two cutoffs will be shown as white. This enables you to see patterns that might be happening within all white regions, for example. Originally, I added it to see if it would create an outlined version of shapes, which it does for some of the patterns, while others revealed hidden internal complexity. Once again, even though this is a purely visual control, it can change the behavior of the auto-tuner and help to locate and stabillize parameter configurations that aren't stable in the non-Filter mode.</p>
    </li>
    <li><strong class='list-head'>Possible Future Improvements</strong>
    <ol>
    <li>Interface for navigating through the parameter space</li>
    <li>Dithered rendering option</li>
    <li>Visualize time as a third spatial dimension to create coral-like 3D models</li>
    <li>GPU acceleration</li>
    </ol>
    </li>
    </ul>
  `,
  citations: [
    {
      title: "Gray-Scott Model",
      url: "https://itp.uni-frankfurt.de/~gros/StudentProjects/Projects_2020/projekt_schulz_kaefer/",
      source: "Katharina K&auml;fer and Mirjam Schulz",
    },
    {
      title: "Pearson's Parameterization",
      url: "https://www.mrob.com/pub/comp/xmorphia/index.html",
      source: "Robert Munafo",
    },
    {
      title: "Reaction-Diffusion System",
      url: "https://en.wikipedia.org/wiki/Reaction%E2%80%93diffusion_system",
      source: "Wikipedia",
    },
  ],
});

x11.bitwidth = 160;
x11.count = 0;

x11.grid0;
x11.grid1;
x11.dU = 1;
x11.dV = 0.694;
x11.feed = 0.0158; //0.053;
x11.k = 0.0483; //0.062;
x11.dx = 4;
x11.dt = 4;
x11.numIterations = 1;
x11.gridSize = x11.bitwidth;
x11.cellSize = x11.bitwidth / x11.gridSize;
x11.exposure = 0.33;
x11.exposureBlock = -1;

x11.randomParemeters = () => {
  x11.feed = Math.random() * 0.02 + 0.001;
  x11.k = Math.sqrt(x11.feed) * (Math.random() * 0.05 + 0.5);
  x11.dV = Math.random() * 0.25 + 0.5;
};

x11.initGrids = () => {
  x11.grid0 = new Array(x11.gridSize)
    .fill(0)
    .map((_, i) =>
      new Array(x11.gridSize)
        .fill(0)
        .map((_, j) =>
          Math.hypot(i - x11.gridSize / 2, j - x11.gridSize / 2) < 8
            ? { u: 0.5, v: 0.25 }
            : { u: 1, v: 0 }
        )
    );
  x11.grid1 = new Array(x11.gridSize)
    .fill(0)
    .map((_, i) =>
      new Array(x11.gridSize)
        .fill(0)
        .map((_, j) =>
          Math.hypot(i - x11.gridSize / 2, j - x11.gridSize / 2) < 8
            ? { u: 0.5, v: 0.25 }
            : { u: 1, v: 0 }
        )
    );
};

x11.drawGrid = () => {
  x11.visual.buffer.fill(0);
  for (let i = 0; i < x11.gridSize; i++) {
    for (let j = 0; j < x11.gridSize; j++) {
      const val = x11.grid1[i][j].u - x11.grid1[i][j].v;
      const color = val < x11.exposure && val >= x11.exposureBlock ? 1 : 0;
      if (color == 0) continue;
      for (let k = 0; k < x11.cellSize; k++) {
        for (let l = 0; l < x11.cellSize; l++) {
          const pX = Math.round(i * x11.cellSize + k);
          const pY = Math.round(j * x11.cellSize + l);
          const byte = Math.floor((pX + pY * x11.bitwidth) / 8);
          const bit = 7 - (pX % 8);
          x11.visual.buffer[byte] =
            (x11.visual.buffer[byte] & ~(1 << bit)) | (color << bit);
        }
      }
    }
  }
  x11.updateImage(x11.visual.buffer, x11.bitwidth);
};

x11.lastPointer = null;

x11.elements.image.onpointermove = (e) => {
  e.preventDefault();
  const newPointer = {
    x: Math.round((e.offsetX / x11.elements.image.offsetWidth) * x11.bitwidth),
    y: Math.round(
      (1 - e.offsetY / x11.elements.image.offsetHeight) * x11.bitwidth
    ),
  };
  if (false && x11.lastPointer) {
    const dx = newPointer.x - x11.lastPointer.x;
    const dy = newPointer.y - x11.lastPointer.y;
    var steps = Math.max(Math.abs(dx), Math.abs(dy));
    let row = x11.lastPointer.x;
    let col = x11.lastPointer.y;
    for (let i = 0; i < steps; i++) {
      x11.grid1[Math.round(row)][Math.round(col)] =
        x11.grid1[Math.round(row + dx / steps)][Math.round(col + dy / steps)];

      x11.grid0[Math.round(row)][Math.round(col)] =
        x11.grid0[Math.round(row + dx / steps)][Math.round(col + dy / steps)];
      row += dx / steps;
      col += dy / steps;
    }
  }
  x11.grid1[newPointer.x][newPointer.y] = {
    u: 1 - x11.grid1[newPointer.x][newPointer.y].u,
    v: 1 - x11.grid1[newPointer.x][newPointer.y].v,
  };
  x11.lastPointer = newPointer;
};

// function randomSet() {
//   maxu = 0.0001;
//   minu = 0;
//   ran = Math.floor(Math.random() * (grids - 5));
//   ran2 = Math.floor(Math.random() * (grids - 5));
//   if (grids == 60 || grids == 80) {
//     for (var i = ran; i < ran + 2; i++) {
//       for (var j = ran2; j < ran2 + 2; j++) {
//         grid[i][j].u = rand_start / 2.0 + 0.1 * Math.random();
//         grid[i][j].v = rand_start ** 2.0 / feed + 0.1 * Math.random();
//       }
//     }
//   } else {
//     for (var i = ran; i < ran + 5; i++) {
//       for (var j = ran2; j < ran2 + 5; j++) {
//         grid[i][j].u = rand_start / 2.0 + 0.1 * Math.random();
//         grid[i][j].v = rand_start ** 2.0 / feed + 0.1 * Math.random();
//       }
//     }
//   }
//   draw();
// }

x11.updateGrids = () => {
  let sum = 0;
  for (let x = 0; x < x11.gridSize; x++) {
    for (let y = 0; y < x11.gridSize; y++) {
      const u = x11.grid0[x][y].u;
      const v = x11.grid0[x][y].v;
      const ddu =
        (x11.grid0[(x + 1) % x11.gridSize][y].u +
          x11.grid0[(x - 1 + x11.gridSize) % x11.gridSize][y].u +
          x11.grid0[x][(y + 1) % x11.gridSize].u +
          x11.grid0[x][(y - 1 + x11.gridSize) % x11.gridSize].u -
          4 * x11.grid0[x][y].u) /
        (x11.dx * x11.dx);
      const ddv =
        (x11.grid0[(x + 1) % x11.gridSize][y].v +
          x11.grid0[(x - 1 + x11.gridSize) % x11.gridSize][y].v +
          x11.grid0[x][(y + 1) % x11.gridSize].v +
          x11.grid0[x][(y - 1 + x11.gridSize) % x11.gridSize].v -
          4 * x11.grid0[x][y].v) /
        (x11.dx * x11.dx); //Euler
      x11.grid1[x][y].u =
        u + (x11.dU * ddu - u * v * v + x11.feed * (1 - u)) * x11.dt;
      x11.grid1[x][y].v =
        v + (x11.dV * ddv + u * v * v - (x11.k + x11.feed) * v) * x11.dt; //die Gleichung

      x11.grid1[x][y].u = Math.min(Math.max(x11.grid1[x][y].u, 0), 1);
      x11.grid1[x][y].v = Math.min(Math.max(x11.grid1[x][y].v, 0), 1);
      const val = x11.grid1[x][y].u - x11.grid1[x][y].v;
      sum += val >= x11.exposure || val < x11.exposureBlock ? 0 : 1;
    }
  }
  x11.grid0 = x11.grid1;
  return sum;
};

x11.updateImage(
  new Uint8Array((x11.bitwidth * x11.bitwidth) / 8),
  x11.bitwidth
);

x11.mode = "Exposure";
x11.initGrids();

x11.toolbar = [
  x11.optionController(
    "Contour",
    ["Exposure", "Band-Pass"],
    (value, index) => {
      x11.mode = value;
      if (value == "Band-Pass") {
        x11.exposureBlock = Math.pow(x11.exposure, 2);
      } else {
        x11.exposureBlock = -1;
      }
      return value;
    },
    false
  ),
  {
    label:
      "<input type='range' min='0.05' max='0.95' step='0.05' value='" +
      x11.exposure +
      "' oninput='x11.exposure = parseFloat(this.value); if (x11.mode == \"Band-Pass\") { x11.exposureBlock = Math.pow(parseFloat(this.value),2); } else { x11.exposureBlock = -1; }'/>",
    id: "x11-contour",
    alt: "Contour",
  },
  {
    label: "\uf212",
    classList: ["icon"],
    alt: "Randomize Parameters",
    onClick: () => {
      x11.randomParemeters();
    },
  },
  x11.optionController("Speed", [1, 2, 4], (value, index) => {
    x11.numIterations = value;
    return value + "x";
  }),
  x11.playController(
    () => {
      x11.count = 0;
      return true;
    },
    () => {},
    () => {
      let fail = 0;
      for (let i = 0; i < x11.numIterations && fail == 0; i++) {
        const sum = x11.updateGrids();
        if (sum <= 0) {
          x11.k /= 1.1;
          x11.feed += Math.random() * 0.0005;
          x11.initGrids();
          fail++;
        } else if (sum >= x11.gridSize * x11.gridSize) {
          x11.feed *= 1.1 * x11.k;
          x11.k += Math.random() * 0.0005;
          x11.initGrids();
          i = 0;
          fail++;
        } else fail = 0;
        if (fail > 100) {
          x11.stop();
        }
      }
      x11.drawGrid();
      x11.count++;
    }
  ),
];
