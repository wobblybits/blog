/** @format */

const x05 = new WobblyBit("x05", {
  title: "Road Trip!",
  teaser:
    "A classic depth illusion from the early days of video games. Still drives like a dream after all these years.",
  feature: `<p>I probably first came across Lou's Pseudo-3D page close to two decades ago and it's stayed with me all these years. It is a great summary of a very specific but familiar algorithm. I have built previous projects based on it, including a mechanical sculpture that replicates the basic road animation, so I wanted to create a simple homage here on Wobbly Bits.</p>
  <ul>
  <li><strong class="list-head">Possible Future Improvements</strong>
  <ol>
    <li>Hills</li>
    <li>Roadside features</li>
    <li>Interactivity</li>
  </ol>
  </li>
  </ul>
      `,
  citations: [
    {
      url: "http://www.extentofthejam.com/pseudo/",
      title: "Lou's Pseudo-3D Page",
    },
    {
      title: "Pseudo-3D",
      url: "https://en.wikipedia.org/wiki/Pseudo-3D",
      source: "Wikipedia",
    },
  ],
});

x05.toolbar = [
  x05.playController(
    () => true,
    () => {},
    () => {
      x05.updateImage(x05.drawRoad(), x05.bitwidth);
      x05.timer += x05.speed;
      if (x05.turnmap.length < x05.bitwidth) {
        x05.nextTurn = Math.round(2 * (Math.random() - 0.5));
        x05.turnmap.push(
          ...new Array(Math.ceil(x05.bitwidth / 3)).fill(x05.nextTurn * 0.02)
        );
      }
    }
  ),
];
x05.timer = 0;
x05.bitwidth = 160;
x05.turnmap = new Array(x05.bitwidth).fill(0x00);
x05.nextTurn = 0;
x05.isStraight = false;
x05.horizon = 0;
x05.speed = 0.75;
x05.distance = 0;

x05.drawRoad = () => {
  const ddz = 5 / x05.bitwidth;
  let dz = 0.1;
  let z = 6;
  let scale = 8 / z;
  let dturn = 0;
  let turn = 0;
  let horizon_turn = 0;
  x05.distance += x05.speed;

  if (x05.distance >= 1) {
    x05.turnmap.shift();
    x05.distance = 0;
  }

  const road = new Uint8Array((x05.bitwidth * x05.bitwidth) / 8);
  for (let i = 0; i < road.length; i++) {
    const row = Math.floor(i / (x05.bitwidth / 8));
    const sky_turn = (Math.round(x05.horizon / 200) + 8000) % 8;
    const sky = 0x00;
    if (Math.round(x05.bitwidth * 0.15) == row) {
      horizon_turn = turn;
    }
    if (row > x05.bitwidth * 0.5) {
      road[i] = ((sky << sky_turn) | (sky >> (8 - sky_turn + 8000) % 8)) & 0xff;
      if (row < x05.bitwidth * 0.6) {
        for (let b = 0; b < 8; b++) {
          if (
            row / x05.bitwidth - 0.55 <
            Math.sin(
              ((((i * 8 + b) % x05.bitwidth) + 0.05 * x05.horizon) *
                1.25 *
                Math.PI) /
                x05.bitwidth -
                4
            ) *
              (0.1 +
                Math.pow(
                  Math.sin(
                    ((((i * 8 + b) % x05.bitwidth) + 0.05 * x05.horizon) *
                      1 *
                      Math.PI) /
                      x05.bitwidth -
                      2
                  )
                ),
              2)
          ) {
            const setBit =
              ((row % 4 ^ (8 * i + b + x05.bitwidth + 0.05 * x05.horizon) % 4) <
              1
                ? 0x01
                : 0x00) <<
              (7 - b);
            road[i] = (road[i] & ~(0x01 << (7 - b))) | setBit;
          }
        }
      }
      if (row < x05.bitwidth * 0.65) {
        for (let b = 0; b < 8; b++) {
          if (
            row / x05.bitwidth - 0.55 <
            Math.sin(
              ((((i * 8 + b) % x05.bitwidth) + 0.1 * x05.horizon) *
                2 *
                Math.PI) /
                x05.bitwidth
            ) *
              Math.pow(
                Math.cos(
                  ((((i * 8 + b) % x05.bitwidth) + 0.1 * x05.horizon) *
                    2.5 *
                    Math.PI) /
                    x05.bitwidth
                ),
                2
              )
          ) {
            const setBit =
              ((row % 3 ^ (i * 8 + b + x05.bitwidth) % 3) > 0 ? 0x00 : 0x01) <<
              (7 - b);
            road[i] = (road[i] & ~(0x01 << (7 - b))) | setBit;
          }
        }
      }
    } else if (row == x05.bitwidth / 2) {
      road[i] = 0x00;
      x05.turn = turn;
    } else {
      if (i % (x05.bitwidth / 8) == 0) {
        dz += ddz;
        z += dz;
        dturn += x05.turnmap[row] ?? 0;
        turn += dturn;
        scale = 8 / z;
      }
      for (let bit = 0; bit < 8; bit++) {
        const x = Math.round(((i * 8 + bit) % x05.bitwidth) - turn);
        const dx = Math.abs(x - x05.bitwidth / 2);
        if (
          dx - 0.5 < 3 * scale &&
          Math.floor(row / (60 * scale) + x05.timer / 5) % 2 < 1
        ) {
          road[i] |= 0x01 << (7 - bit);
        } else if (dx > x05.bitwidth * scale) {
          if (Math.floor(row / (60 * scale) + x05.timer / 5) % 8 < 4)
            road[i] |= (bit % 2 ^ (row + x05.timer) % 2) << (7 - bit);
          else {
            road[i] |= 0x01 << (7 - bit);
          }
        }
      }
    }
  }
  x05.horizon += turn * Math.pow(x05.speed, 4);
  return road;
};

x05.updateImage(x05.drawRoad(), x05.bitwidth);
