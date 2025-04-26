/** @format */

const x00 = new WobblyBit("x00", {
  title: "About!",
  teaser:
    "What is a Wobbly Bit?<br>Why is everyone talking about Wobbly Bits? Am I a Wobbly Bit? Answers to these questions and more!",
  feature: `
      <p>Sometimes you go down a rabbit hole and it becomes your favorite new hangout spot.</p>

      <p>Wobbly Bits started as a simple experiment in creating a web-friendly 1-bit image canvas and then, like all good things, it grew a little and became a fun micro-blogging platform.</p>
      <ul>

      <li><strong class='list-head'>Why create a one-bit canvas?</strong></div><p>Well, to start, there's something nice about the simplicity of designs that only use two colors. The constraint can lead to clever and elegant solutions, and the extreme obviousness of the constraint makes that elegance all the more visible.</p>
      <p>The native HTML canvas element can produce black-and-white images, that is true, but it doesn't constrain you to. In fact, instead of getting a feeling that you're doing something minimal and efficient, when you are using the native canvas element to generate a "1-bit" image, you are unavoidably faced with the horror of how wasteful you are being.</p>
      <p>See, the &lt;canvas&gt; element, like all the most ubiquitous modern and web-friendly graphics formats is a 4-channel 8-bit format. That means that each pixel is stored as 4 bytes, or 32 bits. That's a lot of bits to represent a single pixel! It's like buying a pack of grapes every time you want to eat a single grape and then watching the other 31 grapes get tossed in the garbage. Wasteful! Torture!</p>
      <p>So in some ways, Wobbly Bits is all about intrapsychic ergonomics. Let's make sure we feel good when we're coding!</p></li>
      
      <li><strong class='list-head'>How does it work?</strong><p>There was some serious trial and error coming up with what might be the best solution (and there is likely still a better one out there!).</p>
      <p>The principles (and circumstances) that guided the brainstorming were:</p>
      <ol>
      <li>It should feel compact rather than wasteful</li>
      <li>It should be friendly across most browsers and devices</li>
      <li>It should support animation and interaction</li>
      <li>It should be quick</li>
      </ol>
      <p>As hard as I tried to come up with an off-the-wall reinvention of some obscure web API component, the best solution I could come up with ended up being the most straightforward and realistic &mdash; find an image format that supports a bit depth of 1, pack the bit data into a data URI, and plug it into the plain vanilla &lt;img&gt; element.</p>
      <p>It took a few attempts to find the right image format. Besides supporting a bit depth of 1, I also realized that I didn't want to deal with compression or long (wasteful!) file headers.</p>
      <p>The TIFF format seemed like a good candidate, but ultimately lacked browser support.
      <p>The PNG format was next. Although it could handle uncompressed and single bit data, it  required the calculation of CRC codes after each file segment, which didn't feel compact. And even after fussing with all of that, it turns out that browser compatibility for this exotic variant of the PNG format was no good.</p>
      <p>Finally, I ended up with the good old BMP format, which for some reason I had not expected to have browser support (indeed, there are plenty of warnings not to use them). After some trial and error with Image Magick to make sure a minimal 1-bit version of a BMP would be displayed correctly, there was finally hope!</p>
      <p>Synalize It! came in handy for twiddling with the BMP file headers (just as it had for the TIFF and PNG attempts). I tried to cut out any excess and inessential declarations, but to maximize compatibility, some compromises were made.</p>
      <p>The BMP format did impose one new constraint, despite being otherwise perfect for the task: It wanted each row of pixel data to contain a multiple of 4 bytes (remember how most formats expect four 8-bit channels per pixel?). That meant that to avoid having to face throwing away a bunch of grapes again (zero padding), a 1-bit image would have to be a multiple of 32 pixels wide. Fine.</p>
      <p>Since I knew that all this binary/hexadecimal goop was ultimately going to be converted to base64 for use in the data URI, I did end up adding a small amount of zero padding to the file header. Base64 encoding means you get 6 bits of data per character (2<sup>6</sup> = 64). So in order for the actual pixel data of the BMP data URI to be cleanly separated from the file header (see why this is useful <a href="?${new Date().getTime()}#x01">here</a>), I made sure that there was just the right spacing to have it start at a memory location that was a multiple of 6.</p>
      </li>

      <li><strong class='list-head'>What's all this other stuff?</strong><p>Well, once the format was figured out, it was time to start making stuff! Since the point was to be able to directly manipulate the binary image data and see the results, the race was on to start working visually and see what was possible. And because a lot of the initial inspiration was to keep things constrained, quick, and easy, I built a little micro-blogging framework that ran entirely client-side &mdash; no need for backend server code, databases, or content management systems.</p>
      <p>Check out <a href="https://github.com/wobblybits/">github.com/wobblybits</a> (or right click and view source on any page) to see how it all fits together.</p></li>

      <li><strong class='list-head'>What's a Wobbly Bit?</strong><p>If you ask someone from the U.K., a wobbly bit is a part of the human body that's got some wobble to it. In programmer parlance, bits are the smallest data units. They can only be 0 or 1, on or off. People talk about twiddling bits, flipping bits, toggling bits, shifting bits, etc. I just want to wobble them a little (bit).</p></li>
      
      </ul>
      `,
});

x00.updateImage(
  new Uint8Array(128).map((d, i) => (i >>> 0) & 0xff),
  32
);
