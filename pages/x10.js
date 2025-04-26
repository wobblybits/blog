/** @format */
const x10 = new WobblyBit("x10", {
  title: "Worms!",
  teaser:
    "Move over red wrigglers, we've got colorless wrigglers now. Adapted from an awesome research-based model of <a href='https://en.wikipedia.org/wiki/Caenorhabditis_elegans' target='_blank'><em>C. elegans</em></a>.",
  feature: `
    <p>Now this one really tickles me. After creating specialized microworm-tracking camera setups and image processing to recognize, orient, and scale the worm images, scientists were able to create an amazingly effective worm posture model that I can't wait to have more fun with.</p>
    <p>The worm's body is represented as a series of 100 points that you can imagine running like a backbone lengthwise down the center of the worm. Each of these points represents the angle of the bend to the next point. So a worm's posture could be stored in this raw format as a 100-dimensional vector. But then after some <a href='https://en.wikipedia.org/wiki/Principal_component_analysis' target='_blank'>PCA analysis</a>, it turns out that the first 4 vectors account for over 90% of the variance in the data.</p>
    <p>So we've got 4 (or 5 or 6 depending on the researcher) 100-dimensional "eigenworms" that we can combine in different ratios to create basically all the possible worm postures, and each posture can be easily defined and stored as a set of just those 4 (or 5 or 6) coefficients.</p>
    <p>So for now, I've got the eigenworms and an example set of movement data over time, but there's sure to be more worms coming out of the ground soon. You can see the eigenworm coefficients change in real time by watching the slider position, or you can take control and test-drive the worm yourself.</p>
    <ul>
    <li><strong class='list-head'>Possible Future Improvements:</strong>
    <ol>
    <li>Interactivity?</li>
    <li>Relating worm posture to forward momentum and change of orientation</li>
    <li>Probabilistic model of worm movement</li>
    <li>More worms?</li>
    </ol>
    </li>
    </ul>
     `,
  citations: [
    {
      title: "Eigenworms",
      source: "Univ. of Florida",
      url: "https://cmp.phys.ufl.edu/PHZ4710/files/unit7/eigenworms.html",
    },
    {
      title: "Antonio Costa",
      source: "Github",
      url: "https://github.com/AntonioCCosta/markov_worm?tab=readme-ov-file",
    },
  ],
});

x10.eigenworms = [
  [
    -0.169, -0.176, -0.181, -0.185, -0.186, -0.187, -0.185, -0.183, -0.179,
    -0.173, -0.167, -0.159, -0.151, -0.141, -0.131, -0.12, -0.108, -0.096,
    -0.083, -0.07, -0.056, -0.043, -0.029, -0.015, 0, 0.014, 0.027, 0.041,
    0.054, 0.067, 0.079, 0.09, 0.101, 0.11, 0.119, 0.127, 0.133, 0.138, 0.142,
    0.144, 0.145, 0.144, 0.141, 0.137, 0.133, 0.127, 0.12, 0.113, 0.105, 0.097,
    0.089, 0.081, 0.072, 0.063, 0.053, 0.043, 0.031, 0.018, 0.005, -0.007,
    -0.019, -0.029, -0.038, -0.045, -0.051, -0.055, -0.058, -0.06, -0.06, -0.06,
    -0.059, -0.057, -0.055, -0.052, -0.048, -0.044, -0.04, -0.035, -0.029,
    -0.024, -0.018, -0.011, -0.005, 0.002, 0.009, 0.017, 0.024, 0.031, 0.039,
    0.046, 0.053, 0.061, 0.068, 0.075, 0.082, 0.089, 0.095, 0.101, 0.107, 0.11,
  ],
  [
    0.08, 0.075, 0.069, 0.062, 0.053, 0.044, 0.033, 0.022, 0.009, -0.003,
    -0.016, -0.028, -0.041, -0.053, -0.064, -0.074, -0.083, -0.091, -0.098,
    -0.104, -0.108, -0.111, -0.113, -0.113, -0.113, -0.111, -0.107, -0.103,
    -0.097, -0.09, -0.081, -0.072, -0.062, -0.051, -0.039, -0.026, -0.013, 0,
    0.014, 0.028, 0.042, 0.056, 0.07, 0.084, 0.098, 0.11, 0.123, 0.134, 0.145,
    0.155, 0.163, 0.17, 0.177, 0.182, 0.185, 0.187, 0.188, 0.188, 0.186, 0.182,
    0.177, 0.17, 0.162, 0.152, 0.14, 0.128, 0.115, 0.101, 0.087, 0.072, 0.058,
    0.044, 0.029, 0.015, 0.002, -0.011, -0.024, -0.036, -0.048, -0.058, -0.068,
    -0.077, -0.085, -0.091, -0.097, -0.102, -0.105, -0.107, -0.108, -0.109,
    -0.109, -0.108, -0.107, -0.106, -0.104, -0.102, -0.099, -0.095, -0.091,
    -0.085,
  ],
  [
    0.06, 0.061, 0.062, 0.064, 0.066, 0.068, 0.07, 0.073, 0.075, 0.078, 0.081,
    0.085, 0.088, 0.091, 0.094, 0.097, 0.1, 0.103, 0.106, 0.109, 0.111, 0.114,
    0.116, 0.117, 0.119, 0.12, 0.121, 0.121, 0.122, 0.122, 0.121, 0.121, 0.12,
    0.118, 0.117, 0.115, 0.113, 0.11, 0.107, 0.104, 0.1, 0.095, 0.091, 0.086,
    0.08, 0.074, 0.067, 0.061, 0.053, 0.046, 0.038, 0.03, 0.022, 0.014, 0.006,
    -0.002, -0.011, -0.019, -0.027, -0.036, -0.044, -0.052, -0.06, -0.068,
    -0.076, -0.083, -0.09, -0.097, -0.103, -0.108, -0.113, -0.118, -0.123,
    -0.127, -0.13, -0.134, -0.137, -0.139, -0.141, -0.142, -0.143, -0.143,
    -0.142, -0.141, -0.14, -0.137, -0.135, -0.131, -0.127, -0.123, -0.119,
    -0.115, -0.111, -0.108, -0.106, -0.104, -0.103, -0.101, -0.1, -0.098,
    -0.095,
  ],
  [
    -0.134, -0.127, -0.119, -0.109, -0.098, -0.087, -0.074, -0.061, -0.048,
    -0.034, -0.02, -0.007, 0.006, 0.018, 0.029, 0.04, 0.049, 0.057, 0.063,
    0.068, 0.072, 0.075, 0.077, 0.078, 0.078, 0.076, 0.074, 0.071, 0.067, 0.062,
    0.057, 0.052, 0.046, 0.04, 0.034, 0.029, 0.023, 0.018, 0.012, 0.007, 0.002,
    -0.002, -0.007, -0.01, -0.013, -0.016, -0.017, -0.017, -0.016, -0.014,
    -0.011, -0.008, -0.004, 0, 0.005, 0.01, 0.015, 0.021, 0.027, 0.033, 0.04,
    0.047, 0.054, 0.061, 0.068, 0.074, 0.08, 0.084, 0.087, 0.089, 0.09, 0.09,
    0.089, 0.086, 0.083, 0.08, 0.076, 0.071, 0.065, 0.059, 0.051, 0.043, 0.035,
    0.026, 0.016, 0.007, -0.002, -0.011, -0.021, -0.03, -0.039, -0.048, -0.058,
    -0.069, -0.081, -0.093, -0.107, -0.122, -0.137, -0.153, -0.165,
  ],
];

x10.motion = [];
Promise.resolve(fetch(getBaseUrl() + "/data/x10.json"))
  .then((response) => response.json())
  .then((data) => {
    x10.motion = data;
    x10.coefficients = [
      Math.round(x10.motion[0][x10.timer] * 200) / 200,
      Math.round(x10.motion[1][x10.timer] * 200) / 200,
      Math.round(x10.motion[2][x10.timer] * 200) / 200,
      Math.round(x10.motion[3][x10.timer] * 200) / 200,
    ];
    x10.drawWorm(x10.coefficients, x10.split);
    if (x10.callback) x10.callback();
  });

x10.bitwidth = 128;
x10.segmentLength = 1;
x10.taper = (index) => {
  if (index > 85) return 2 + (102 - index) / 5;
  else if (index > 70) return 5.5;
  else if (index < 40) return 5 + (index - 40) / 8;
  else return 5;
};

x10.drawLine = (buffer, x, y, dx, dy) => {
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i < steps; i++) {
    x += dx / steps;
    y += dy / steps;
    const byte = Math.floor((Math.floor(x) + Math.floor(y) * x10.bitwidth) / 8);
    const bit = Math.floor(x) % 8;
    buffer[byte] |=
      ((Math.round(Math.abs(y + dx)) % 3 ^ Math.round(x + dy) % 3) == 0
        ? 0
        : 1) <<
      (7 - bit);
  }
};

x10.offset = { x: 0, y: 0 };
x10.mouseOffset = { x: 0, y: 0 };
x10.mouseX = 0;
x10.mouseY = 0;
x10.mouseOrigin = null;

x10.drawWorm = (coefficients, split = 30) => {
  x10.backbone = new Array(100);
  let centerOfMass = { x: 0, y: 0 };
  const buffer = new Uint8Array((x10.bitwidth * x10.bitwidth) / 8).fill(0x00);
  let x = x10.offset.x + x10.mouseOffset.x + x10.bitwidth / 2;
  let y = x10.offset.y + x10.mouseOffset.y + x10.bitwidth / 2;
  for (let i = split - 1; i >= 0; i--) {
    let theta = Math.PI;
    for (let j = 0; j < coefficients.length; j++) {
      theta += coefficients[j] * x10.eigenworms[j][i];
    }
    centerOfMass.x += x;
    centerOfMass.y += y;
    const dx = Math.sin(theta);
    const dy = Math.cos(theta);
    const sx = Math.sin(theta + Math.PI / 2);
    const sy = Math.cos(theta + Math.PI / 2);
    const segment = x10.taper(i);
    x10.backbone[i] = { x, y };
    x10.drawLine(buffer, x, y, dx * x10.segmentLength, dy * x10.segmentLength);
    x10.drawLine(
      buffer,
      x + sx * segment,
      y + sy * segment,
      sx * -2 * segment,
      sy * -2 * segment
    );
    buffer[Math.floor((Math.floor(x) + Math.floor(y) * x10.bitwidth) / 8)] &= ~(
      (x + y) % 2 <<
      (7 - (Math.round(x) % 8))
    );
    x += dx;
    y += dy;
  }
  x = x10.offset.x + x10.mouseOffset.x + x10.bitwidth / 2;
  y = x10.offset.y + x10.mouseOffset.y + x10.bitwidth / 2;
  for (let i = split; i < 100; i++) {
    let theta = 0;
    for (let j = 0; j < coefficients.length; j++) {
      theta += coefficients[j] * x10.eigenworms[j][i];
    }
    centerOfMass.x += x;
    centerOfMass.y += y;
    const dx = Math.sin(theta);
    const dy = Math.cos(theta);
    const sx = Math.sin(theta + Math.PI / 2);
    const sy = Math.cos(theta + Math.PI / 2);
    const segment = x10.taper(i);
    x10.backbone[i] = { x, y };
    x10.drawLine(buffer, x, y, dx * x10.segmentLength, dy * x10.segmentLength);
    x10.drawLine(
      buffer,
      x - sx * segment,
      y - sy * segment,
      sx * 2 * segment,
      sy * 2 * segment
    );
    x += dx;
    y += dy;
  }
  centerOfMass.x /= 100;
  centerOfMass.y /= 100;
  if (x10.mouseOrigin == null) {
    x10.offset.x += 1 * (x10.bitwidth / 2 - centerOfMass.x);
    x10.offset.y += 1 * (x10.bitwidth / 2 - centerOfMass.y);
  }

  x10.updateImage(buffer, x10.bitwidth);
};

x10.coefficients = [0, 0, 0, 0];
x10.deltas = {
  phase: 0,
  dphase: 0.1,
  turn: 0,
  dturn: 0,
  head: 0,
  dhead: 0,
};
x10.timer = 8000; //Math.floor(Math.random() * x10.motion[0].length);
x10.split = 30;
x10.speed = 1;

// x10.elements.image.onpointermove = (e) => {
//   e.preventDefault();
//   const x = e.offsetY / x10.elements.image.offsetHeight;
//   const y = e.offsetX / x10.elements.image.offsetWidth;
//   const magnitude = Math.hypot(0.5 - x, 0.5 - y);
//   const theta = Math.atan2(0.5 - y, 0.5 - x);

//   if (x10.mouseOrigin != null) {
//     x10.mouseX = 0;
//     x10.mouseY = 0;
//     x10.mouseOffset = {
//       x: x10.mouseOrigin.x - x * x10.bitwidth,
//       y: x10.mouseOrigin.y - (1 - y) * x10.bitwidth,
//     };
//     x10.mouseOrigin = {
//       x: x * x10.bitwidth,
//       y: (1 - y) * x10.bitwidth,
//     };
//   } else {
//     // x10.mouseX = 1 - magnitude;
//     // x10.mouseY = theta;
//   }
// };

// x10.elements.image.onpointerdown = (e) => {
//   e.preventDefault();
//   const x = (e.offsetY / x10.elements.image.offsetHeight) * x10.bitwidth;
//   const y = (1 - e.offsetX / x10.elements.image.offsetWidth) * x10.bitwidth;
//   x10.split = x10.getNearestSegment(x, y);
//   x10.mouseOrigin = { x: x, y: y };
// };

// x10.elements.image.onpointerup = (e) => {
//   x10.mouseX = 0;
//   x10.mouseY = 0;
//   x10.split = 30;
//   x10.mouseOrigin = null;
// };

x10.elements.image.onpointerup;

x10.update = () => {
  x10.deltas.dturn = 0.01 * Math.sin(x10.timer / 5);
  x10.deltas.phase += x10.deltas.dphase;
  x10.deltas.turn += x10.deltas.dturn;
  x10.deltas.head += x10.deltas.dhead;
  x10.coefficients = [
    8 * Math.sin(x10.timer),
    8 * Math.sin(x10.timer + x10.deltas.phase),
    x10.deltas.turn,
    x10.deltas.head,
  ];
};

x10.getNearestSegment = (x, y) => {
  let nearest = 0;
  let bestDistance = 1000;
  for (let i = 0; i < x10.backbone.length; i++) {
    const dx = x10.backbone[i].x - x;
    const dy = x10.backbone[i].y - y;
    const distance = Math.hypot(dx, dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = i;
    }
  }
  return nearest;
};

x10.updateEigenworm = (value, index = x10.selectedEigenworm) => {
  x10.controlCoefficients[index] = value;
  const slider = x10.article.querySelector("#x10-eigenworm input");
  slider.value = value;
  if (!x10.animate) {
    x10.coefficients[index] = value;
    x10.drawWorm(x10.coefficients, x10.split);
  }
};

x10.selectedEigenworm = 0;
x10.controlCoefficients = [1, 1, 1, 1];

x10.updateImage(
  new Uint8Array((x10.bitwidth * x10.bitwidth) / 8).fill(0x00),
  x10.bitwidth
);

x10.toolbar = [
  x10.optionController(
    "Eigenworms",
    [0, 1, 2, 3],
    (value, index) => {
      x10.selectedEigenworm = index;
      const slider = x10.article.querySelector("#x10-eigenworm input");
      if (slider) slider.value = x10.controlCoefficients[index];
      return "Eigenworm " + (index + 1);
    },
    false
  ),
  {
    label:
      "<input type='range' min='-10' max='10' step='0.25' value='" +
      x10.controlCoefficients[x10.selectedEigenworm] +
      "' onpointerdown='x10.userControl = true' onchange='x10.userControl = false' oninput='x10.updateEigenworm(this.value)'/>",
    id: "x10-eigenworm",
    alt: "Eigenworm Multiplier",
  },
  x10.optionController("Speed", [1, 2, 4], (value, index) => {
    x10.speed = value;
    return value + "x";
  }),
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Jump to Random Frame",
    onClick: () => {
      x10.timer = Math.floor(Math.random() * x10.motion[0].length);
      if (!x10.animate) {
        x10.coefficients = [
          Math.round(x10.motion[0][x10.timer] * 200) / 200,
          Math.round(x10.motion[1][x10.timer] * 200) / 200,
          Math.round(x10.motion[2][x10.timer] * 200) / 200,
          Math.round(x10.motion[3][x10.timer] * 200) / 200,
        ];
        x10.updateEigenworm(
          Math.round(x10.motion[x10.selectedEigenworm][x10.timer] * 200) / 200,
          x10.selectedEigenworm
        );
        x10.drawWorm(x10.coefficients, x10.split);
      }
    },
  },
  x10.playController(
    () => {
      if (x10.motion.length > 0) return true;
      x10.callback = x10.start;
      return false;
    },
    () => {},
    () => {
      //x10.update();
      x10.coefficients = [
        Math.round(x10.motion[0][x10.timer] * 200) / 200,
        Math.round(x10.motion[1][x10.timer] * 200) / 200,
        Math.round(x10.motion[2][x10.timer] * 200) / 200,
        Math.round(x10.motion[3][x10.timer] * 200) / 200,
      ];
      if (!x10.userControl) {
        x10.updateEigenworm(
          Math.round(x10.motion[x10.selectedEigenworm][x10.timer] * 200) / 200,
          x10.selectedEigenworm
        );
      } else {
        x10.coefficients[x10.selectedEigenworm] = x10.toolbar.querySelector(
          "#x10-eigenworm input"
        ).value;
      }
      x10.drawWorm(x10.coefficients, x10.split);
      x10.timer = (x10.timer + x10.speed) % x10.motion[0].length;
    }
  ),
];

x10.offset = {
  x: 0,
  y: -20,
};
x10.drawWorm(x10.coefficients, x10.split);
