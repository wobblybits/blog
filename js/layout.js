/** @format */

new Uint8Array(64)
  .map((d, i) => i)
  .reduce(
    (agg, d) =>
      agg +
      String.fromCharCode(
        d > 25
          ? d > 51
            ? d > 61
              ? d == 62
                ? 43
                : 47
              : d - 4
            : d + 71
          : d + 65
      ),
    ""
  );

function init() {
  let page =
    window.location && window.location.hash
      ? window.location.hash.slice(1)
      : getAnchor();
  if (page === "archive") {
    fillHome();
  } else if (page == "tags") {
    fillHome();
  } else if (page) {
    Promise.resolve(fillPage(page));
  } else {
    fillHome();
  }
}

function getAnchor() {
  var currentUrl = document.URL,
    urlParts = currentUrl.split("#");
  return urlParts.length > 1 ? urlParts[1] : null;
}

function fillLayout() {
  fillHeader();
  fillFooter();
}

async function fillPage(page) {
  const exists = await checkFileExists(`${getBaseUrl()}/pages/${page}.js`);
  if (!exists) {
    fillHome();
  } else {
    fillHeader();
    document.body.classList.add("page");
    const main = document.querySelector("main");
    main.append(getFeature(page));
    fillFooter(parseInt("0" + page, 16));
    window.scrollTo(0, 10);
  }
}

function fillHome() {
  fillHeader();
  document.body.classList.add("home");
  const main = document.querySelector("main");
  Promise.resolve(getArticleArchive(0, -1)).then((articles) => {
    main.prepend(...articles);
    fillFooter();
  });
}

function getBaseUrl() {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "/wobblybits";
  }
  return "";
}

function postCallback(article, opts) {
  const isPage = article.classList.contains("page");

  if (isPage) {
    if (opts.title) {
      document.title += " // " + opts.title;
    }
  }

  Object.keys(opts).forEach((opt) => {
    const matches = article.getElementsByClassName(opt);
    for (var i = 0; i < matches.length; i++) {
      matches[i].innerHTML = opts[opt] + matches[i].innerHTML;
    }
  });

  const image = article.querySelector("img.cover");
  const title = article.querySelector(".title");
  const feature = article.querySelector(".feature");
  const teaser = article.querySelector(".teaser");
  const citations = article.querySelector("#citations");

  image.onload = () => {
    if (false && "setTime" in image.attributes && image.attributes.setTime) {
      console.log(
        article.id,
        "image update:",
        (performance.now() - image.attributes.setTime).toFixed(2) + "ms"
      );
    }
  };

  article.onIntersecting = () => {
    const play = article.querySelector("#" + article.id.slice(0, 3) + "-play");
    if (play && !play.isPlaying) {
      play.click({ intersecting: true });
      play.isPlaying = true;
    }
  };
  article.onNotIntersecting = () => {
    const play = article.querySelector("#" + article.id.slice(0, 3) + "-play");
    if (play && play.isPlaying) {
      play.click({ intersecting: false });
      play.isPlaying = false;
    }
  };
  observer.observe(article);

  if (citations) {
    if (!opts.citations) {
      citations.remove();
    } else {
      for (var i = 0; i < opts.citations.length; i++) {
        const citation = document.createElement("p");
        const link = document.createElement("a");
        link.href = opts.citations[i].url;
        link.innerHTML = opts.citations[i].title;
        citation.append(link);
        citation.innerHTML += opts.citations[i].source
          ? " <small>[" + opts.citations[i].source + "]</small>"
          : "";
        citations.append(citation);
      }
    }
  }
  const collapsible = article.getElementsByClassName("list-head");
  for (var i = 0; i < collapsible.length; i++) {
    const head = collapsible[i];
    const item = head.parentElement;
    head.onclick = (e) => {
      e.preventDefault();
      if (item.isExpanded) {
        item.classList = null;
        item.isExpanded = false;
      } else {
        item.classList = ["expanded"];
        item.isExpanded = true;
      }
    };
  }

  return { image, title, feature, teaser };
}

function getFeature(hex) {
  const article = document.createElement("article");
  article.classList.add("page");
  article.id = hex + "-article";
  article.innerHTML = `
    <a class="title"></a>
    <div class="vitrine"><img class="cover" alt="A 1-bit BMP dataUri." /></div>
    <div class="feature"><ul><li id="citations"><strong class="list-head">Citations</strong></li></ul></div>
  `;
  const script = document.createElement("script");
  script.src = `${getBaseUrl()}/pages/${hex}.js?v=${Date.now()}`;
  article.append(script);

  return article;
}

async function checkFileExists(path) {
  const { ok } = await fetch(path + "?v=" + Date.now(), { method: "HEAD" });
  return ok;
}

async function getArchiveArticle(i) {
  const hex = "x" + i.toString(16).padStart(2, "0");
  // const exists = await checkFileExists(`${getBaseUrl()}/pages/${hex}.js`);
  // if (!exists) {
  //   return false;
  // }
  const article = document.createElement("article");
  const binary = "0b" + i.toString(2).padStart(8, "0");
  article.classList.add("archive");
  article.id = hex + "-article";
  article.innerHTML = `
    <a class="title" href="${getBaseUrl()}?v=${Date.now()}#${hex}"></a>
    <div class="description">
    <div class="vitrine">
      <img class="cover" alt="A 1-bit BMP dataUri." />
      </div>
        <p class="teaser">
        </p>
        <a class="more" href="${getBaseUrl()}?v=${Date.now()}#${hex}">\u25B6 more</a>
    </div>
    <p class="number">${binary}</p>
  `;
  const script = document.createElement("script");
  script.src = `${getBaseUrl()}/pages/${hex}.js?v=${Date.now()}`;
  article.append(script);
  return article;
}

// async function getArticleArchive(start, count) {
//   const articles = [];
//   for (let i = start; i < start + count || count == -1; i++) {
//     const article = await getArchiveArticle(i);
//     if (article) {
//       articles.unshift(article);
//     } else {
//       break;
//     }
//   }
//   return articles;
// }

async function getArticleArchive(start, count) {
  const articles = [];
  const promises = [];
  for (let i = start; i < start + count || count == -1; i++) {
    const exists = await checkFileExists(
      `${getBaseUrl()}/pages/x${i.toString(16).padStart(2, "0")}.js`
    );
    if (!exists) {
      break;
    } else {
      promises.push(getArchiveArticle(i));
    }
  }
  await Promise.all(promises).then((results) => {
    results.forEach((article) => {
      if (article) {
        articles.unshift(article);
      }
    });
  });
  return articles;
}

function createNav() {
  const nav = document.createElement("nav");
  nav.innerHTML = `
      <a href="${getBaseUrl()}/?v=${Date.now()}#x00">about</a>
  `;
  // nav.innerHTML += `
  //     <a href="">patreon</a>
  //     <a href="https://github.com/wobblybits/">github</a>
  // `;
  return nav;
}

function createPageNav(index) {
  const nav = document.createElement("nav");
  nav.innerHTML = `
      <a href="${getBaseUrl()}/?v=${Date.now()}#x${(index - 1)
    .toString(16)
    .padStart(2, "0")}">older</a>
      <a href="${getBaseUrl()}/?v=${Date.now()}#x${(index + 1)
    .toString(16)
    .padStart(2, "0")}">newer</a>
  `;
  return nav;
}

function createLogo(type = "text-square") {
  if (type == "image") {
    const logo = document.createElement("img");
    logo.src = `${getBaseUrl()}/wobblybits_sm.png`;
    logo.alt = "Wobbly Bits Blog";
    return logo;
  } else if (type == "text-square") {
    const textLogo = document.createElement("div");
    textLogo.classList.add("text-logo");
    textLogo.classList.add("text-logo-square");
    textLogo.innerHTML = "<span>w0b</span><span>bly</span><span>bits</span>";
    return textLogo;
  } else if (type == "text-line") {
    const textLogo = document.createElement("div");
    textLogo.classList.add("text-logo");
    textLogo.classList.add("text-logo-line");
    textLogo.innerHTML = "<span>w0b</span><span>bly</span><span>bits</span>";
    return textLogo;
  }
}

function fillHeader() {
  const header = document.querySelector("header");
  const homeLink = document.createElement("a");
  homeLink.href = getBaseUrl() + "/?v=" + Date.now();
  homeLink.append(createLogo());
  header.append(homeLink, createNav());
}

function createAttributions() {
  const attributions = document.createElement("div");
  attributions.classList.add("attributions");
  attributions.innerHTML = `
  TI Pro Font from <a href="https://int10h.org/oldschool-pc-fonts/fontlist/?4#ti">Old School PC Fonts</a><br>
  Icons from <a href="https://pixeliconlibrary.com">Pixel Icon Library</a> by <a href="https://hackernoon.com">HackerNoon</a>
  `;
  return attributions;
}

function fillFooter(index = -1) {
  const footer = document.querySelector("footer");
  footer.append(createAttributions());
  if (index == -1) {
    footer.append(createNav());
  } else {
    footer.append(createPageNav(index));
  }
}

const WobblyBit = function (id, content) {
  var _this = {
    id: id,
    article: document.querySelector(`#${id}-article`),
    content: {
      title: "Title",
      teaser: "Teaser",
      feature: "Feature",
      ...content,
    },
    bitwidth: 32,
  };
  _this.elements = postCallback(_this.article, _this.content);
  _this.visual = null;
  _this.updateImage = (buffer, width) => {
    _this.elements.image.attributes.setTime = performance.now();
    _this.visual = new OneBitBmp(buffer, width);
    _this.elements.image.src = _this.visual.dataUri;
    _this.scale = (_this.elements.image.offsetWidth - 2) / width;
  };
  _this.stop = () => {
    const play = document.getElementById(`${_this.id}-play`);
    play.innerHTML = "\uf276";
    play.title = "Play";
    play.isPlaying = false;
    window.clearInterval(_this.animation);
    _this.animation = false;
  };
  _this.optionController = (
    name,
    values,
    changeFn = (value, index) => value,
    doRender = true
  ) => {
    _this.indexes = _this.indexes || {};
    _this.indexes[name] = _this.indexes[name] || 0;
    _this.values = _this.values || {};
    _this.values[name] = _this.values[name] || values;
    const id = name ? name.replace(/\s+/g, "-").toLowerCase() : undefined;
    return {
      label: changeFn(
        _this.values[name][_this.indexes[name]],
        _this.indexes[name]
      ),
      id: `${_this.id}-${id}`,
      alt: name,
      onClick: () => {
        const option = document.getElementById(`${_this.id}-${id}`);
        _this.indexes[name] =
          (_this.indexes[name] + 1) % _this.values[name].length;
        option.innerHTML = changeFn(
          _this.values[name][_this.indexes[name]],
          _this.indexes[name]
        );
        if (!_this.animation && doRender) {
          _this.frameFn();
        }
      },
    };
  };
  _this.playController = (playFn, pauseFn, frameFn, interval = 20) => {
    _this.playFn = playFn;
    _this.pauseFn = pauseFn;
    _this.frameFn = frameFn;
    _this.frameInterval = interval;
    return {
      label: "\uf276",
      id: `${_this.id}-play`,
      classList: ["icon"],
      alt: "Play",
      onClick: () => {
        if (_this.animation) {
          _this.stop();
          pauseFn();
        } else {
          _this.start();
        }
      },
    };
  };
  _this.start = () => {
    if (!_this.animation) {
      const play = document.getElementById(`${_this.id}-play`);
      if (_this.playFn && _this.playFn()) {
        play.innerHTML = "\uf26c";
        play.title = "Pause";
        play.isPlaying = true;
        _this.animation = window.setInterval(() => {
          _this.frameFn();
        }, _this.frameInterval);
      } else {
        _this.stop();
        _this.pauseFn();
      }
    }
  };
  _this.__defineGetter__("height", () => _this.visual.height);
  _this.__defineSetter__("buffer", (buffer) => {
    if (buffer.length % _this.width === 0) {
      _this.updateImage(buffer, _this.width);
    } else {
      console.error("width must be a multiple of the buffer length");
    }
  });
  _this.__defineSetter__("width", (width) => {
    if (_this.visual.buffer % width === 0) {
      _this.updateImage(_this.buffer, width);
    } else {
      console.error("width must be a multiple of the buffer length");
    }
  });
  _this.__defineGetter__("toolbar", () => {
    return _this.elements.toolbar;
  });
  _this.__defineSetter__("toolbar", (tools) => {
    if (!_this.elements.toolbar) {
      _this.elements.toolbar = document.createElement("div");
      _this.elements.toolbar.classList.add("toolbar");
      _this.article.append(_this.elements.toolbar);
    }
    _this.elements.toolbar.innerHTML = "";
    tools.forEach((item) => {
      let new_item = null;
      if (typeof item.onClick === "function") {
        new_item = document.createElement("button");
        new_item.innerHTML = item.label;
        new_item.addEventListener("click", item.onClick);
        _this.elements.toolbar.append(new_item);
      } else {
        new_item = document.createElement("span");
        new_item.innerHTML = item.label;
      }
      if (item.id) {
        new_item.id = item.id;
      }
      if (item.classList) {
        item.classList.forEach((cls) => {
          new_item.classList.add(cls);
        });
      }
      if (item.alt) {
        new_item.title = item.alt;
      }
      _this.elements.toolbar.append(new_item);
    });
  });
  _this.getPixelUV = (u, v) => {
    return _this.getPixel(
      Math.round(u * _this.elements.image.offsetWidth),
      Math.round(v * _this.elements.image.offsetHeight)
    );
  };
  _this.changePixelUV = (u, v, fn) => {
    _this.changePixel(
      Math.round(u * _this.elements.image.offsetWidth),
      Math.round(v * _this.elements.image.offsetHeight),
      fn
    );
  };
  _this.getPixel = (x, y) => {
    _this.scale = _this.elements.image.offsetWidth / _this.bitwidth;
    const px = Math.floor(x / _this.scale);
    const py = Math.floor(
      y / (_this.elements.image.offsetHeight / _this.bitwidth)
    );
    return _this.visual.getPixel(px, py);
  };
  _this.changePixel = (x, y, fn, cleanup = false) => {
    _this.scale = _this.elements.image.offsetWidth / _this.bitwidth;
    const px = Math.floor(x / _this.scale);
    const py = Math.floor(
      y / (_this.elements.image.offsetHeight / _this.bitwidth)
    );
    let needs_redraw = false;
    if (cleanup) {
      if (
        _this.data.prev_pixel &&
        (_this.data.prev_pixel.x != px || _this.data.prev_pixel.y != py)
      ) {
        _this.visual.changePixel(
          _this.data.prev_pixel.x,
          _this.data.prev_pixel.y,
          fn
        );
        needs_redraw = true;
      }
    } else {
      needs_redraw = true;
    }
    if (_this.data && _this.data.prev_pixel) {
      _this.data.prev_pixel = { x: px, y: py };
    }
    if (needs_redraw) {
      _this.elements.image.attributes.setTime = performance.now();
      const new_uri = _this.visual.changePixel(px, py, fn);
      if (new_uri !== _this.elements.image.src) {
        _this.elements.image.src = new_uri;
      }
      return new_uri;
    }
    return _this.visual.dataUri;
  };
  _this.computeGPU = (shader, input, output) => {
    if (!_this._gpu) {
      if (!navigator.gpu) {
        throw Error("WebGPU not supported.");
      }

      Promise.resolve(navigator.gpu.requestAdapter())
        .then((adapter) => {
          if (!adapter) {
            throw Error("Couldn't request WebGPU adapter.");
          }
          _this._gpu = { adapter };
          return adapter.requestDevice();
        })
        .then((device) => {
          _this._gpu.device = device;
          device.addEventListener("uncapturederror", (event) =>
            console.log(_this.timer, event.error.message)
          );
          // _this._gpu.canvas = new OffscreenCanvas(
          //   _this.bitwidth,
          //   _this.bitwidth
          // );
          // _this._gpu.context = _this._gpu.canvas.getContext("webgpu");
          // _this._gpu.context.configure({
          //   device: _this._gpu.device,
          //   format: navigator.gpu.getPreferredCanvasFormat(),
          //   alphaMode: "premultiplied",
          // });
          _this._gpu.shaderModule = _this._gpu.device.createShaderModule({
            code: shader,
          });
          const outputBuffer = _this._gpu.device.createBuffer({
            size: output.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
          });
          const stagingBuffer = _this._gpu.device.createBuffer({
            size: output.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
          });
          _this._gpu.params = _this._gpu.device.createBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
          });
          _this._gpu.device.queue.writeBuffer(_this._gpu.params, 0, input);
          const bindGroupLayout = _this._gpu.device.createBindGroupLayout({
            entries: [
              {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: "storage" },
              },
              {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: "uniform" },
              },
            ],
          });
          const bindGroup = _this._gpu.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
              { binding: 0, resource: { buffer: outputBuffer } },
              { binding: 1, resource: { buffer: _this._gpu.params } },
            ],
          });
          _this._gpu.pipeline = _this._gpu.device.createComputePipeline({
            compute: {
              module: _this._gpu.shaderModule,
              entryPoint: "main",
            },
            layout: _this._gpu.device.createPipelineLayout({
              bindGroupLayouts: [bindGroupLayout],
            }),
          });
          // _this._gpu.device.queue.writeBuffer(_this._gpu.params, 0, input);
          const bundleEncoder = _this._gpu.device.createRenderBundleEncoder({
            colorFormats: ["bgra8unorm"],
            depthStencilFormat: "depth24plus",
          });
          _this._gpu.render = (render_params, render_output) => {
            if (stagingBuffer.mapState != "unmapped") {
              return false;
            }
            const stageParams = _this._gpu.device.createBuffer({
              size: render_params.byteLength,
              usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
              mappedAtCreation: true,
            });
            const stageParamsArray = new Float32Array(
              stageParams.getMappedRange(0, render_params.byteLength)
            );
            stageParamsArray.set(render_params);
            stageParams.unmap();

            const commandEncoder = _this._gpu.device.createCommandEncoder();
            commandEncoder.copyBufferToBuffer(
              stageParams,
              0,
              _this._gpu.params,
              0,
              render_params.byteLength
            );
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(_this._gpu.pipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.dispatchWorkgroups(render_output.byteLength / 64);
            passEncoder.end();
            commandEncoder.copyBufferToBuffer(
              outputBuffer,
              0,
              stagingBuffer,
              0,
              output.byteLength
            );
            _this._gpu.device.queue.submit([commandEncoder.finish()]);
            try {
              Promise.resolve(
                stagingBuffer.mapAsync(GPUMapMode.READ, 0, output.byteLength)
              ).then(() => {
                const copyArrayBuffer = stagingBuffer.getMappedRange(
                  0,
                  output.byteLength
                );
                // console.log(stagingBuffer);
                // console.log(copyArrayBuffer);
                const outputArray = new Uint32Array(copyArrayBuffer);
                output.set(outputArray);
                // console.log(output);
                stagingBuffer.unmap();
              });
            } catch (e) {
              console.log(_this.timer, e);
              stagingBuffer.unmap();
            }
          };
          _this._gpu.render(input, output);
        });
    } else {
      _this._gpu.render(input, output);
    }
  };
  _this.computeGL = (code, input, output) => {
    if (!_this._gl) {
      _this._canvas = new OffscreenCanvas(_this.bitwidth, _this.bitwidth);
      _this._gl = _this._canvas.getContext("webgl2-compute");
    }
    _this.computeShader = _this._gl.createShader(_this._gl.COMPUTE_SHADER);
    _this._gl.shaderSource(_this.computeShader, code);
    _this._gl.compileShader(_this.computeShader);
    if (
      !_this._gl.getShaderParameter(
        _this.computeShader,
        _this._gl.COMPILE_STATUS
      )
    ) {
      console.error(_this._gl.getShaderInfoLog(_this.computeShader));
      return;
    }
    _this.computeProgram = _this._gl.createProgram();
    _this._gl.attachShader(_this.computeProgram, _this.computeShader);
    _this._gl.linkProgram(_this.computeProgram);
    if (
      !_this._gl.getProgramParameter(
        _this.computeProgram,
        _this._gl.LINK_STATUS
      )
    ) {
      console.error(_this._gl.getProgramInfoLog(_this.computeProgram));
      return;
    }

    _this.computeSSBO = _this._gl.createBuffer();
    _this._gl.bindBuffer(_this._gl.SHADER_STORAGE_BUFFER, _this.computeSSBO);
    _this._gl.bufferData(
      _this._gl.SHADER_STORAGE_BUFFER,
      input,
      _this._gl.DYNAMIC_COPY
    );
    _this._gl.bindBufferBase(
      _this._gl.SHADER_STORAGE_BUFFER,
      0,
      _this.computeSSBO
    );

    _this._gl.useProgram(_this.computeProgram);
    _this._gl.dispatchCompute(1, 1, 1);

    _this._gl.getBufferSubData(_this._gl.SHADER_STORAGE_BUFFER, 0, output);
    return output;
  };
  return _this;
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.onIntersecting();
      } else {
        entry.target.onNotIntersecting();
      }
    });
  },
  { threshold: 0.7 }
);
