/** @format */

const x0b = new WobblyBit("x0b", {
  title: "Particles!",
  teaser: "Flow Fields, Part Two: Get swept up in the flow.",
  feature: `
      <p>This is a minor variation on the first <a href="${getBaseUrl()}/?${new Date().getTime()}#x09">Flow Fields</a> example. Instead of visualizing the field itself, this version shows particles moving through the field with their velocity effected by the directional information of the field.</p>
      <p>Like with the original example, the only information from the flow field that is used to effect the particle movement is the angle and not the magnitude. It is interesting to see how the different attractors are not terribly distinctive in the current implementation, and I am curious to see if adding the magnitude to the particle acceleration would help to create more diverse patterns.</p>
      <p>Even though this experiment is just a minor update on a previous entry, it was pretty enough to warrant it's own place on the homepage, and there's the potential for different improvements than in the original example.</p>
      <ul>
      <li><strong class="list-head">Possible Future Improvements</strong>
      <ol>
      <li>Add new attractor types (<strike>Peter De Jong</strike>, <strike>Tinkerbell</strike>, <strike>Gumowski-Mira</strike>)</li>
      <li>Create version with 3D attractor types</li>
      <li>Add more sophisticated movement to particles (vector field magnitude, particle mass, etc...).</li>
      <li>Use non-passive particles (e.g., <a href="https://en.wikipedia.org/wiki/Boids">Boids</a>, etc...).</li>
      </ol>
      </li>
      </ul>
    `,
});

x0b.Attractor = () => ({
  a: 4 * (Math.random() - 0.5),
  b: 4 * (Math.random() - 0.5),
  c: 4 * (Math.random() - 0.5),
  d: 4 * (Math.random() - 0.5),
});

x0b.attractor = {
  a: Math.random() * 4 - 2,
  b: Math.random() * 4 - 2,
  c: Math.random() * 4 - 2,
  d: Math.random() * 4 - 2,
};
x0b.attractorGumowskiMira = (x, y, scale) => {
  var f = (o) =>
    x0b.attractor.a * o +
    2 * (1 - x0b.attractor.a) * o * o * Math.pow(1 + o * o, -2);
  var x1 = x0b.attractor.b * y + f(x);
  var y1 = f(x1) - x;
  return Math.atan2(y1 - y, x1 - x);
};
x0b.attractorTinkerbell = (x, y, scale) => {
  var x1 = x * (x + x0b.attractor.a) - y * (y - x0b.attractor.b);
  var y1 = 2 * x * y + x0b.attractor.c * x + x0b.attractor.d * y;
  return Math.atan2(y1 - y, x1 - x);
};
x0b.attractorDeJong = (x, y, scale) => {
  var x1 = Math.sin(x0b.attractor.a * y) - Math.cos(x0b.attractor.b * x);
  var y1 = Math.sin(x0b.attractor.b * x) - Math.cos(x0b.attractor.d * y);
  return Math.atan2(y1 - y, x1 - x);
};
x0b.attractorClifford = (x, y, scale) => {
  var x1 =
    Math.sin(x0b.attractor.a * y) +
    x0b.attractor.c * Math.cos(x0b.attractor.a * x);
  var y1 =
    Math.sin(x0b.attractor.b * x) +
    x0b.attractor.d * Math.cos(x0b.attractor.b * y);
  return Math.atan2(y1 - y, x1 - x);
};
x0b.attractorScale = 0.025;
x0b.attractorFns = [
  x0b.attractorClifford,
  x0b.attractorDeJong,
  x0b.attractorTinkerbell,
  x0b.attractorGumowskiMira,
];
x0b.attractorFnIndex = 0;

x0b.bitwidth = 256;
x0b.getFlowValue = (x, y) => {
  x = (x - x0b.bitwidth / 2) * x0b.attractorScale;
  y = (y - x0b.bitwidth / 2) * x0b.attractorScale;
  return x0b.attractorFns[x0b.attractorFnIndex](x, y, x0b.attractorScale);
};

x0b.timer = 0;

x0b.stepSegment = (buffer, x, y, length, color = 1) => {
  const angle = x0b.getFlowValue(x, y);
  const dx = length * Math.cos(angle);
  const dy = length * Math.sin(angle);
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const xIncrement = dx / steps;
  const yIncrement = dy / steps;
  for (let i = 0; i < steps; i++) {
    const _x = (Math.round(x + i * xIncrement) + x0b.bitwidth) % x0b.bitwidth;
    const _y = (Math.round(y + i * yIncrement) + x0b.bitwidth) % x0b.bitwidth;
    const byte = Math.floor((_x + _y * x0b.bitwidth) / 8);
    const bit = 7 - (_x % 8);
    buffer[byte] = (buffer[byte] & ~(1 << bit)) | (color << bit);
  }
  return { x: x + dx, y: y + dy };
};
x0b.numParticles = 5000;
x0b.timeStep = 0.45;
x0b.maxSpeed = 6;

x0b.Particle = () => ({
  x: Math.random() * x0b.bitwidth,
  y: Math.random() * x0b.bitwidth,
  vx: 0,
  vy: 0,
  age: Math.random() * x0b.bitwidth,
});
x0b.particles = [];
for (var i = 0; i < x0b.numParticles; i++) {
  x0b.particles.push(x0b.Particle());
}

x0b.drawParticles = () => {
  const buffer = new Uint8Array((x0b.bitwidth * x0b.bitwidth) / 8).fill(0x00);
  for (var i = 0; i < x0b.particles.length; i++) {
    const particle = x0b.particles[i];
    const flowAngle = x0b.getFlowValue(particle.x, particle.y);
    particle.vx += Math.cos(flowAngle) * x0b.timeStep;
    particle.vy += Math.sin(flowAngle) * x0b.timeStep;
    particle.speed = Math.hypot(particle.vx, particle.vy);
    particle.vx *= (x0b.maxSpeed / particle.speed) * 0.95;
    particle.vy *= (x0b.maxSpeed / particle.speed) * 0.95;
    particle.x += particle.vx * x0b.timeStep;
    particle.y += particle.vy * x0b.timeStep;
    particle.x = (Math.round(particle.x) + x0b.bitwidth) % x0b.bitwidth;
    particle.y = (Math.round(particle.y) + x0b.bitwidth) % x0b.bitwidth;
    const byte = Math.floor((particle.x + particle.y * x0b.bitwidth) / 8);
    const bit = 7 - (particle.x % 8);
    buffer[byte] |= 1 << bit;
    particle.age -= x0b.timeStep;
    if (particle.age < 0) {
      x0b.particles[i] = x0b.Particle();
    }
  }
  x0b.updateImage(buffer, x0b.bitwidth);
};

x0b.drawParticles();

x0b.toolbar = [
  x0b.optionController("Attractor", x0b.attractorFns, (value, index) => {
    x0b.attractorFnIndex = index;
    return ["Clifford", "Peter De Jong", "Tinkerbell", "Gumowski-Mira"][index];
  }),
  x0b.optionController(
    "Number of Particles",
    [5000, 10000, 20000, 1000],
    (value, index) => {
      x0b.numParticles = value;
      if (x0b.numParticles < x0b.particles.length) {
        x0b.particles = x0b.particles.slice(0, x0b.numParticles);
      } else {
        for (var i = x0b.particles.length; i < x0b.numParticles; i++) {
          x0b.particles.push(x0b.Particle());
        }
      }
      return value / 1000 + "k";
    }
  ),
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Random Attractor",
    onClick: () => {
      x0b.attractor = x0b.Attractor();
    },
  },
  x0b.playController(
    () => true,
    () => {},
    () => {
      x0b.timer += x0b.timeStep;
      x0b.drawParticles();
    },
    20
  ),
];
