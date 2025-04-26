/** @format */

const x08 = new WobblyBit("x08", {
  title: "Colors!",
  teaser:
    "Sometimes you have to bend the rules a little bit. Let's crank the bit-depth up to 3.",
  feature: `
    <p>What you're seeing is three Wobbly Bit bitmap images layered on top of each other using CSS filters. Each individual image is still black and white in its own right, but is acting as a <a href="https://en.wikipedia.org/wiki/Color_space" target="_blank">color channel</a> for the final image.</p>
    <p>While there is no explicit CSS filter for colorizing a black and white image, I was able to achieve this by using the sepia filter to get the foot in the door to the world of color. It took some trial and error to get the right mix of filters to get the full intensity red, green, and blue hues.</p>
    <p>The final step was to use the CSS mix-blend-mode property to the three color channels to simulate additive and subtractive <a href="https://en.wikipedia.org/wiki/Color_mixing" target="_blank">color mixing</a> so that the secondary colors were visible.</p>
  `,
  citations: [
    {
      title: "CSS Filters",
      source: "MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/filter",
    },
    {
      title: "CSS Mix-Blend Mode",
      source: "MDN",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode",
    },
  ],
});

x08.invert = true;

x08.bitwidth = 64;
x08.timer = 0;

x08.drawCircle = (cx, cy, r) => {
  const output = new Uint8Array((x08.bitwidth * x08.bitwidth) / 8);
  for (let x = 0; x < x08.bitwidth; x++) {
    const bit = x % 8;
    for (let y = 0; y < x08.bitwidth; y++) {
      const byte = Math.floor((y * x08.bitwidth + x) / 8);
      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(distance - r) < 2) {
        output[byte] |= (x + y) % 2 << (7 - bit);
      } else if (distance < r) {
        output[byte] |= 1 << (7 - bit);
      }
    }
  }
  return output;
};

x08.colors = ["red", "green", "blue"];

x08.updateImage(
  new Uint8Array((x08.bitwidth * x08.bitwidth) / 8).fill(0x00),
  x08.bitwidth
);

for (let i = 0; i < x08.colors.length; i++) {
  x08[x08.colors[i] + "Circle"] = new OneBitBmp(
    x08.drawCircle(x08.bitwidth / 2, x08.bitwidth / 2, 0.3 * x08.bitwidth),
    x08.bitwidth
  );
  const circle = x08[x08.colors[i] + "Circle"];
  circle.element = document.createElement("img");
  circle.element.style.filter =
    "brightness(.5) sepia(.5) saturate(80) hue-rotate(" +
    i * 100 +
    "deg) contrast(255)" +
    (!x08.invert ? "  invert(1)" : "");
  circle.element.style.mixBlendMode = !x08.invert ? "darken" : "lighten";
  circle.element.style.borderColor = "transparent !important";
  circle.element.style.pointerEvents = "none";
  circle.element.classList.add(x08.colors[i]);
  circle.element.src = circle.dataUri;
  x08.elements.image.parentElement.appendChild(circle.element);
}
x08.toolbar = [
  x08.optionController(
    "Spacing",
    ["Cover", "Tight", "Wide"],
    (value, index) => {
      if (value === "Wide") {
        x08.redCircle.element.style.transform = "translate(-4px, -40px)";
        x08.greenCircle.element.style.transform = "translate(-44px, 40px)";
        x08.blueCircle.element.style.transform = "translate(36px, 40px)";
      } else if (value === "Tight") {
        x08.greenCircle.element.style.transform = "translate(-14px, 10px)";
        x08.blueCircle.element.style.transform = "translate(6px, 10px)";
        x08.redCircle.element.style.transform = "translate(-4px, -10px)";
      } else if (value === "Cover") {
        x08.redCircle.element.style.transform = "translate(-4px, 0px)";
        x08.greenCircle.element.style.transform = "translate(-4px, 0px)";
        x08.blueCircle.element.style.transform = "translate(-4px, 0px)";
      }
      return value;
    },
    false
  ),
  {
    label: "Invert",
    onClick: () => {
      x08.invert = !x08.invert;
      x08.updateImage(
        new Uint8Array((x08.bitwidth * x08.bitwidth) / 8).fill(
          x08.invert ? 0x00 : 0xff
        ),
        x08.bitwidth
      );
      for (var i = 0; i < x08.colors.length; i++) {
        if (!x08.invert)
          x08[x08.colors[i] + "Circle"].element.style.filter += " invert(1)";
        else
          x08[x08.colors[i] + "Circle"].element.style.filter =
            "brightness(.5) sepia(.5) saturate(80) hue-rotate(" +
            i * 100 +
            "deg) contrast(255)";
        x08[x08.colors[i] + "Circle"].element.style.mixBlendMode = !x08.invert
          ? "darken"
          : "lighten";
      }
    },
  },
  x08.playController(
    () => {
      return true;
    },
    () => {
      x08.redCircle.element.style.transform = "translate(-4px, 0px)";
      x08.greenCircle.element.style.transform = "translate(-4px, 0px)";
      x08.blueCircle.element.style.transform = "translate(-4px, 0px)";
    },
    () => {
      x08.timer += 0.05;
      for (var i = 0; i < x08.colors.length; i++) {
        x08[x08.colors[i] + "Circle"].element.style.transform = `translate(${
          -4 +
          35 *
            Math.max(0, Math.sin(x08.timer)) *
            Math.cos((i * 2 * Math.PI) / 3)
        }px, ${
          35 *
          Math.max(0, Math.sin(x08.timer)) *
          Math.sin((i * 2 * Math.PI) / 3)
        }px)`;
      }
      if (x08.timer > Math.PI) {
        x08.stop();
        x08.timer = -0.5;
      }
    }
  ),
];
