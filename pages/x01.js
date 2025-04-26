/** @format */

const x01 = new WobblyBit("x01", {
  title: "Paint!",
  teaser: "You know what to do!",
  feature: `
    <p>Wobbly Bits was born out of an interest in constraints. Alongside the obvious constraints of a <a href="${getBaseUrl()}?v=${Date.now()}#about">1-bit pseudo-canvas</a>, there's a more general ethos shaping up around what kind of experiments to showcase on the site. We'll see in what ways these get broken in the future, but for now, the loose rules are:
    <ol>
      <li>No external libraries</li>
      <li>No external images</li>
      <li>No code on the backend</li>
    </ol>
    So, what better first experiment than to be able to paint an image from scratch? If you like what you make, you can always right-click and save the BMP file.
    </p>
        <ul>
          <li> <strong class='list-head'>The Implementation</strong><p>Because the Wobbly Bits 1-bit pseudo-canvas</a> is formatted so that the base64 data URI has the pixel data neatly separated from the BMP file header, flipping a single pixel can be done directly in the base64 string without having to keep track of any other underlying pixel buffer. This means that for something like a simple paint widget that only ever changes one pixel at a time, we don't need a buffer at all. Every time a pixel changes, a single base64 character is modified by a single bit. The only math is converting from screen space to pixel space and from pixel space to the character index in the base64 string.</p>
          <p>The history is stored as a string of base64 characters as well. For the history, two characters are used for each change, one for each of the x and y values. There's some wasted space because the default canvas is only 32x32, but it's only one bit per character and leaves room to grow into a 64x64 canvas one day.</p></li>
          <li> <strong class='list-head'>Possible Future Improvements</strong><p>Since this is meant to be a simple little widget, there's probably not much more that will get done, but perhaps a future experiment will find an interesting new approach to something painterly.</p>
            <ol>
              <li><strike>Undo/Redo history</strike></li>
              <li><strike>Animated history replay</strike></li>
              <li>64x64 canvas</li>
              <li>Fill tool</li>
              <li>Shareable/downloadable animations</li>
              <li>Dithering brushes</li>
            </ol>
          </li>
        </ul>
      `,
});

x01.bitwidth = 32;
x01.brushPalette = document.createElement("a");
x01.brushPalette.classList.add("swatch");
x01.brushPalette.id = "brush";
x01.brushPalette.style.cssText = `
  background: black;
  border: 1px solid white;
`;
x01.elements.image.style.cursor = "crosshair";
x01.brushPalette.onclick = () => x01.flipBrush();
x01.brushPalette.innerHTML = "&nbsp";
//x01.article.append(x01.brushPalette);
x01.data = {};
x01.data.brush = false;
x01.flipBrush = () => {
  x01.data.brush = !x01.data.brush;
  x01.brushPalette.style.background = x01.data.brush ? "white" : "black";
};
x01.history = "";
x01.historyStep = 0;

x01.savePointToHistory = (x, y) => {
  if (x01.historyStep * 2 < x01.history.length) {
    x01.history = x01.history.slice(0, x01.historyStep * 2);
  }
  x01.history += Bit6ToChar64(x) + Bit6ToChar64(y);
  x01.historyStep = x01.history.length / 2;
};

x01.loadPointFromHistory = (index) => {
  if (index * 2 < x01.history.length - 1) {
    const x = Char64ToBit6(x01.history[index * 2]);
    const y = Char64ToBit6(x01.history[index * 2 + 1]);
    x01.historyStep = index;
    return { x, y };
  }
  return null;
};

x01.paint = (x, y) => {
  const size = Math.min(
    x01.elements.image.offsetWidth,
    x01.elements.image.offsetHeight
  );
  const pad =
    Math.abs(x01.elements.image.offsetWidth - x01.elements.image.offsetHeight) /
    (2 * size);
  const u =
    x / size -
    (x01.elements.image.offsetWidth > x01.elements.image.offsetHeight
      ? pad
      : 0);
  const v =
    y / size -
    (x01.elements.image.offsetWidth > x01.elements.image.offsetHeight
      ? 0
      : pad);
  const pixel = x01.getPixelUV(u, v);
  if (pixel != x01.data.brush) {
    x01.savePointToHistory(
      Math.floor(u * x01.bitwidth) >>> 0,
      Math.floor(v * x01.bitwidth) >>> 0
    );
    x01.changePixelUV(u, v, pixelFlip);
  } else {
    // console.log(x, y, u, v, pixel);
  }
};

x01.clearImage = () => {
  x01.oldImage = x01.history;
  x01.history = [];
  x01.historyStep = 0;
  x01.updateImage(
    new Uint8Array((x01.bitwidth * x01.bitwidth) / 8).map(() => 0xff),
    x01.bitwidth
  );
};
x01.clearImage();

x01.undo = () => {
  if (x01.historyStep > 0) {
    const last = x01.loadPointFromHistory(x01.historyStep - 1);
    // x01.historyStep--;
    x01.elements.image.src = x01.visual.changePixel(last.x, last.y, pixelFlip);
  } else if (x01.oldImage) {
    x01.history = x01.oldImage;
    for (
      x01.historyStep = 0;
      x01.historyStep * 2 < x01.history.length;
      x01.historyStep++
    ) {
      const point = x01.loadPointFromHistory(x01.historyStep);
      x01.elements.image.src = x01.visual.changePixel(
        point.x,
        point.y,
        pixelFlip
      );
    }
  }
};

x01.redo = () => {
  if (x01.historyStep * 2 < x01.history.length) {
    const next = x01.loadPointFromHistory(x01.historyStep);
    x01.historyStep++;
    x01.elements.image.src = x01.visual.changePixel(next.x, next.y, pixelFlip);
  }
};

x01.elements.image.onpointerdown = (e) => {
  e.preventDefault();
  x01.elements.image.style.cursor = "crosshair";
  x01.paint(e.offsetX, e.offsetY);
  x01.elements.image.onpointermove = (e) => {
    e.preventDefault();
    x01.paint(e.offsetX, e.offsetY);
  };
};

x01.elements.image.onpointerup = (e) => {
  x01.elements.image.style.cursor = "crosshair";
  x01.elements.image.onpointermove = (e) => {
    e.preventDefault();
  };
};
window.addEventListener("pointerup", x01.elements.image.onpointerup);

x01.animation = false;
x01.toolbar = [
  x01.playController(
    () => {
      if (x01.history.length == 0) {
        x01.history = x01.demo;
      }
      if (x01.history) {
        x01.historyStep = 0;
        x01.updateImage(
          new Uint8Array((x01.bitwidth * x01.bitwidth) / 8).map(() => 0xff),
          x01.bitwidth
        );
        return true;
      }
      return false;
    },
    () => {},
    () => {
      if (x01.historyStep * 2 == x01.history.length) {
        x01.stop();
      } else {
        const point = x01.loadPointFromHistory(x01.historyStep);
        x01.elements.image.src = x01.visual.changePixel(
          point.x,
          point.y,
          pixelFlip
        );
        x01.historyStep++;
      }
    }
  ),
  {
    label: "\uf27f",
    classList: ["icon"],
    alt: "Clear",
    onClick: x01.clearImage,
  },
  {
    label: "\uf147",
    classList: ["icon"],
    alt: "Undo",
    onClick: x01.undo,
  },
  {
    label: "\uf148",
    classList: ["icon"],
    alt: "Redo",
    onClick: x01.redo,
  },
  {
    label: "\uf270",
    classList: ["icon"],
    alt: "Change Color",
    onClick: x01.flipBrush,
  },
];

x01.toolbar.append(x01.brushPalette);
x01.demo =
  "LNIPIOINIMILIKIJIIHIHHHGYRYQYPYOYNYMYLYKYJYIZIZHTOLTLULVLWMWNWOWOVPVPWPXQXQYRYSYTYTXTWTVGHFHEHEGDGDFDEEDFCGCGBHBHAIAJAKALAMAMBMCMDMEMFMGUGUFVFVEWEWDXDYDZDaDbDcDcEdEeEeFeGeHeIeJdJdKcKbKaKZKPRPSOSOTPTQTQSHQGQFQEQDQCQCRaRbRcRdReRZReSeTeUeVeWeXeYeZeaebecedeeefCSCTCUCVCWCXCYCZCaCbCcDcDdDeDfNDNEOEPEQEQFRFSFTF";
