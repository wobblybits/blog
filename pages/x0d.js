/** @format */

const x0d = new WobblyBit("x0d", {
  title: "Boids!",
  teaser:
    "An early classic algorithm for simulating murmuration a la starling flocks and sardine shoals.",
  feature: `
      <p>The Boids algorithm originated in the 1980's and remains well-known as a simple yet effective way to produce complex group motion.</p>
      <p>There are three component steering mechanisms that guide the individual boids: separation, alignment, and cohesion. With cohesion, boids move towards other boids within their visible range. With alignment, boids try to match the velocity (speed and direction) of the other boids within their visible range. And with separation, boids move away from others that have gotten too close.</p>
      <p>Tweaking these three parameters produces noticeably different patterns. Use the slider in the toolbar to adjust one parameter at a time. You can also interact with the image to send the boids scattering to jumpstart new configurations.</p>
    `,
  citations: [
    {
      title: "Boids",
      url: "https://www.red3d.com/cwr/boids/",
      source: "Craig Reynolds",
    },
  ],
});

x0d.bitwidth = 128;
x0d.numBoids = 400;
x0d.boids = [];
x0d.Boid = (id) => {
  return {
    id: id,
    x: Math.random() * x0d.bitwidth,
    y: Math.random() * x0d.bitwidth,
    z: Math.random() * x0d.bitwidth,
    vx: Math.random() * 0.1 - 0.05,
    vy: Math.random() * 0.1 - 0.05,
    vz: Math.random() * 0.1 - 0.05,
  };
};
x0d.crowdedRadius = x0d.bitwidth / 20;
x0d.visibleRadius = x0d.bitwidth / 6;
x0d.separateFactor = 0.1;
x0d.alignFactor = 0.03;
x0d.cohereFactor = 0.00005;
x0d.turnFactor = 0.028;
x0d.timeStep = 2;
x0d.margin = x0d.bitwidth * 0.1;
x0d.maxSpeed = Math.log(x0d.bitwidth) / 4;
x0d.minSpeed = Math.log(x0d.bitwidth) / 8;

x0d.pointerBoid = {
  id: "pointer",
  active: false,
  x: Math.random() * x0d.bitwidth,
  y: Math.random() * x0d.bitwidth,
  z: Math.random() * x0d.bitwidth,
  vx: Math.random() * 0.1 - 0.05,
  vy: Math.random() * 0.1 - 0.05,
  vz: Math.random() * 0.1 - 0.05,
};
x0d.pointerFactor = 10;

x0d.separate = (boid1, boid2, distance) => {
  if (distance < x0d.crowdedRadius) {
    return {
      x: boid1.x - boid2.x,
      y: boid1.y - boid2.y,
      z: boid1.z - boid2.z,
    };
  }
  return false;
};
x0d.align = (boid1, boid2, distance) => {
  if (distance < x0d.visibleRadius) {
    return {
      x: boid2.vx,
      y: boid2.vy,
      z: boid2.vz,
    };
  }
  return false;
};
x0d.cohere = (boid1, boid2, distance) => {
  if (distance < x0d.visibleRadius) {
    return {
      x: boid2.x,
      y: boid2.y,
      z: boid2.z,
    };
  }
  return false;
};

for (let i = 0; i < x0d.numBoids; i++) {
  x0d.boids.push(x0d.Boid());
}

x0d.updateBoids = () => {
  for (let i = 0; i < x0d.numBoids; i++) {
    const boid = x0d.boids[i];
    const totalSeparate = { x: 0, y: 0, z: 0, count: 0 };
    const totalAlign = { x: 0, y: 0, z: 0, count: 0 };
    const totalCohere = { x: 0, y: 0, z: 0, count: 0 };
    const distanceFromCenter = Math.hypot(
      boid.x - x0d.bitwidth / 2,
      boid.y - x0d.bitwidth / 2,
      boid.z - x0d.bitwidth / 2
    );
    if (distanceFromCenter > x0d.bitwidth / 2) {
      const theta = Math.atan2(
        boid.y - x0d.bitwidth / 2,
        boid.x - x0d.bitwidth / 2
      );
      const phi = Math.acos((boid.z - x0d.bitwidth / 2) / distanceFromCenter);
      const turnVector = {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      };
      boid.vx -= turnVector.x * x0d.turnFactor;
      boid.vy -= turnVector.y * x0d.turnFactor;
      boid.vz -= turnVector.z * x0d.turnFactor;
    }

    for (let j = 0; j < x0d.numBoids; j++) {
      const neighbor = x0d.boids[j];
      if (i === j) continue;

      const distance = Math.hypot(
        boid.x - neighbor.x,
        boid.y - neighbor.y,
        boid.z - neighbor.z
      );
      if (distance < x0d.visibleRadius) {
        const separate = x0d.separate(boid, neighbor, distance);
        const align = x0d.align(boid, neighbor, distance);
        const cohere = x0d.cohere(boid, neighbor, distance);
        if (separate) {
          totalSeparate.x += separate.x * x0d.separateFactor;
          totalSeparate.y += separate.y * x0d.separateFactor;
          totalSeparate.z += separate.z * x0d.separateFactor;
          totalSeparate.count++;
        }
        if (align) {
          totalAlign.x += align.x;
          totalAlign.y += align.y;
          totalAlign.z += align.z;
          totalAlign.count++;
        }
        if (cohere) {
          totalCohere.x += cohere.x;
          totalCohere.y += cohere.y;
          totalCohere.z += cohere.z;
          totalCohere.count++;
        }
      }
    }

    if (x0d.pointerBoid.active) {
      const distance = Math.hypot(
        (boid.x - x0d.bitwidth / 2) * Math.pow(2, boid.z / x0d.bitwidth - 1) +
          x0d.bitwidth / 2 -
          x0d.pointerBoid.x,
        (boid.y - x0d.bitwidth / 2) * Math.pow(2, boid.z / x0d.bitwidth - 1) +
          x0d.bitwidth / 2 -
          x0d.pointerBoid.y
      );
      totalSeparate.x -=
        ((x0d.pointerBoid.x - boid.x) / Math.pow(distance, 2)) *
        x0d.pointerFactor;
      totalSeparate.y -=
        ((x0d.pointerBoid.y - boid.y) / Math.pow(distance, 2)) *
        x0d.pointerFactor;
      totalSeparate.count += 1;
    }

    if (totalSeparate.count > 0) {
      boid.vx += totalSeparate.x * x0d.separateFactor;
      boid.vy += totalSeparate.y * x0d.separateFactor;
      boid.vz += totalSeparate.z * x0d.separateFactor;
    }
    if (totalAlign.count > 0) {
      boid.vx += (totalAlign.x / totalAlign.count - boid.vx) * x0d.alignFactor;
      boid.vy += (totalAlign.y / totalAlign.count - boid.vy) * x0d.alignFactor;
      boid.vz += (totalAlign.z / totalAlign.count - boid.vz) * x0d.alignFactor;
    }
    if (totalCohere.count > 0) {
      boid.vx +=
        (totalCohere.x / totalCohere.count - boid.x) * x0d.cohereFactor;
      boid.vy +=
        (totalCohere.y / totalCohere.count - boid.y) * x0d.cohereFactor;
      boid.vz +=
        (totalCohere.z / totalCohere.count - boid.z) * x0d.cohereFactor;
    }
    const v_ = Math.hypot(boid.vx, boid.vy, boid.vz);
    //const v_ = Math.hypot(boid.vx, boid.vy, boid.vz);
    const v_max = Math.min(x0d.maxSpeed, v_);
    const v_min = Math.max(x0d.minSpeed, v_);
    boid.vx *= ((v_max / v_) * v_min) / v_;
    boid.vy *= ((v_max / v_) * v_min) / v_;
    boid.vz *= ((v_max / v_) * v_min) / v_;

    boid.x = boid.x + boid.vx * x0d.timeStep;
    boid.y = boid.y + boid.vy * x0d.timeStep;
    boid.z = boid.z + boid.vz * x0d.timeStep;
    x0d.boids[i] = boid;
  }
};

x0d.drawBoids = () => {
  const image = new Uint8Array((x0d.bitwidth * x0d.bitwidth) / 8).fill(0x00);
  for (let i = 0; i < x0d.numBoids; i++) {
    const boid = x0d.boids[i];
    const x =
      (boid.x - x0d.bitwidth / 2) * Math.pow(2, boid.z / x0d.bitwidth - 1) +
      x0d.bitwidth / 2;
    const y =
      (boid.y - x0d.bitwidth / 2) * Math.pow(2, boid.z / x0d.bitwidth - 1) +
      x0d.bitwidth / 2;
    if (x >= 0 && x < x0d.bitwidth - 1 && y >= 0 && y < x0d.bitwidth - 1) {
      const byte = Math.floor(
        (Math.round(x) + Math.round(y) * x0d.bitwidth) / 8
      );
      const bit = 7 - (Math.round(x) % 8);
      image[byte] |= 1 << bit;
    }
  }
  x0d.updateImage(image, x0d.bitwidth);
};

x0d.drawBoids();

x0d.elements.image.onpointerdown = (e) => {
  e.preventDefault();
  x0d.pointerBoid.x =
    (e.offsetX / x0d.elements.image.offsetWidth) * x0d.bitwidth;
  x0d.pointerBoid.y =
    (1 - e.offsetY / x0d.elements.image.offsetHeight) * x0d.bitwidth;
  x0d.pointerBoid.z = 0;
  x0d.pointerBoid.vx = 0;
  x0d.pointerBoid.vy = 0;
  x0d.pointerBoid.vz = 0;
  x0d.pointerBoid.previousX =
    (e.offsetX / x0d.elements.image.offsetWidth) * x0d.bitwidth;
  x0d.pointerBoid.previousY =
    (1 - e.offsetY / x0d.elements.image.offsetHeight) * x0d.bitwidth;
  x0d.pointerBoid.previousTime = Date.now();
  x0d.pointerBoid.active = true;
};

x0d.elements.image.onpointermove = (e) => {
  e.preventDefault();
  x0d.pointerBoid.previousX = x0d.pointerBoid.x;
  x0d.pointerBoid.previousY = x0d.pointerBoid.y;
  x0d.pointerBoid.x =
    (e.offsetX / x0d.elements.image.offsetWidth) * x0d.bitwidth;
  x0d.pointerBoid.y =
    (1 - e.offsetY / x0d.elements.image.offsetHeight) * x0d.bitwidth;
  x0d.pointerBoid.vx =
    (x0d.pointerBoid.x - x0d.pointerBoid.previousX) /
    (Date.now() - x0d.pointerBoid.previousTime);
  x0d.pointerBoid.vy =
    (x0d.pointerBoid.y - x0d.pointerBoid.previousY) /
    (Date.now() - x0d.pointerBoid.previousTime);
  x0d.pointerBoid.previousTime = Date.now();
};

x0d.elements.image.onpointerup = (e) => {
  e.preventDefault();
  x0d.pointerBoid.active = false;
};

window.addEventListener("pointerup", x0d.elements.image.onpointerup);

x0d.selectableParams = [
  {
    label: "Coherence",
    min: 0.00001,
    growth: 2.0,
    value: (value = undefined) => {
      if (value >= 0 && value <= 10) {
        x0d.cohereFactor =
          Math.pow(x0d.selectableParams[0].growth, value) *
          x0d.selectableParams[0].min;
      }
      const scaledValue =
        Math.log(x0d.cohereFactor / x0d.selectableParams[0].min) /
        Math.log(x0d.selectableParams[0].growth);
      return scaledValue;
    },
  },
  {
    label: "Separation",
    growth: 1.5,
    min: 0.08,
    value: (value = undefined) => {
      if (value >= 0 && value <= 10) {
        x0d.separateFactor =
          Math.pow(x0d.selectableParams[1].growth, value) *
          x0d.selectableParams[1].min;
      }
      const scaledValue =
        Math.log(x0d.separateFactor / x0d.selectableParams[1].min) /
        Math.log(x0d.selectableParams[1].growth);
      return scaledValue;
    },
  },
  {
    label: "Alignment",
    min: 0.01,
    growth: 1.4,
    value: (value = undefined) => {
      if (value >= 0 && value <= 10) {
        x0d.alignFactor =
          Math.pow(x0d.selectableParams[2].growth, value) *
          x0d.selectableParams[2].min;
      }
      const scaledValue =
        Math.log(x0d.alignFactor / x0d.selectableParams[2].min) /
        Math.log(x0d.selectableParams[2].growth);
      return scaledValue;
    },
  },
];
x0d.updateParam = (value) => {
  x0d.selectableParams[x0d.selectedParamIndex].value(value);
};
x0d.selectedParamIndex = 0;

x0d.toolbar = [
  x0d.optionController(
    x0d.selectableParams[x0d.selectedParamIndex].label,
    x0d.selectableParams.map((param) => param.label),
    (value, index) => {
      x0d.selectedParamIndex = index;
      if (!x0d.paramSlider) {
        x0d.paramSlider = document.querySelector("#x0d-parameter input");
      } else {
        x0d.paramSlider.value =
          x0d.selectableParams[x0d.selectedParamIndex].value();
      }
      return value;
    },
    false
  ),
  {
    label:
      "<input type='range' min='0' max='10' step='0.5' value='" +
      x0d.selectableParams[x0d.selectedParamIndex].value() +
      "' oninput='x0d.updateParam(this.value)'/>",
    id: "x0d-parameter",
    alt: "Parameter Value",
  },
  x0d.playController(
    () => {
      return true;
    },
    () => {},
    () => {
      x0d.updateBoids();
      x0d.drawBoids();
    }
  ),
];
