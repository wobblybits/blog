/** @format */

const x0a = new WobblyBit("x0a", {
  title: "Cloth!",
  teaser:
    "A little mass-spring physics on a breezy day. But even if the linens are drying on the line, it's important to keep the springs dampened.",
  feature: `
     <p>Another classic model simple enough to be a quick afternoon's fun.</p>
     <p>Each line in the grid is a spring, and at each intersection of the springs is a mass. There are also two other types of springs that are not visualized &mdash; on the diagonals and longer spanning springs that run along the grid.</p>
     <p>The wind is a total fake and there are no real physics of air resistance or drag.</p>
     <p>Use your mouse or finger to grab a point and drag it around to see how the rest of the cloth responds.</p>
    `,
  citations: [
    {
      title:
        "Provot, Xavier. <em>Deformation Constraints in a Mass-Spring Model to Describe Rigid Cloth Behavior</em>",
      url: "https://graphics.stanford.edu/courses/cs468-02-winter/Papers/Rigidcloth.pdf",
      source: "Stanford",
    },
  ],
});

x0a.bitwidth = 128;
x0a.animation = false;

x0a.toolbar = [
  x0a.optionController(undefined, [true, false], (value, index) => {
    x0a.isBlowing = value;
    return value ? "Windy" : "Still";
  }),
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Reset",
    onClick: () => {
      x0a.resetCloth();
      x0a.updateImage(x0a.drawCloth(), x0a.bitwidth);
    },
  },
  x0a.playController(
    () => true,
    () => {},
    () => {
      x0a.settleCloth();
      x0a.updateImage(x0a.drawCloth(), x0a.bitwidth);
    }
  ),
];

x0a.resetCloth = () => {
  x0a.particles.forEach((row) => {
    row.forEach((particle) => {
      particle.force.x = 0;
      particle.force.y = -1;
      particle.force.z = 0;
      particle.vx = 0;
      particle.vy = 0;
      particle.vz = 0;
      particle.x = particle.ox;
      particle.y = particle.oy;
      particle.z = particle.oz;
    });
  });
};

x0a.numParticles = {
  x: 15,
  y: 12,
};
x0a.spacing = x0a.bitwidth / (x0a.numParticles.x * 1.5);
x0a.spacingDiag = x0a.spacing * Math.sqrt(2);
x0a.maxSpacing = x0a.spacing * 1.15;
x0a.structuralSpringK = 0.35;
x0a.shearSpringK = 0.55;
x0a.flexionSpringK = 0.45;
x0a.damping = 0.15;
x0a.baseDamping = x0a.damping;
// x0a.viscosity = 0.1;
x0a.dt = 0.5;
x0a.gravity = 0.04;
x0a.mass = 800 / (x0a.numParticles.x * x0a.numParticles.y);
x0a.wind = 0;
x0a.isBlowing = true;

x0a.Particle = (row, col) => ({
  row: row,
  col: col,
  x: col * x0a.spacing + x0a.padding.x,
  y: row * x0a.spacing + x0a.padding.y,
  z: Math.random() * 0.1,
  ox: col * x0a.spacing + x0a.padding.x,
  oy: row * x0a.spacing + x0a.padding.y,
  oz: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  mass: x0a.mass,
  force: {
    x: 0,
    y: -x0a.gravity * x0a.mass,
    z: 0,
  },
});

x0a.padding = {
  x: Math.floor((x0a.bitwidth - (x0a.numParticles.x - 1) * x0a.spacing) / 2),
  y: Math.floor(x0a.bitwidth - (x0a.numParticles.y - 1) * x0a.spacing) - 8,
};

x0a.particles = new Array(x0a.numParticles.y).fill(null).map((_, y) => {
  return new Array(x0a.numParticles.x).fill(null).map((_, x) => {
    return x0a.Particle(y, x);
  });
});

x0a.particles[x0a.numParticles.y - 1][0].mass = Infinity;
x0a.particles[x0a.numParticles.y - 1][0].force.y = 0;
x0a.particles[x0a.numParticles.y - 1][0].x = x0a.padding.x - x0a.spacing * 0;
x0a.particles[x0a.numParticles.y - 1][x0a.numParticles.x - 1].mass = Infinity;
x0a.particles[x0a.numParticles.y - 1][x0a.numParticles.x - 1].force.y = 0;
x0a.particles[x0a.numParticles.y - 1][x0a.numParticles.x - 1].x =
  x0a.padding.x + x0a.spacing * (x0a.numParticles.x - 1);

x0a.getNearestParticleIndex = (x, y) => {
  let minDistance = Infinity;
  let nearestParticle = null;
  for (let row = 0; row < x0a.particles.length; row++) {
    for (let col = 0; col < x0a.particles[row].length; col++) {
      const particle = x0a.particles[row][col];
      const distance = Math.hypot(x - particle.x, y - particle.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestParticle = {
          row: row,
          col: col,
        };
      }
    }
  }
  return nearestParticle;
};

x0a.drawLine = (output, x1, y1, z1, x2, y2, z2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
  const xIncrement = dx / steps;
  const yIncrement = dy / steps;
  const zIncrement = dz / steps;
  if (Math.abs(dx) > x0a.bitwidth || Math.abs(dy) > x0a.bitwidth) return;
  for (let i = 0; i < steps; i += 2) {
    const z = z1 + i * zIncrement;
    const x = Math.round((x1 + i * xIncrement) * Math.pow(1.005, z));
    const y = Math.round((y1 + i * yIncrement) * Math.pow(1.005, z));
    if (x < 0 || x >= x0a.bitwidth || y < 0 || y >= x0a.bitwidth) continue;
    const byte = Math.floor((x + y * x0a.bitwidth) / 8);
    const bit = x % 8;
    output[byte] |= 1 << (7 - bit);
  }
};

x0a.calcSpringForce = (particle, neighbor, springK, restLength) => {
  const dx = neighbor.x - particle.x;
  const dy = neighbor.y - particle.y;
  const dz = neighbor.z - particle.z;
  const distance = Math.hypot(dx, dy, dz);
  const XYangle = Math.atan2(-dy, dx);
  const Zangle = Math.atan2(dz, Math.hypot(dx, dy));
  const forceMag = (springK * (restLength - distance)) / restLength;
  return {
    x: -forceMag * Math.cos(XYangle),
    y: forceMag * Math.sin(XYangle),
    z: -forceMag * Math.sin(Zangle),
  };
};

x0a.calcParticleForceTotal = (particle) => {
  let forceTotal = {
    x: x0a.isBlowing
      ? x0a.wind.x * Math.cos((particle.y * Math.PI) / x0a.bitwidth)
      : 0,
    y:
      -x0a.gravity * x0a.mass +
      (x0a.isBlowing
        ? x0a.wind.y * Math.sin((particle.y * Math.PI) / x0a.bitwidth)
        : 0),
    z: x0a.isBlowing
      ? x0a.wind.z *
        Math.sin(
          (2 *
            Math.PI *
            (1 -
              Math.hypot(
                1 - (2 * particle.row) / x0a.numParticles.y,
                1 - (2 * particle.col) / x0a.numParticles.x
              )) -
            x0a.wind.y) /
            x0a.numParticles.y
        )
      : 0,
  };
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      if (i === 0 && j === 0) continue;
      if ((Math.abs(i) == 2 && j != 0) || (Math.abs(j) == 2 && i != 0))
        continue;
      if (particle.row + i < 0 || particle.row + i >= x0a.particles.length)
        continue;
      if (particle.col + j < 0 || particle.col + j >= x0a.particles[0].length)
        continue;
      const neighbor = x0a.particles[particle.row + i][particle.col + j];
      const isDiag = Math.abs(i) + Math.abs(j) == 2;
      const isFlexion = Math.abs(i) == 2 || Math.abs(j) == 2;
      const force = x0a.calcSpringForce(
        particle,
        neighbor,
        isFlexion
          ? x0a.flexionSpringK
          : isDiag
          ? x0a.shearSpringK
          : x0a.structuralSpringK,
        isFlexion ? x0a.spacing * 2 : isDiag ? x0a.spacingDiag : x0a.spacing
      );
      forceTotal.x += force.x;
      forceTotal.y += force.y;
      forceTotal.z += force.z;
    }
  }
  return forceTotal;
};

x0a.updateForces = () => {
  for (let row = 0; row < x0a.particles.length; row++) {
    for (let col = 0; col < x0a.particles[row].length; col++) {
      const particle = x0a.particles[row][col];
      x0a.particles[row][col].force = x0a.calcParticleForceTotal(particle);
    }
  }
};

x0a.stepParticle = (particle, dt, coefficient) => {
  const force = {
    x: particle.force.x - coefficient * dt * x0a.damping * particle.vx,
    y: particle.force.y - coefficient * dt * x0a.damping * particle.vy,
    z: particle.force.z - coefficient * dt * x0a.damping * particle.vz,
  };
  const vx = particle.vx + (coefficient * dt * force.x) / particle.mass;
  const vy = particle.vy + (coefficient * dt * force.y) / particle.mass;
  const vz = particle.vz + (coefficient * dt * force.z) / particle.mass;
  return {
    ...particle,
    force,
    vx,
    vy,
    vz,
    x: particle.x + vx * dt,
    y: particle.y + vy * dt,
    z: particle.z + vz * dt,
  };
};

x0a.timer = 0;

x0a.numIterations = 5;

x0a.settleCloth = () => {
  x0a.timer += x0a.dt * x0a.numIterations;
  x0a.wind = {
    x: Math.sin(x0a.timer / 200) * Math.sin(x0a.timer / 271) * 0.15, //-0.05 + (x0a.timer % 1000) / 10000,
    y: Math.sin(x0a.timer / 369) * 0.02, //-0.01 + (x0a.timer % 400) / 40000,
    z: Math.pow(Math.sin(x0a.timer / 240), 4) * 0.55 * Math.cos(x0a.timer / 47),
  };
  for (let i = 0; i < x0a.numIterations; i++) {
    for (let row = x0a.particles.length - 1; row >= 0; row--) {
      // for (let row = 0; row < x0a.particles.length; row++) {
      //for (let col = x0a.particles[row].length - 1; col >= 0; col--) {
      for (let col = 0; col < x0a.particles[row].length; col++) {
        x0a.particles[row][col].force = x0a.calcParticleForceTotal(
          x0a.particles[row][col]
        );
        x0a.particles[row][col] = x0a.stepParticle(
          x0a.particles[row][col],
          x0a.dt,
          0.5
        );
        if (row < x0a.particles.length - 1) {
          const neighborAbove = x0a.particles[row + 1][col];
          const distance = Math.hypot(
            x0a.particles[row][col].x - neighborAbove.x,
            x0a.particles[row][col].y - neighborAbove.y,
            x0a.particles[row][col].z - neighborAbove.z
          );
          if (distance > x0a.maxSpacing) {
            const adjust = 1 - x0a.maxSpacing / distance;
            const portion =
              1 -
                x0a.particles[row][col].mass /
                  (x0a.particles[row][col].mass + neighborAbove.mass) || 0;
            x0a.particles[row][col].x -=
              portion * adjust * (x0a.particles[row][col].x - neighborAbove.x);
            x0a.particles[row][col].y -=
              portion * adjust * (x0a.particles[row][col].y - neighborAbove.y);
            x0a.particles[row][col].z -=
              portion * adjust * (x0a.particles[row][col].z - neighborAbove.z);
            neighborAbove.x +=
              (1 - portion) *
              adjust *
              (x0a.particles[row][col].x - neighborAbove.x);
            neighborAbove.y +=
              (1 - portion) *
              adjust *
              (x0a.particles[row][col].y - neighborAbove.y);
            neighborAbove.z +=
              (1 - portion) *
              adjust *
              (x0a.particles[row][col].z - neighborAbove.z);
          }
        }
        if (col > 0) {
          const neighborLeft = x0a.particles[row][col - 1];
          const distance = Math.hypot(
            x0a.particles[row][col].x - neighborLeft.x,
            x0a.particles[row][col].y - neighborLeft.y,
            x0a.particles[row][col].z - neighborLeft.z
          );
          if (distance > x0a.maxSpacing) {
            const adjust = 1 - x0a.maxSpacing / distance;
            const portion =
              1 -
                x0a.particles[row][col].mass /
                  (x0a.particles[row][col].mass + neighborLeft.mass) || 0;
            x0a.particles[row][col].x -=
              portion * adjust * (x0a.particles[row][col].x - neighborLeft.x);
            x0a.particles[row][col].y -=
              portion * adjust * (x0a.particles[row][col].y - neighborLeft.y);
            x0a.particles[row][col].z -=
              portion * adjust * (x0a.particles[row][col].z - neighborLeft.z);
            neighborLeft.x +=
              (1 - portion) *
              adjust *
              (x0a.particles[row][col].x - neighborLeft.x);
            neighborLeft.y +=
              (1 - portion) *
              adjust *
              (x0a.particles[row][col].y - neighborLeft.y);
            neighborLeft.z +=
              (1 - portion) *
              adjust *
              (x0a.particles[row][col].z - neighborLeft.z);
          }
        }
      }
    }
  }
};

x0a.drawCloth = () => {
  const output = new Uint8Array((x0a.bitwidth * x0a.bitwidth) / 8).fill(0x00);
  for (let row = 0; row < x0a.particles.length; row++) {
    for (let col = 0; col < x0a.particles[row].length; col++) {
      const particle = x0a.particles[row][col];
      const hasNeighborAbove = row > 0;
      const hasNeighborBelow = row < x0a.particles.length - 1;
      const hasNeighborRight = col < x0a.particles[row].length - 1;
      if (hasNeighborAbove) {
        const neighborAbove = x0a.particles[row - 1][col];
        x0a.drawLine(
          output,
          particle.x,
          particle.y,
          particle.z,
          neighborAbove.x,
          neighborAbove.y,
          neighborAbove.z
        );
      }
      if (hasNeighborRight) {
        const neighborRight = x0a.particles[row][col + 1];
        x0a.drawLine(
          output,
          particle.x,
          particle.y,
          particle.z,
          neighborRight.x,
          neighborRight.y,
          neighborRight.z
        );
      }
    }
  }
  return output;
};

x0a.updateImage(x0a.drawCloth(), x0a.bitwidth);

x0a.scale = x0a.elements.image.width / x0a.bitwidth;
x0a.scaleY = x0a.elements.image.height / x0a.bitwidth;

x0a.grabbedParticle = null;

x0a.elements.image.onpointerdown = (e) => {
  e.preventDefault();
  x0a.grabbedParticle = x0a.getNearestParticleIndex(
    e.offsetX / x0a.scale,
    x0a.bitwidth - e.offsetY / x0a.scale
  );
  if (!x0a.animation) {
    x0a.animation = window.setInterval(() => {
      x0a.settleCloth();
      x0a.updateImage(x0a.drawCloth(), x0a.bitwidth);
    }, 20);
  }
};

x0a.elements.image.onpointermove = (e) => {
  e.preventDefault();
  if (!x0a.grabbedParticle && e.pointerType != "mouse") {
    x0a.grabbedParticle = x0a.getNearestParticleIndex(
      e.offsetX / x0a.scale,
      x0a.bitwidth - e.offsetY / x0a.scale
    );
  }
  if (x0a.grabbedParticle) {
    x0a.particles[x0a.grabbedParticle.row][x0a.grabbedParticle.col] = {
      ...x0a.particles[x0a.grabbedParticle.row][x0a.grabbedParticle.col],
      x: e.offsetX / x0a.scale,
      y: x0a.bitwidth - e.offsetY / x0a.scale,
      z: 5,
      vx: 0,
      vy: 0,
      vz: 0,
      force: {
        x: 0,
        y: 0,
        z: 0,
      },
      mass: Infinity,
    };
    x0a.updateImage(x0a.drawCloth(), x0a.bitwidth);
  }
};

x0a.elements.image.onpointerleave =
  x0a.elements.image.onpointerout =
  x0a.elements.image.onpointerup =
  x0a.elements.image.onpointercancel =
    (e) => {
      if (x0a.grabbedParticle) {
        if (
          !(
            x0a.grabbedParticle.row == x0a.numParticles.y - 1 &&
            (x0a.grabbedParticle.col == x0a.numParticles.x - 1 ||
              x0a.grabbedParticle.col == 0)
          )
        ) {
          x0a.particles[x0a.grabbedParticle.row][x0a.grabbedParticle.col].mass =
            x0a.mass;
        }
        x0a.damping = x0a.baseDamping;
        x0a.grabbedParticle = null;
      }
    };

window.addEventListener("pointerup", x0a.elements.image.onpointerup);
window.addEventListener("pointercancel", x0a.elements.image.onpointerup);

x0a.elements.image.onmousedown =
  x0a.elements.image.ontouchstart =
  x0a.elements.image.ontouchmove =
  x0a.elements.image.click =
    (e) => {
      e.preventDefault();
    };
