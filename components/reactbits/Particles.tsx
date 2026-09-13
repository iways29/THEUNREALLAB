"use client";

/**
 * Adapted from ReactBits <Particles> (reactbits.dev/r/Particles-TS-CSS).
 *
 * Gold dust hanging in the air between the painting and the type. WebGL
 * points via OGL; each mote drifts on its own sine and the whole field
 * slides with scroll, so it reads as a layer at a different depth from both
 * the stage and the copy. It does not follow the pointer: nothing on the
 * page does.
 */

import { useEffect, useRef } from "react";
import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  /** World units the field slides across the full page of scroll. */
  scrollTravel?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace(/^#/, "");
  const int = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  varying vec4 vRandom;
  varying vec3 vColor;
  void main() {
    vRandom = random;
    vColor = color;
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w) + t * 0.08 * random.z;
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec4 vRandom;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    float circle = smoothstep(0.5, 0.18, d);
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.5 + vRandom.y * 2.0) + vRandom.z * 6.28);
    gl_FragColor = vec4(vColor, circle * twinkle * 0.85);
  }
`;

export default function Particles({
  particleCount = 110,
  particleSpread = 10,
  speed = 0.08,
  particleColors = ["#e6c76a", "#f4efe4", "#d9a441", "#e6c76a"],
  particleBaseSize = 70,
  sizeRandomness = 1.2,
  cameraDistance = 20,
  scrollTravel = 2.4,
  className = "",
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const count = window.innerWidth < 768 ? Math.round(particleCount * 0.4) : particleCount;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr, depth: false, alpha: true });
    } catch {
      return;
    }
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number, len: number;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      colors.set(hexToRgb(particleColors[Math.floor(Math.random() * particleColors.length)]), i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * dpr },
        uSizeRandomness: { value: sizeRandomness },
      },
      transparent: true,
      depthTest: false,
    });
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const update = (t: number) => {
      raf = requestAnimationFrame(update);
      const delta = Math.min(t - last, 64);
      last = t;
      elapsed += delta * speed;
      program.uniforms.uTime.value = elapsed * 0.001;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const sp = max > 0 ? window.scrollY / max : 0;

      particles.position.y = (sp - 0.5) * scrollTravel;
      particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
      particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      particles.rotation.z += 0.004 * speed;

      renderer.render({ scene: particles, camera });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    scrollTravel,
  ]);

  return <div ref={containerRef} className={`particles ${className}`} aria-hidden="true" />;
}
