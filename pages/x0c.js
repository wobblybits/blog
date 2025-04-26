/** @format */

const x0c = new WobblyBit("x0c", {
  title: "Oscilloscope!",
  teaser:
    "Wiggle your finger (or mouse) and watch the waves. By default, the audio is muted.",
  feature: `
     <p>Visually, this is just a retro romp. The interface of volume and pitch being spatially controlled is a bit of a nod to the theramin. All in all, it was a good first project to get Wobbly Bits interfacing with the WebAudio API.</p>
     <p>The API is pretty straight-forward. But a few sticking points that would be good to note for others:
     <ul class='bulleted'><li>OscillatorNodes are single-use (they can be stopped but never resumed)</li>
     <li>The AudioContext is unable to be taken out of its suspended state until the user has clicked on the page. This is a protection at the browser level and needs to be accommodated as it can't be bypassed</li>
     <li>It was a bit of a wild goose chase figuring out how to expose the raw buffer of streaming audio data. After a few false starts at workarounds, I eventually realized that the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode" target="_blank">AnalyserNode</a> had both the time-domain data as well as the frequency-domain data. For some reason, I had only seen references to it as a way to get the fast Fourier transform (frequency) data. So I wanted to mention it and leave a better breadcrumb trail for others.</li></ul>
     <p>While this little experiment seems complete as is, keep an eye out for future oscilloscope- and audio-related experiments.</p>
  `,
  citations: [
    {
      title: "WebAudio API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API",
      source: "MDN",
    },
  ],
});
x0c.bitwidth = 128;
x0c.gridSize = x0c.bitwidth / 8;
x0c.fftSize = x0c.bitwidth;
x0c.samples = new Uint8Array(x0c.fftSize).fill(x0c.bitwidth / 2);

x0c.audio = new (window.AudioContext || window.webkitAudioContext)();
x0c.synth = {
  volume: x0c.audio.createGain(),
  oscillator: new window.OscillatorNode(x0c.audio, {
    type: "sine",
    frequency: 440,
  }),
  buffer: new window.AnalyserNode(x0c.audio, {
    fftSize: x0c.fftSize,
  }),
};
x0c.synth.buffer.connect(x0c.audio.destination);
x0c.synth.volume.connect(x0c.synth.buffer);
x0c.synth.oscillator.connect(x0c.synth.volume);
x0c.synth.volume.gain.value = 0;
x0c.synth.oscillator.start(x0c.audio.currentTime);

x0c.getWaveSample = (t, a = 1) => {
  return (128 - x0c.samples[Math.floor(t * x0c.fftSize)]) / 128;
  //return a * Math.sin(t * 2 * Math.PI);
};
x0c.drawBackground = () => {
  const buffer = new Uint8Array((x0c.bitwidth * x0c.bitwidth) / 8).fill(0x00);
  for (var x = 0; x < x0c.bitwidth; x += x0c.gridSize) {
    for (var y = 0; y < x0c.bitwidth; y++) {
      if ((x + y) % (x0c.bitwidth / 2 == x ? 2 : 4) == 0)
        x0c.setBitOn(buffer, x, y);
    }
  }
  for (var x = 0; x < x0c.bitwidth; x++) {
    for (var y = 0; y < x0c.bitwidth; y += x0c.gridSize) {
      if ((x + y) % (y == x0c.bitwidth / 2 ? 2 : 4) == 0)
        x0c.setBitOn(buffer, x, y);
    }
  }
  return buffer;
};
x0c.setBitOff = (buffer, x, y) => {
  const byte = Math.floor((x + y * x0c.bitwidth) / 8);
  const bit = 7 - (x % 8);
  buffer[byte] &= ~(1 << bit);
};
x0c.setBitOn = (buffer, x, y) => {
  const byte = Math.floor((x + y * x0c.bitwidth) / 8);
  const bit = 7 - (x % 8);
  buffer[byte] |= 1 << bit;
};
x0c.drawPoint = (buffer, x, y) => {
  for (var i = -2; i <= 2; i++) {
    for (var j = -2; j <= 2; j++) {
      const distance = Math.hypot(i, j);
      if (distance <= 2) {
        if (
          x + i < x0c.bitwidth &&
          y + j < x0c.bitwidth &&
          x + i >= 0 &&
          y + j >= 0
        )
          x0c.setBitOn(buffer, x + i, y + j);
      }
    }
  }
};
x0c.drawSegment = (buffer, prevCoord, coord) => {
  const distance = Math.hypot(coord.x - prevCoord.x, coord.y - prevCoord.y);
  if (distance == 0) return;
  const angle = Math.atan2(coord.y - prevCoord.y, coord.x - prevCoord.x);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const steps = distance / Math.max(Math.abs(dx), Math.abs(dy));
  for (var i = 0; i < steps; i++) {
    const x = Math.round(prevCoord.x + i * dx);
    const y = Math.round(prevCoord.y + i * dy);
    x0c.drawPoint(buffer, x, y);
  }
};

x0c.drawWave = (buffer) => {
  let prevCoord = { x: 0, y: x0c.bitwidth / 2 };

  for (var x = 0; x < x0c.bitwidth; x++) {
    const sample = x0c.getWaveSample(x / x0c.bitwidth);
    // const sample = x0c.getWaveSample(
    //   x / x0c.bitwidth,
    //   (((x0c.audio.currentTime * 100) % 100) - 50) * 0.02
    // );
    const y = Math.floor(((sample + 1) * x0c.bitwidth) / 2);
    //x0c.drawPoint(buffer, x, y);
    x0c.drawSegment(buffer, prevCoord, { x, y });
    prevCoord = { x, y };
  }
  return buffer;
};
x0c.drawMask = (buffer) => {
  for (var x = 0; x < x0c.bitwidth / 2; x++) {
    for (var y = 0; y < x0c.bitwidth / 2; y++) {
      const distance = Math.hypot(
        x0c.bitwidth / 2 - x + 0.5,
        x0c.bitwidth / 2 - y + 0.5
      );
      if (distance >= x0c.bitwidth / 2) {
        x0c.setBitOff(buffer, x, y);
        x0c.setBitOff(buffer, x0c.bitwidth - 1 - x, y);
        x0c.setBitOff(buffer, x, x0c.bitwidth - 1 - y);
        x0c.setBitOff(buffer, x0c.bitwidth - 1 - x, x0c.bitwidth - 1 - y);
      }
      if (Math.abs(Math.round(distance - x0c.bitwidth / 2)) < 1) {
        x0c.setBitOn(buffer, x, y);
        x0c.setBitOn(buffer, x0c.bitwidth - x, y);
        x0c.setBitOn(buffer, x, x0c.bitwidth - y);
        x0c.setBitOn(buffer, x0c.bitwidth - x, x0c.bitwidth - y);
      }
    }
  }
  return buffer;
};

x0c.update = () => {
  x0c.updateImage(
    x0c.drawMask(x0c.drawWave(x0c.drawBackground())),
    x0c.bitwidth
  );
};

x0c.resuming = false;

x0c.interact = (x, y, w, h) => {
  x0c.synth.oscillator.frequency.value = ((2 * x) / w) * 440 + 40;
  const distance = Math.hypot(x - w / 2, y - h / 2);
  x0c.article.querySelector("#x0c-frequency input").value =
    x0c.synth.oscillator.frequency.value;
  x0c.synth.volume.gain.value = Math.max(0, 1 - (2 * distance) / w);
};

x0c.audio.onstatechange = () => {
  x0c.toggleMute();
};

x0c.elements.image.onpointermove =
  x0c.elements.image.onpointerdown =
  x0c.elements.image.onpointerover =
  x0c.elements.image.onpointerenter =
    (e) => {
      e.preventDefault();
      x0c.interact(
        e.offsetX,
        e.offsetY,
        e.target.offsetWidth,
        e.target.offsetHeight
      );
    };

x0c.elements.image.onmousedown =
  x0c.elements.image.ontouchstart =
  x0c.elements.image.ontouchmove =
  x0c.elements.image.click =
    (e) => {
      e.preventDefault();
      if (x0c.audio.state == "suspended") {
        x0c.audio.resume();
      }
    };

x0c.elements.image.onpointerleave =
  x0c.elements.image.onpointerout =
  x0c.elements.image.onpointerup =
  x0c.elements.image.onpointercancel =
    () => {
      x0c.synth.oscillator.frequency.value = 440;
      x0c.synth.volume.gain.value = 0;
      x0c.article.querySelector("#x0c-frequency input").value =
        x0c.synth.oscillator.frequency.value;
    };

window.addEventListener("pointerup", x0c.elements.image.onpointerleave);

x0c.update();
x0c.toggleMute = (change = false) => {
  const mute = x0c.toolbar.querySelector("#x0c-mute");
  if (change && x0c.audio.state == "suspended") {
    x0c.audio.resume();
  } else if (change) {
    x0c.audio.suspend();
  }
  mute.innerHTML = x0c.audio.state == "suspended" ? "\uf20f" : "\uf210";
  mute.style.color = x0c.audio.state == "suspended" ? "red" : "white";
};

x0c.toolbar = [
  {
    label: "\uf20f",
    classList: ["icon"],
    id: "x0c-mute",
    alt: "Mute",
    onClick: x0c.toggleMute,
  },
  x0c.optionController(
    "Waveform",
    ["Triangle", "Sine", "Square", "Sawtooth"],
    (value, index) => {
      x0c.synth.oscillator.type = value.toLowerCase();
      return value;
    }
  ),
  {
    id: "x0c-frequency",
    label:
      "<input type='number' onmousedown='event.preventDefault(); event.target.focus(); if (event.offsetY < event.target.clientHeight/2) { x0c.changeFrequency(1); } else { x0c.changeFrequency(-1); };' onchange='x0c.changeFrequency(this.value - x0c.synth.oscillator.frequency.value);' value='" +
      x0c.synth.oscillator.frequency.value +
      "' />hz",
    alt: "Frequency",
  },
];

x0c.animation = window.setInterval(() => {
  x0c.synth.buffer.getByteTimeDomainData(x0c.samples);
  x0c.update();
}, 25);

x0c.toggleMute(true);
