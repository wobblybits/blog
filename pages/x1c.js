/** @format */
const x1c = new WobblyBit("x1c", {
  title: "Hydrogen!",
  teaser:
    "Sometimes you have to bend the rules a little bit. Let's crank the bit-depth up to 3.",
  feature: `
    <p>What you're seeing is three Wobbly Bit bitmap images layered on top of each other using CSS filters. Each individual image is still black and white in its own right, but is acting as a <a href="https://en.wikipedia.org/wiki/Color_space" target="_blank">color channel</a> for the final image.</p>
    <p>While there is no explicit CSS filter for colorizing a black and white image, I was able to achieve this by using the sepia filter to get the foot in the door to the world of color. It took some trial and error to get the right mix of filters to get the full intensity red, green, and blue hues.</p>
    <p>The final step was to use the CSS mix-blend-mode property to the three color channels to simulate additive and subtractive <a href="https://en.wikipedia.org/wiki/Color_mixing" target="_blank">color mixing</a> so that the secondary colors were visible.</p>
  `,
  citations: [
    {
      title: "Karplus-Strong",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Karplus–Strong_string_synthesis",
    },
  ],
});

x1c.bitwidth = 480;
x1c.bohrRadius = 1; //5.29 * 10 ** -11;
x1c.n = 1;
x1c.l = 0;
x1c.m = 0;

x1c.updateN = (value) => {
  const inputN = document.querySelector("#x1c-n input");
  const inputL = document.querySelector("#x1c-l input");
  const inputM = document.querySelector("#x1c-m input");

  if (value) x1c.n = Math.min(Math.max(value, inputN.min), inputN.max);
  inputN.value = x1c.n;
  inputL.max = x1c.n - 1;
  x1c.l = Math.max(Math.min(x1c.l, x1c.n - 1), 0);
  inputL.value = x1c.l;
  inputM.max = x1c.n - 1;
  inputM.min = -x1c.n + 1;
  x1c.m = Math.max(Math.min(x1c.m, x1c.n - 1), -x1c.n + 1);
  inputM.value = x1c.m;
};

x1c.updateL = (value) => {
  const inputL = document.querySelector("#x1c-l input");
  const inputM = document.querySelector("#x1c-m input");
  if (value) x1c.l = Math.min(Math.max(value, inputL.min), inputL.max);
  inputL.value = x1c.l;
  inputM.max = x1c.l;
  inputM.min = -x1c.l;
  x1c.m = Math.max(Math.min(x1c.m, x1c.l), -x1c.l);
  inputM.value = x1c.m;
};

x1c.updateM = (value) => {
  const inputM = document.querySelector("#x1c-m input");
  if (value) x1c.m = Math.min(Math.max(value, inputM.min), inputM.max);
  inputM.value = x1c.m;
};

x1c.laguerrePolynomialExplicit = (alpha, n, x) => {
  var sum = 0.0;
  let factorial_kn = x1c.factorial(n + alpha);
  for (var i = 0; i <= n; i++) {
    sum += Math.pow(-x, i) * x1c.laguerreCoefficient(i, alpha, n); //* factorial_kn) / (x1c.factorial(i) * x1c.factorial(n - i) * x1c.factorial(alpha + i));
  }
  return sum;
};
x1c.laguerreCoefficient = (i, alpha, n) => {
  var product = 1.0;
  for (var j = n; j > 0; j--) {
    if (j > i) {
      product *= j + alpha;
    }
    if (j <= n - i) {
      product /= j;
    }
    if (j <= i) {
      product /= j;
    }
  }
  return product;
};
x1c.laguerrePolynomial = (alpha, n, x) => {
  if (n === 0) return 1;
  if (n === 1) return 1 + alpha - x;
  return (
    ((2 * n - 1 + alpha - x) * x1c.laguerrePolynomial(alpha, n - 1, x) -
      (n + alpha - 1) * x1c.laguerrePolynomial(alpha, n - 2, x)) /
    n
  );
};
x1c.legendrePolynomial = (m, l, x) => {
  if (l === 0 && m === 0) return 1;
  if (l === 1 && m === 0) return x;
  if (l === 1 && m === 1) return -Math.sqrt(1 - x * x);
  if (l === 1 && m === -1) return 0.5 * Math.sqrt(1 - x * x);
  else if (l === m)
    return (
      -(2 * l + 1) *
      Math.sqrt(1 - x * x) *
      x1c.legendrePolynomial(m - 1, l - 1, x)
    );
  else if (l === m + 1)
    return x * (m + l) * x1c.legendrePolynomial(m, l - 1, x);
  else if (m < 0)
    return (
      ((Math.pow(-1, -m) * x1c.factorial(l + m)) / x1c.factorial(l - m)) *
      x1c.legendrePolynomial(-m, l, x)
    );
  else if (Math.abs(m) > l) return 0;
  else if (l < 0) return x1c.legendrePolynomial(m, -l - 1, x);
  else
    return (
      (x * (2 * l - 1) * x1c.legendrePolynomial(m, l - 1, x) -
        (l + m - 1) * x1c.legendrePolynomial(m, l - 2, x)) /
      (l - m)
    );
};
x1c.factorial = (n) => {
  if (n === 0) return 1;
  return n * x1c.factorial(n - 1);
};
x1c.normalizationConstant = 1;
x1c.sphericalHarmonic = (m, l, theta, phi) => {
  return (
    x1c.normalizationConstant *
    Math.cos(m * phi) *
    x1c.legendrePolynomial(m, l, Math.cos(theta))
  );
};
x1c.orbitalWaveFunction = (r, theta, phi, n = x1c.n, l = x1c.l, m = x1c.m) => {
  return Math.sqrt(
    ((Math.pow(2 / (n * x1c.bohrRadius), 3) * x1c.factorial(n - l - 1)) /
      (2 * n * x1c.factorial(n + l))) *
      Math.exp(-r / (n * x1c.bohrRadius)) *
      Math.pow((2 * r) / (n * x1c.bohrRadius), l) *
      x1c.laguerrePolynomial(
        2 * l + 1,
        n - l - 1,
        (2 * r) / (n * x1c.bohrRadius)
      ) *
      x1c.sphericalHarmonic(m, l, theta, phi)
  );
};

x1c.cloudSDF = (p, c, r = 1) => {
  const distanceToCenter = Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z);
  const theta = Math.atan2(p.y - c.y, p.x - c.x);
  const phi = Math.acos((p.z - c.z) / distanceToCenter);
  const waveFunction = x1c.orbitalWaveFunction(distanceToCenter, theta, phi);
  if (waveFunction) {
    return x1c.stepLength * (1 - Math.random() * waveFunction);
  } else {
    return x1c.stepLength;
  }
};

x1c.stepLength = 1;
x1c.minHitDistance = x1c.stepLength * 0.99;
x1c.maxTraceDistance = 200;
x1c.maxSteps = 250;
x1c.thetaRotate = 0;
x1c.phiRotate = 0;

x1c.rayMarch = (ro, rd) => {
  let d = 0.0;
  for (let i = 0; i < x1c.maxSteps; i++) {
    var currentPosition = {
      x: ro.x + rd.x * d,
      y: ro.y + rd.y * d,
      z: ro.z + rd.z * d,
    };
    var sd = x1c.cloudSDF(currentPosition, { x: 0, y: 0, z: 0 });
    if (sd < x1c.minHitDistance) {
      return d + sd;
    } else if (d > x1c.maxTraceDistance) {
      break;
    }
    d += sd;
  }
  return d;
};

x1c.camera = {
  x: 0,
  y: 0,
  z: -100,
};
x1c.timer = 0;

x1c.redraw = () => {
  const output = new Uint8Array((x1c.bitwidth * x1c.bitwidth) / 8).fill(0x00);
  const ro = {
    x: 0,
    y: 0,
    z: -100,
  };
  for (let y = 0; y < x1c.bitwidth; y++) {
    for (let x = 0; x < x1c.bitwidth; x++) {
      const rd = {
        x: x / x1c.bitwidth - 0.5,
        y: y / x1c.bitwidth - 0.5,
        z: 1,
      };
      if (x1c.rayMarch(ro, rd) >= x1c.maxTraceDistance) continue;

      const byte = Math.floor((x1c.bitwidth * y + x) / 8);
      const bit = x % 8;

      output[byte] = (output[byte] & ~(1 << (7 - bit))) | (1 << (7 - bit));
    }
  }
  x1c.updateImage(output, x1c.bitwidth);
};

//x1c.redraw();

x1c.toolbar = [
  {
    id: "x1c-n",
    alt: "Principal Quantum Number",
    label:
      "n=<input type='number' min='1' max='15' onmousedown='event.preventDefault(); event.target.focus(); if (event.offsetY < event.target.clientHeight/2) { x1c.n++; x1c.updateN(x1c.n); } else { x1c.n--; x1c.updateN(x1c.n); };' onchange='x1c.updateN(this.value);' value='" +
      x1c.n +
      "' />",
  },
  {
    id: "x1c-l",
    alt: "Angular Momentum Quantum Number",
    label:
      "l=<input type='number' min='0' max='15' onmousedown='event.preventDefault(); event.target.focus(); if (event.offsetY < event.target.clientHeight/2) { x1c.l++; x1c.updateL(x1c.l); } else { x1c.l--; x1c.updateL(x1c.l); };' onchange='x1c.updateL(this.value);' value='" +
      x1c.l +
      "' />",
  },
  {
    id: "x1c-m",
    alt: "Magnetic Quantum Number",
    label:
      "m=<input type='number' min='-10' max='10' onmousedown='event.preventDefault(); event.target.focus(); if (event.offsetY < event.target.clientHeight/2) { x1c.m++; x1c.updateM(x1c.m); } else { x1c.m--; x1c.updateM(x1c.m); };' onchange='x1c.updateM(this.value);' value='" +
      x1c.m +
      "' />",
  },
  x1c.playController(
    () => true,
    () => {
      try {
        x1c.gpuDestroy();
      } catch (e) {}
    },
    () => {
      x1c.timer += 1;
      x1c.thetaRotate += 0.01;
      x1c.phiRotate += 0.01;
      if (!x1c._gpu) {
        try {
          x1c.gpuRestart();
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          x1c._gpu.render(
            new Float32Array([
              x1c.n,
              x1c.l,
              x1c.m,
              x1c.timer,
              x1c.camera.x,
              x1c.camera.y,
              x1c.camera.z,
              x1c.thetaRotate,
              x1c.phiRotate,
            ]),
            x1c.gpuOutput
          ),
            x1c.updateImage(x1c.gpuOutput, x1c.bitwidth);
        } catch (e) {
          console.log(e);
        }
      }
    }
  ),
];

x1c.elements.image.onwheel = (event) => {
  event.preventDefault();
  x1c.camera.z *= Math.exp(-event.deltaY / 100);
};

x1c.elements.image.onmousemove = (event) => {
  x1c.thetaRotate += (event.offsetX / event.target.offsetWidth - 0.5) / 10;
  x1c.phiRotate += (event.offsetY / event.target.offsetHeight - 0.5) / 10;
};

x1c.gpuDestroy = () => {
  if (x1c._gpu) {
    x1c._gpu.device.destroy();
    x1c._gpu = null;
  }
};

x1c.gpuRestart = () => {
  x1c.gpuOutput = new Uint32Array((x1c.bitwidth * x1c.bitwidth) / 32);

  x1c.computeGPU(
    `
  struct Params {
    n: f32,
    l: f32,
    m: f32,
    t: f32,
    camX: f32,
    camY: f32,
    camZ: f32,
    thetaRotate: f32,
    phiRotate: f32, 
  };

  @group(0) @binding(0) var<storage, read_write> output: array<u32>;
  @group(0) @binding(1) var<uniform> params: Params;

  const M_PI : f32 = radians(180.0);
  const normalizationConstant : f32 = 1.0;
  const stepLength : f32 = 0.5;
  const minHitDistance : f32 = stepLength;
  const maxTraceDistance : f32 = 200.0;
  const maxSteps : f32 = 1000.0;
  const bohrRadius : f32 = .1;

fn laguerrePolynomialPrecomputed(x: f32) -> f32 {
  let n : f32 = params.n - params.l - 1.;
  let alpha : f32 = 2. * params.l + 1.;

  if (n == 0.) {
    return 1.;
  }
  if (n == 1.) {
    return 1. + alpha - x;
  }
  if (n == 2.) {
    return .5 * (x * x - 2. * (alpha + 2.) * x + (alpha + 1.) * (alpha + 2.));
  }
  if (n == 3.) {
    return 1. / 6. * (-pow(x, 3.) + 3. * (alpha + 3.) * pow(x, 2.) - 3. * (alpha + 2.) * (alpha + 3.) * x + (alpha + 1.) * (alpha + 2.) * (alpha + 3.));
  }
  if (n == 4.) {
    return (1./ 24.) * (24. + 50. * alpha + 35. * pow(alpha, 2.) + 10. * pow(alpha, 3.) + pow(alpha, 4.) - 96. * x - 104. * alpha * x - 36. * pow(alpha, 2.) * x - 4. * pow(alpha, 3.) * x + 72. * pow(x, 2.) + 42. * alpha * pow(x, 2.) + 6. * pow(alpha, 2.) * pow(x, 2.) - 16. * pow(x, 3.) - 4. * alpha * pow(x, 3.) + pow(x, 4.));
  }
  if (n == 5.) {
    return (1./ 120.) * (pow(alpha, 5.) - 5. * pow(alpha, 4.) * x + 15. * pow(alpha, 4.) + 10. * pow(alpha, 3.) * pow(x, 2.) - 70. * pow(alpha, 3.) * x + 85. * pow(alpha, 3.) - 10. * pow(alpha, 2.) * pow(x, 3.) + 120. * pow(alpha, 2.) * pow(x, 2.) - 355. * pow(alpha, 2.) * x + 225. * pow(alpha, 2.) + 5. * alpha * pow(x, 4.) - 90. * alpha * pow(x, 3.) + 470. * alpha * pow(x, 2.) - 770. * alpha * x + 274. * alpha - pow(x, 5.) + 25. * pow(x, 4.) - 200. * pow(x, 3.) + 600. * pow(x, 2.) - 600. * x + 120.);
  }
  if (n == 6.) {
    return (1./ 720.) * (pow(alpha, 6.) - 6. * pow(alpha, 5.) * x + 21. * pow(alpha, 5.) + 15. * pow(alpha, 4.) * pow(x, 2.) - 120. * pow(alpha, 4.) * x + 175. * pow(alpha, 4.) - 20. * pow(alpha, 3.) * pow(x, 3.) + 270. * pow(alpha, 3.) * pow(x, 2.) - 930. * pow(alpha, 3.) * x + 735. * pow(alpha, 3.) + 15. * pow(alpha, 2.) * pow(x, 4.) - 300. * pow(alpha, 2.) * pow(x, 3.) + 1785. * pow(alpha, 2.) * pow(x, 2.) - 3480. * pow(alpha, 2.) * x + 1624. * pow(alpha, 2.) - 6. * alpha * pow(x, 5.) + 165. * alpha * pow(x, 4.) - 1480. * alpha * pow(x, 3.) + 5130. * alpha * pow(x, 2.) - 6264. * alpha * x + 1764. * alpha + pow(x, 6.) - 36. * pow(x, 5.) + 450. * pow(x, 4.) - 2400. * pow(x, 3.) + 5400. * pow(x, 2.) - 4320. * x + 720.);
  }
  if (n == 7.) {
    return (pow(alpha, 7.) - 7. * pow(alpha, 6.) * x + 28. * pow(alpha, 6.) + 21. * pow(alpha, 5.) * pow(x, 2.) - 189. * pow(alpha, 5.) * x + 32. * pow(alpha, 5.) - 35. * pow(alpha, 4.) * pow(x, 3.) + 525. * pow(alpha, 4.) * pow(x, 2.) - 2065. * pow(alpha, 4.) * x + 1960. * pow(alpha, 4.) + 35. * pow(alpha, 3.) * pow(x, 4.) - 770. * pow(alpha, 3.) * pow(x, 3.) + 5145. * pow(alpha, 3.) * pow(x, 2.) - 11655. * pow(alpha, 3.) * x + 6769. * pow(alpha, 3.) - 21. * pow(alpha, 2.) * pow(x, 5.) + 630. * pow(alpha, 2.) * pow(x, 4.) - 6265. * pow(alpha, 2.) * pow(x, 3.) + 24675. * pow(alpha, 2.) * pow(x, 2.) - 35728. * pow(alpha, 2.) * x + 13132. * pow(alpha, 2.) + 7. * alpha * pow(x, 6.) - 273. * alpha * pow(x, 5.) + 3745. * alpha * pow(x, 4.) - 22330. * alpha * pow(x, 3.) + 57834. * alpha * pow(x, 2.) - 56196. * alpha * x + 13068. * alpha - pow(x, 7.) + 49. * pow(x, 6.) - 882. * pow(x, 5.) + 7350. * pow(x, 4.) - 29400. * pow(x, 3.) + 52920. * pow(x, 2.) - 35280. * x)/5040. + 1.;
  } 
  return laguerrePolynomialCompute(x);
};

fn laguerrePolynomialCompute(x: f32) -> f32 {
    var sum : f32 = 0.0;
    for (var i : f32 = 0.0; i <= params.n - params.l - 1.; i += 1.) {
      var product : f32 = pow(-x, i);
      for (var j : f32 = params.n - params.l - 1.; j > 0.; j -= 1.) {
        if (j > i) {
          product *= j + 2. * params.l + 1.;
        } 
        else {
          product /= j;
        }
        if (j <= params.n - params.l - 1. - i) {
          product /= j;
        }
      }
      sum += product;
    }
    return sum;
}

//https://www.shadertoy.com/view/WsBcRh
fn legendrePolynomialCompute(m: f32, l: f32, x: f32) -> f32 {
    var pmm = 1.0;
    if (m > 0.)
    {
        let somx2 = sqrt(1. - (x * x));
        var fact  = 1.0;
        for (var i = 1.; i <= m; i += 1.)
        {
            pmm *= (-fact) * somx2;
            fact += 2.0;
        }
    }
    if (l == m) { return pmm; }
    var pmmp1 = x * (2. * m + 1.) * pmm;
    if (l == (m + 1.)) { return pmmp1; }
    var pll = 0.0;
    for (var ll = m + 2.; ll <= l; ll += 1.)
    {
        pll = ((2.*ll-1.) * x * pmmp1 - (ll + m - 1.) * pmm) / (ll - m);
        pmm = pmmp1;
        pmmp1 = pll;
    }
    return pll;
}

// fn legendrePolynomialCompute(m: f32, l: f32, x: f32) -> f32 {
//     var sum = 0.0;
//     for (var k = m; k <= l; k += 1.) {
//       if ((l - k)%2. == 0.) {
//           sum +=  pow(x, k - m) * factorial(.5 * (l + k - 1.))/ (factorial(k - m) * factorial(l - k) * factorial(.5 * (k - l - 1.)));
//       }
//     }
//     return pow(-1.,m) * pow(2.,l) * pow(1. - x*x, m/2.) * sum;
// }

fn factorial(n: f32) -> f32 {
  var result : u32 = 1;
  for (var i : u32 = u32(n); i > 1; i--) {
    result *= i;
  }
  return f32(result);
};

fn sphericalHarmonic(m: f32, l: f32, theta: f32, phi: f32) -> vec2f {
  return (
    sqrt(((2. * l + 1.) * factorial(l - m)) / (4. * M_PI * factorial(l + m))) * 
    legendrePolynomialCompute(m, l, cos(theta))
    * vec2f(cos(m * phi), sin(m * phi))
  );
};

fn orbitalWaveFunction(r: f32, theta: f32, phi: f32) -> vec2f {
  return 
  sqrt(
    ((pow(2. / (params.n * bohrRadius), 3.) * factorial(params.n - params.l - 1.)) /
      (2. * params.n * factorial(params.n + params.l))) *
      exp(-r / (params.n * bohrRadius)) *
      pow((2. * r) / (params.n * bohrRadius), params.l) *
      laguerrePolynomialPrecomputed(
        (2. * r) / (params.n * bohrRadius)
      ) *
      sphericalHarmonic(params.m, params.l, theta, phi)
  );
};

fn probabilityFunction(r: f32, theta: f32, phi: f32) -> f32 {
  //return orbitalWaveFunction(r, theta, phi).x;
  return pow(length(orbitalWaveFunction(r, theta, phi)), 2.);
}

//https://www.shadertoy.com/view/4djSRW
fn hash14(p4: vec4f) -> f32 {
  var ret = fract(p4 * vec4f(.1031, .1030, .0973, .1099));
  ret += dot(ret, ret.wzxy + 33.33);
  return fract((ret.x + ret.y) * (ret.z + ret.w));
}

fn cloudSDF(p: vec3f) -> f32 {
  var distanceToCenter : f32 = length(p);
  var theta : f32 = atan2(p.x, p.z) + params.thetaRotate;
  var phi : f32 = atan2(sqrt(p.x * p.x + p.z * p.z), p.y) + params.phiRotate;;
  let waveFunction : f32 = probabilityFunction(distanceToCenter, theta, phi);
  return stepLength * (1.0 - pow(hash14(vec4f(params.t * p*p,1./ params.t )),100.) * waveFunction);
  //return stepLength * (1.0 - waveFunction);
};

fn rayMarch(ro: vec3f, rd: vec3f) -> bool {
  var d : f32 = 0.0;
  for (var i : u32 = 0; i < u32(maxSteps); i++) {
    var currentPosition = ro + d * rd;
    var sd = cloudSDF(currentPosition);
    if (sd < minHitDistance) {
      return true;
    } else if (d > maxTraceDistance) {
      break;
    }
    d += sd;
  }
  return false;
};

@compute @workgroup_size(64)
fn main(
  @builtin(global_invocation_id)
  global_id : vec3u
) {
  
  if (global_id.x >= ${(x1c.bitwidth * x1c.bitwidth) / 32}) {
    return;
  }
  output[global_id.x] = 0x00000000;
  var x = ((f32(global_id.x) * 32.) % ${x1c.bitwidth}) / ${x1c.bitwidth}. - .5;
  var y = floor(f32(global_id.x) * 32. / ${x1c.bitwidth}.) / ${
      x1c.bitwidth
    } - .5;
  let ro = vec3f(params.camX, params.camY, params.camZ);
  for (var b = 0.; b < 32.; b += 1.) {
    let rd = vec3f(
      x + b / ${x1c.bitwidth}.,
      y,
      1.
    );
    if (rayMarch(ro, rd)) {
      output[global_id.x] |= u32(0x01 << u32((7. - (b % 8.) + floor(b / 8.) * 8.)));
    }
  }
}
`,
    new Float32Array([
      x1c.n,
      x1c.l,
      x1c.m,
      x1c.timer,
      x1c.camera.x,
      x1c.camera.y,
      x1c.camera.z,
      x1c.thetaRotate,
      x1c.phiRotate,
    ]),
    x1c.gpuOutput
  );
};
