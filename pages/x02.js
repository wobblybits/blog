/** @format */

const x02 = new WobblyBit("x02", {
  title: "Quasicrystals!",
  teaser:
    "This is what happens when you put a bunch of stripes together. Not even all that many.",
  feature: `
      <p>I'm no crystal scientist, but I don't need to be... these are only quasi-crystals!</p>
      <p>Because quasicrystalline patterns were originally theorized to be impossible in naturally formed crystals, they have been studied in abstracted forms and this research overlaps with, for example, the mathematics of <a href="https://en.wikipedia.org/wiki/Penrose_tiling" target="_blank">Penrose tilings</a>.</p>
      <p>The patterns shown here are formed by creating rotationally symmetric patterns of certain degrees, namely those not found in naturally occurring crystals which have 2-, 3-, 4-, 6-, or 8-fold rotational symmetry. The visualizations are produced by compositing layers of stripes that are spaced out at regular intervals (2π / n radians) depending on the degree of symmetry (n) and then operating on the result with a compositing function.</p>
 <ul>
          <li> <strong class='list-head'>The Implementation</strong><p>
          There are two different component patterns, since we have a choice whether we want to quantize to our binary palette before or after operating on the stripes. Since the stripes are periodic waves, we can either use a continuous function (like sine or cosine) or we can use a discrete function (like square waves).</p>
          <p>In the square wave implementation, the only information we have is directional (high or low), so we need to choose an interesting way to aggregate that information into a single value. The XOR operator acts as a <a href="https://en.wikipedia.org/wiki/Parity_function" target="_blank">parity calculator</a>, telling us whether we have an even or odd number of layers in the high state. Both the square wave and XOR functions are quick, and the results are surprisingly the most complex looking. We can also average the values to tell which direction they tend towards when taken together. We end up with a less complicated pattern, but one that still has a lot of pointy shards and artifacts from the hard edges of the stripes colliding.</p>
          <p>In the cosine implementation, we're getting continuous values between -1 and 1. It's more overhead to calculate the trigonometric function for each layer at each pixel, but the interference patterns produced (where the peaks and troughs of each wave overlap) are much smoother and have more coherent shapes than the shattered glass mandalas of the square wave implementation. The XOR function is visualizing a completely different aspect of the pattern, but we can see that the AVG function was actually a crude (but more efficient) approximation of the smooth SUM pattern. If instead of adding the continuous values together, we multiply them, we get a result that is identical to the square wave implementation, since by the time it gets rendered, all we can see is the sign of the result (black = negative, white = positive) and multiplying negative signs is just another way to calculate parity.</p></li>
          <li> <strong class='list-head'>WebGPU</strong><p>
          Because I wanted to test out large numbers for both the canvas size and for the number of rotational symmetries, I decided to try out using the GPU to handle the calculations. I know there are going to be experiments in the future where the GPU will come in clutch, so now was as good a time as any to get some basic infrastructure in place in the codebase.</p>
          <p>In the same way that Wobbly Bits is bypassing the HTML canvas in order to honor the compactness of the minimal bit depth, I really didn't want to have to pretend like our data was structured to be vec3's and vec4's full of vertex or color data. So instead of using WebGL 1 or 2, I started looking at the new WebGPU API. It's not fully compatible with all the major browsers yet, but it looks like it's going to be the future of GPU computing in the browser. And one of the best things about it compared to WebGL is that it allows for actual compute shader modules. While there is documentation for the technical specifications of the standard, it was pretty lousy pickings for what example implementations would look like, at least for a shader newbie like me. Many thanks to <a href="https://toji.dev/webgpu-best-practices/" target="_blank">Toji.dev</a> for having the best full examples and explanations that I could find to get me through the final (frustrating) steps. I am looking forward to seeing WebGPU become more widespread. In the meantime, the CPU javascript implementation is still in place as a fallback.</p>
          </p></li>
          <li> <strong class='list-head'>Possible Future Improvements</strong><p>Since quasi-crystals connect to some rich mathematics, there's likely some interesting side-quests to go down.</p>
            <ol>
              <li><strike>WebGPU implementation</strike></li>
              <li>Optimized rendering to take advantage of symmetries</li>
              <li>Additional 1d wave functions (triangle waves, sawtooth waves, etc.)</li>
              <li>Additional compositing functions (<strike>AVG</strike>, <strike>AND</strike>, <strike>PROD</strike>, ?)</li>
              <li>Component patterns that vary in more than one dimension (?)</li>
              <li>3D implementation using 2D rotational components (?)</li>
              <li>Navigation away from center of rotation</li>

            </ol>
          </li>
        </ul>
    `,
  citations: [
    {
      title: "Quasicrystal",
      url: "https://en.wikipedia.org/wiki/Quasicrystal",
      source: "Wikipedia",
    },
    {
      title: "WebGPU Best Practices",
      url: "https://toji.dev/webgpu-best-practices/",
      source: "Toji.Dev",
    },
  ],
});

x02.bandScale = 0.3;

x02.squareWaveCosine = (theta) => {
  return (Math.floor((2 * theta - 0.5) / Math.PI) + 401) % 4 < 2 ? 1 : 0;
};

x02.squareWaveSine = (theta) => {
  return (Math.floor((2 * theta - 0.5) / Math.PI) + 400) % 4 < 2 ? 1 : 0;
};

x02.interferenceByteXor = function (x, y, n, width, t = 0, scale = 0.3) {
  let result = 0x00;
  const construct_loop = n; //Math.min(n, (Math.floor(t / 3) % (n + 10)) + 1);
  for (let i = 0; i < construct_loop; i++) {
    const cos = Math.cos((2 * i * Math.PI) / n);
    const sin = y * Math.sin((2 * i * Math.PI) / n);
    for (let b = 0; b < 32; b++) {
      result ^=
        (x02.squareWaveCosine(((x + b) * cos + sin) * scale + t) > 0) <<
        (7 - (b % 8) + Math.floor(b / 8) * 8);
    }
  }
  return result;
};

x02.interferenceByteAnd = function (x, y, n, width, t = 0, scale = 0.3) {
  let result = 0xffffffff;
  const construct_loop = n; //Math.min(n, (Math.floor(t / 3) % (n + 10)) + 1);
  for (let i = 0; i < construct_loop; i++) {
    const cos = Math.cos((2 * i * Math.PI) / n);
    const sin = y * Math.sin((2 * i * Math.PI) / n);
    for (let b = 0; b < 32; b++) {
      if (x02.squareWaveCosine(((x + b) * cos + sin) * scale + t) > 0) {
        result &= ~(1 << (7 - (b % 8) + Math.floor(b / 8) * 8));
      }
    }
  }
  return result;
};

x02.interferenceByteAvg = function (x, y, n, width, t = 0, scale = 0.3) {
  let result = 0x00;
  for (let b = 0; b < 32; b++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const cos = Math.cos((2 * i * Math.PI) / n);
      const sin = y * Math.sin((2 * i * Math.PI) / n);
      sum += x02.squareWaveCosine(((x + b) * cos + sin) * scale + t);
    }

    result |= (sum >= n / 2) << (7 - (b % 8) + Math.floor(b / 8) * 8);
  }
  return result;
};

x02.interferenceByteSum = function (x, y, n, width, t = 0, scale = 0.3) {
  let result = 0x00;
  for (let b = 0; b < 32; b++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const cos = Math.cos((2 * i * Math.PI) / n);
      const sin = y * Math.sin((2 * i * Math.PI) / n);
      sum += Math.cos(((x + b) * cos + sin) * scale + t);
    }

    result |= (sum >= 0) << (7 - (b % 8) + Math.floor(b / 8) * 8);
  }
  return result;
};

x02.interferenceByteProd = function (x, y, n, width, t = 0, scale = 0.3) {
  let result = 0x00;
  for (let b = 0; b < 32; b++) {
    let sum = 1;
    for (let i = 0; i < n; i++) {
      const cos = Math.cos((2 * i * Math.PI) / n);
      const sin = y * Math.sin((2 * i * Math.PI) / n);
      sum *= Math.cos(((x + b) * cos + sin) * scale + t);
    }

    result |= (sum >= 0) << (7 - (b % 8) + Math.floor(b / 8) * 8);
  }
  return result;
};

x02.timer = 0;
x02.interferenceFns = [
  x02.interferenceByteXor,
  x02.interferenceByteAvg,
  x02.interferenceByteSum,
  x02.interferenceByteProd,
  x02.interferenceByteAnd,
];
x02.interferenceFnIndex = 0;
x02.interferenceFn = x02.interferenceFns[x02.interferenceFnIndex];

x02.updateImage(
  new Uint32Array((x02.bitwidth * x02.bitwidth) / 32).map((_, i) =>
    x02.interferenceFn(
      ((i * 32) % x02.bitwidth) - x02.bitwidth / 2,
      Math.floor((i * 32) / x02.bitwidth) - x02.bitwidth / 2,
      x02.num_rotations,
      x02.bitwidth,
      x02.timer,
      x02.bandScale
    )
  ),
  x02.bitwidth
);

x02.gpuDestroy = () => {
  if (x02._gpu) {
    x02._gpu.device.destroy();
    x02._gpu = null;
  }
};

x02.gpuRestart = () => {
  x02.gpuOutput = new Uint32Array((x02.bitwidth * x02.bitwidth) / 32);

  x02.computeGPU(
    `
  struct Params {
    n: f32,
    t: f32,
    scale: f32,
    selectedFn: f32,
  };

  const M_PI = radians(180.0);

  @group(0) @binding(0) var<storage, read_write> output: array<u32>;
  @group(0) @binding(1) var<uniform> params: Params;

  fn squareWaveCosine(theta: f32) -> bool {
    var band = (floor(2. * (theta / M_PI)) + 400) % 4.;
    return (band < 2.);
  };

  fn interferenceByteXor(x: f32, y: f32, n: f32, t: f32, scale: f32) -> u32 {
    var result = 0;
    for (var i = 0.; i < n; i+= 1.) {
      let band_cos = cos(M_PI * (2. * i / n) );
      let band_sin = y * sin(M_PI * (2. * i / n));
      for (var b = 0.; b < 32; b+= 1.) {
        if (squareWaveCosine(((x + b) * band_cos + band_sin) * scale + t)) {
          result ^=
            (1 << u32(7. - (b % 8.) + floor(b / 8.) * 8.));
        }
      }
    }
    return u32(result);
  };

  fn interferenceByteAnd(x: f32, y: f32, n: f32, t: f32, scale: f32) -> u32 {
    var result: u32 = ${0xffffffff};
    for (var i = 0.; i < n; i+= 1.) {
      let band_cos = cos(M_PI * (2. * i / n) );
      let band_sin = y * sin(M_PI * (2. * i / n));
      for (var b = 0.; b < 32; b+= 1.) {
        if (squareWaveCosine(((x + b) * band_cos + band_sin) * scale + t)) {
          result &= ~u32(1 << u32(7. - (b % 8.) + floor(b / 8.) * 8.));
        }
      }
    }
    return u32(result);
  };

  fn interferenceByteAvg(x: f32, y: f32, n: f32, t: f32, scale: f32) -> u32 {
    var result = 0;
    for (var b = 0.; b < 32.; b+= 1.) {
      var sum = 0.;
      for (var i = 0.; i < n; i+= 1.) {
        let band_cos = cos((2. * i * M_PI) / n);
        let band_sin = y * sin((2. * i * M_PI) / n);
        if (squareWaveCosine(((x + b) * band_cos + band_sin) * scale + t)) {
          sum += 1.;
        }
      }
      if ((sum >= n / 2.)) {
        result |= 1 << u32(7. - (b % 8.) + floor(b / 8.) * 8.);
      }
    }
    return u32(result);
  };

  fn interferenceByteSum(x: f32, y: f32, n: f32, t: f32, scale: f32) -> u32 {
    var result = 0;
    for (var b = 0.; b < 32.; b+= 1.) {
      var sum = 0.;
      for (var i = 0.; i < n; i+= 1.) {
        let band_cos = cos((2. * i * M_PI) / n);
        let band_sin = y * sin((2. * i * M_PI) / n);
        sum += cos(((x + b) * band_cos + band_sin) * scale + t);
      }
      if ((sum / n >= 0.)) {
        result |= 1 << u32(7. - (b % 8.) + floor(b / 8.) * 8.);
      }
    }
    return u32(result);
  };

    fn interferenceByteProd(x: f32, y: f32, n: f32, t: f32, scale: f32) -> u32 {
    var result = 0;
    for (var b = 0.; b < 32.; b+= 1.) {
      var sum = 1.;
      for (var i = 0.; i < n; i+= 1.) {
        let band_cos = cos((2. * i * M_PI) / n);
        let band_sin = y * sin((2. * i * M_PI) / n);
        sum *= cos(((x + b) * band_cos + band_sin) * scale + t);
      }
      if ((sum / n >= 0.)) {
        result |= 1 << u32(7. - (b % 8.) + floor(b / 8.) * 8.);
      }
    }
    return u32(result);
  };

  @compute @workgroup_size(64)
  fn main(
    @builtin(global_invocation_id)
    global_id : vec3u
  ) {
    var x = ((f32(global_id.x) * 32.) % ${x02.bitwidth}) - ${x02.bitwidth / 2}.;
    var y = floor(f32(global_id.x) * 32. / ${x02.bitwidth}) - ${
      x02.bitwidth / 2
    }.;

    if (global_id.x >= ${(x02.bitwidth * x02.bitwidth) / 32}) {
      return;
    }

    if (params.selectedFn == 0.) {
      output[global_id.x] = interferenceByteXor(x, y, params.n, params.t, params.scale);
    } 
    else if (params.selectedFn == 1.) {
      output[global_id.x] = interferenceByteAvg(x, y, params.n, params.t, params.scale);
    }
    else if (params.selectedFn == 2.) {
      output[global_id.x] = interferenceByteSum(x, y, params.n, params.t, params.scale);
    }
    else if (params.selectedFn == 3.) {
      output[global_id.x] = interferenceByteProd(x, y, params.n, params.t, params.scale);
    }
    else if (params.selectedFn == 4.) {
      output[global_id.x] = interferenceByteAnd(x, y, params.n, params.t, params.scale);
    } 
  }
`,
    new Float32Array([
      x02.num_rotations,
      x02.timer,
      x02.bandScale,
      x02.interferenceFnIndex,
    ]),
    x02.gpuOutput
  );
};

x02.toolbar = [
  x02.optionController("Image Size", [128, 256, 512, 64], (value, index) => {
    x02.bitwidth = value;
    try {
      x02.gpuDestroy();
      x02.gpuRestart();
    } catch (e) {}
    return `${value}x${value}`;
  }),
  x02.optionController(
    "Rotational Symmetry",
    [9, 11, 13, 5, 7],
    (value, index) => {
      x02.num_rotations = value;
      return `${value}-fold`;
    }
  ),
  x02.optionController(
    "Overlay Operation",
    ["XOR", "AVG", "SUM", "PROD", "AND"],
    (value, index) => {
      x02.interferenceFnIndex = index;
      x02.interferenceFn = x02.interferenceFns[index];
      return value;
    }
  ),
  x02.playController(
    () => true,
    () => {
      try {
        x02.gpuDestroy();
      } catch (e) {}
    },
    () => {
      x02.timer += Math.PI / 120;
      if (!x02._gpu) {
        try {
          x02.gpuRestart();
        } catch (e) {
          x02.updateImage(
            new Uint32Array((x02.bitwidth * x02.bitwidth) / 32).map((_, i) =>
              x02.interferenceFn(
                ((i * 32) % x02.bitwidth) - x02.bitwidth / 2,
                Math.floor((i * 32) / x02.bitwidth) - x02.bitwidth / 2,
                x02.num_rotations,
                x02.bitwidth,
                x02.timer,
                x02.bandScale
              )
            ),
            x02.bitwidth
          );
        }
      } else {
        try {
          x02._gpu.render(
            new Float32Array([
              x02.num_rotations,
              x02.timer,
              x02.bandScale,
              x02.interferenceFnIndex,
            ]),
            x02.gpuOutput
          ),
            x02.updateImage(x02.gpuOutput, x02.bitwidth);
        } catch (e) {
          x02.updateImage(
            new Uint32Array((x02.bitwidth * x02.bitwidth) / 32).map((_, i) =>
              x02.interferenceFn(
                ((i * 32) % x02.bitwidth) - x02.bitwidth / 2,
                Math.floor((i * 32) / x02.bitwidth) - x02.bitwidth / 2,
                x02.num_rotations,
                x02.bitwidth,
                x02.timer,
                x02.bandScale
              )
            ),
            x02.bitwidth
          );
        }
      }
    }
  ),
];
