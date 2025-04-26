/** @format */

const x07 = new WobblyBit("x07", {
  title: "Watch out!",
  teaser: "Nothing to see here...",
  feature: `
    <p>No big science, math, or technical feats here, just a fun giant eyeball watching you move around the screen. I suppose the inspiration was to create an entry that was the opposite of passively/politely interactive.</p>
    <p>The eyeball is generated based on a few circle drawing equations overlaid. If it's been a while since you've moved on the screen or if you try to poke it directly, the eyeball will blink.</p>
    <p>In this experiment, only the mouse (or touch) movements are reacted to, but there are future experiments to be done with device <a href="https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer" target="_blank">Accelerometer</a> or <a href="https://developer.mozilla.org/en-US/docs/Web/API/AmbientLightSensor" target="_blank">AmbientLightSensor</a> data.</p>
  `,
});

x07.bitwidth = 64;
x07.cursor = { x: 0, y: 0 };
x07.blinkTimeout = false;
x07.timer = 0;
x07.blink = () => {
  window.clearTimeout(x07.blinkTimeout);
  x07.updateImage(x07.drawEyeball(), x07.bitwidth);
  if (x07.timer > 2 * Math.PI) {
    if (x07.forceSquint != 0) {
      x07.forceSquint *= 0.9;
    }
    window.clearTimeout(x07.blinkTimeout);
    x07.blinkTimeout = window.setTimeout(
      x07.blink,
      1000 + Math.random() * 8000
    );
    x07.timer = 0;
  } else if (x07.timer > Math.PI) {
    x07.timer += 0.4;
    x07.forceSquint = -0.05 * Math.sin(x07.timer);
    window.clearTimeout(x07.blinkTimeout);
    x07.blinkTimeout = window.setTimeout(x07.blink, 20);
  } else {
    x07.timer += 0.2;
    x07.forceSquint = -Math.sin(x07.timer);
    window.clearTimeout(x07.blinkTimeout);
    x07.blinkTimeout = window.setTimeout(x07.blink, 20);
  }
};
x07.forceSquint = 0;

x07.track = (e) => {
  try {
    x07.cursor = { x: e.clientX, y: e.clientY };
    x07.updateImage(x07.drawEyeball(), x07.bitwidth);
    if (x07.blinkTimeout) {
      if (x07.forceSquint != 0) {
        x07.forceSquint *= 0.9;
      }
    }
    window.clearTimeout(x07.blinkTimeout);
    x07.blinkTimeout = window.setTimeout(
      x07.blink,
      8000 + Math.random() * 20000
    );
  } catch (e) {}
};

window.addEventListener("pointermove", (e) => {
  x07.track(e);
});
window.addEventListener("pointerdown", (e) => {
  x07.track(e);
});
window.addEventListener("pointerup", (e) => {
  x07.track(e);
});

// try {
//   x07.acl = new Accelerometer({ frequency: 60 });
//   x07.acl.addEventListener("reading", () => {
//     x07.updateImage(
//       x07.drawEyeball({ x: x07.acl.x, y: x07.acl.y }),
//       x07.bitwidth
//     );
//   });

//   x07.acl.start();
// } catch (e) {}

window.addEventListener("scroll", (e) => {
  window.clearTimeout(x07.blinkTimeout);
  x07.updateImage(
    x07.drawEyeball({ x: e.clientX, y: e.clientY }),
    x07.bitwidth
  );
  if (x07.blinkTimeout) {
    if (x07.forceSquint != 0) {
      x07.forceSquint *= 0.9;
    }
    x07.blinkTimeout = null;
  }
});

x07.elements.image.addEventListener("click", (e) => {
  x07.blink();
});

x07.drawEyeball = () => {
  const eyeball = new Uint8Array((x07.bitwidth * x07.bitwidth) / 8);
  const eyeScreen = x07.elements.image.getBoundingClientRect();
  const eyeScreenCenter = {
    x: eyeScreen.x + eyeScreen.width / 2,
    y: eyeScreen.y + eyeScreen.height / 2,
  };
  const centerX = x07.bitwidth / 2;
  const centerY = x07.bitwidth / 2;
  const gazeAngle = Math.atan2(
    x07.cursor.y - eyeScreenCenter.y,
    (x07.cursor.x - eyeScreenCenter.x) * 1.5
  );
  const gazeMagnitude = Math.min(
    0.15 *
      Math.sqrt(
        (x07.cursor.x - eyeScreenCenter.x) ** 2 +
          (x07.cursor.y - eyeScreenCenter.y) ** 2 +
          Math.max(
            (x07.cursor.x - eyeScreenCenter.x) ** 2,
            (x07.cursor.y - eyeScreenCenter.y) ** 2,
            900
          )
      ),
    x07.bitwidth * 0.4
  );

  // console.log(x07.cursor, eyeScreen, gazeAngle, gazeMagnitude);
  const whiteRadius = x07.bitwidth / 2;
  const pupilRadius = x07.bitwidth / 4;
  const squint = Math.max(
    Math.max(
      Math.min(Math.abs(x07.cursor.y - eyeScreenCenter.y) / 256, 0.75),
      0.35
    ) *
      (1 + x07.forceSquint),
    0.1
  );
  for (let x = 0; x < x07.bitwidth; x++) {
    for (let y = 0; y < x07.bitwidth; y++) {
      const byte = Math.floor((y * x07.bitwidth + x) / 8);
      const bit = 7 - (x % 8);

      const whiteDistance = Math.sqrt(
        ((x - centerX) / Math.min(squint + 0.6, 1.0)) ** 2 +
          ((y - centerY) / squint) ** 2
      );
      if (whiteDistance < whiteRadius) {
        eyeball[byte] |= 1 << bit;
      }

      let dilation = Math.pow(squint, 0.25) * 1.5;
      let dilationRadius = pupilRadius * dilation;

      const pupilX =
        centerX +
        Math.cos(gazeAngle) * gazeMagnitude * (Math.abs(squint - 0.6) + 0.6);
      const pupilY =
        centerY -
        Math.sin(gazeAngle) * gazeMagnitude * (Math.abs(squint - 0.6) + 0.6);
      const pupilDistance = Math.sqrt((pupilX - x) ** 2 + (pupilY - y) ** 2);
      if (pupilDistance < dilationRadius) {
        if (Math.abs(pupilDistance - dilationRadius) < 2) {
          eyeball[byte] &= ~(1 << bit);
        } else if (pupilDistance > Math.pow(0.6 * dilationRadius, 1.01)) {
          eyeball[byte] &= ~((x % 2 ^ y % 2) << bit);
        } else if (pupilDistance < Math.pow(0.6 * dilationRadius, 1.2)) {
          eyeball[byte] &= ~(1 << bit);
        }
      }

      const lidDistance = Math.sqrt(
        (x - centerX) ** 2 +
          ((y - centerY) /
            Math.pow(
              squint,
              (y > centerY) ^ (gazeAngle < Math.PI) ? 1.2 : 2
            )) **
            2
      );
      if (Math.abs(lidDistance - 2 - whiteRadius) <= 5) {
        eyeball[byte] =
          (eyeball[byte] & ~(1 << bit)) |
          ((centerY <= y ? (x + y) % 2 : 0x01) << bit);
      } else if (lidDistance > whiteRadius + 4) {
        if (centerY <= y) {
          eyeball[byte] |= 1 << bit;
        } else {
          eyeball[byte] &= ~(1 << bit);
        }
      }

      if (whiteDistance >= whiteRadius) {
        eyeball[byte] &= ~(1 << bit);
      }
    }
  }
  return eyeball;
};

x07.updateImage(x07.drawEyeball(0, 0), x07.bitwidth);
