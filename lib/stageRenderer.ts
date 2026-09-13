/**
 * Draws one film frame, cover-fitted, at device resolution.
 *
 * The frames are 1280×720 and land on screens two and a half times that
 * wide, so how they are resampled is most of how sharp the stage looks. The
 * WebGL path samples with a Catmull-Rom kernel and adds a light unsharp mask,
 * which keeps painted edges crisp where bilinear smears them. The 2D path is
 * the fallback when a context cannot be had.
 */
export type StageRenderer = {
  resize(width: number, height: number, dpr: number): void;
  draw(
    base: HTMLImageElement,
    incoming: HTMLImageElement | null,
    mix: number
  ): void;
  dispose(): void;
};

/** Unsharp amount. The frames were already sharpened once at encode. */
const SHARPEN = 0.28;
/** Decoded frames kept on the GPU. */
const TEXTURE_CACHE = 64;

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform float u_mix;
uniform vec2 u_texSize;
uniform vec2 u_scale;
uniform vec2 u_offset;
uniform float u_sharp;

// Catmull-Rom in nine bilinear taps.
vec3 cubic(sampler2D tex, vec2 uv) {
  vec2 samplePos = uv * u_texSize;
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;
  vec2 f = samplePos - texPos1;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 offset12 = w2 / w12;
  vec2 p0 = (texPos1 - 1.0) / u_texSize;
  vec2 p3 = (texPos1 + 2.0) / u_texSize;
  vec2 p12 = (texPos1 + offset12) / u_texSize;
  vec3 r = vec3(0.0);
  r += texture2D(tex, vec2(p0.x, p0.y)).rgb * w0.x * w0.y;
  r += texture2D(tex, vec2(p12.x, p0.y)).rgb * w12.x * w0.y;
  r += texture2D(tex, vec2(p3.x, p0.y)).rgb * w3.x * w0.y;
  r += texture2D(tex, vec2(p0.x, p12.y)).rgb * w0.x * w12.y;
  r += texture2D(tex, vec2(p12.x, p12.y)).rgb * w12.x * w12.y;
  r += texture2D(tex, vec2(p3.x, p12.y)).rgb * w3.x * w12.y;
  r += texture2D(tex, vec2(p0.x, p3.y)).rgb * w0.x * w3.y;
  r += texture2D(tex, vec2(p12.x, p3.y)).rgb * w12.x * w3.y;
  r += texture2D(tex, vec2(p3.x, p3.y)).rgb * w3.x * w3.y;
  return r;
}

vec3 sharpened(sampler2D tex, vec2 uv) {
  vec3 c = cubic(tex, uv);
  vec2 px = 1.0 / u_texSize;
  vec3 blur = (texture2D(tex, uv + vec2(-px.x, -px.y)).rgb
             + texture2D(tex, uv + vec2( px.x, -px.y)).rgb
             + texture2D(tex, uv + vec2(-px.x,  px.y)).rgb
             + texture2D(tex, uv + vec2( px.x,  px.y)).rgb) * 0.25;
  return c + (c - blur) * u_sharp;
}

void main() {
  vec2 uv = v_uv * u_scale + u_offset;
  vec3 col = sharpened(u_tex0, uv);
  if (u_mix > 0.0) col = mix(col, sharpened(u_tex1, uv), u_mix);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export function createStageRenderer(
  canvas: HTMLCanvasElement
): StageRenderer | null {
  return createGL(canvas) ?? create2D(canvas);
}

function createGL(canvas: HTMLCanvasElement): StageRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  let program: WebGLProgram | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let lost = false;
  let width = 0;
  let height = 0;
  let dpr = 1;
  const textures = new Map<HTMLImageElement, WebGLTexture>();

  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const init = (): boolean => {
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    uniforms = {};
    for (const name of [
      "u_tex0",
      "u_tex1",
      "u_mix",
      "u_texSize",
      "u_scale",
      "u_offset",
      "u_sharp",
    ]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    gl.uniform1i(uniforms.u_tex0, 0);
    gl.uniform1i(uniforms.u_tex1, 1);
    gl.uniform1f(uniforms.u_sharp, SHARPEN);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    textures.clear();
    return true;
  };

  if (!init()) return null;

  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    textures.clear();
  };
  const onRestored = () => {
    if (init()) {
      lost = false;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  const texture = (img: HTMLImageElement): WebGLTexture | null => {
    const hit = textures.get(img);
    if (hit) {
      // Re-insert so the map stays ordered by last use.
      textures.delete(img);
      textures.set(img, hit);
      return hit;
    }
    const tex = gl.createTexture();
    if (!tex) return null;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    textures.set(img, tex);
    if (textures.size > TEXTURE_CACHE) {
      const oldest = textures.keys().next().value as HTMLImageElement;
      const old = textures.get(oldest);
      if (old) gl.deleteTexture(old);
      textures.delete(oldest);
    }
    return tex;
  };

  return {
    resize(w, h, ratio) {
      width = w;
      height = h;
      dpr = ratio;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(base, incoming, mix) {
      if (lost || !program) return;
      const t0 = texture(base);
      if (!t0) return;
      const t1 = incoming && mix > 0 ? texture(incoming) : t0;

      const ir = base.naturalWidth / base.naturalHeight;
      const cr = width / height;
      let sx = 1;
      let sy = 1;
      if (ir > cr) sx = cr / ir;
      else sy = ir / cr;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, t1 ?? t0);
      gl.uniform1f(uniforms.u_mix, t1 && t1 !== t0 ? mix : 0);
      gl.uniform2f(uniforms.u_texSize, base.naturalWidth, base.naturalHeight);
      gl.uniform2f(uniforms.u_scale, sx, sy);
      gl.uniform2f(uniforms.u_offset, (1 - sx) / 2, (1 - sy) / 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      textures.forEach((tex) => gl.deleteTexture(tex));
      textures.clear();
      if (program) gl.deleteProgram(program);
      program = null;
    },
  };
}

function create2D(canvas: HTMLCanvasElement): StageRenderer | null {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;
  let width = 0;
  let height = 0;

  const cover = (img: HTMLImageElement, alpha: number) => {
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = width / height;
    let dw: number;
    let dh: number;
    if (ir > cr) {
      dh = height;
      dw = height * ir;
    } else {
      dw = width;
      dh = width / ir;
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  };

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    },
    draw(base, incoming, mix) {
      ctx.fillStyle = "#100c08";
      ctx.fillRect(0, 0, width, height);
      cover(base, 1);
      if (incoming && mix > 0) cover(incoming, mix);
    },
    dispose() {},
  };
}
