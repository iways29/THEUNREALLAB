"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CREAM = 0xffedd7;
const EMBER = 0xdc5000;
const OBJ_R = 2.05; // outer radius of the formed mark

function makeDotTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * The hero specimen — scattered dust that assembles into the lab's
 * mark (a particle torus with an ember core) as the visitor scrolls.
 * The unreal, becoming real. Scroll-driven, ORYZO-style.
 */
export default function HeroSpecimen({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const ring = ringRef.current;
    if (!host || !ring) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rng = mulberry32(1111);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const dot = makeDotTexture();

    /* targets: a torus (the ring of the mark) + an ember core */
    const N = 2400;
    const CORE = 90;
    const target = new Float32Array(N * 3);
    const scatter = new Float32Array(N * 3);
    const delay = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = rng() * Math.PI * 2;
      const R = 1.6;
      const r = 0.42 * Math.sqrt(rng());
      target[i * 3] = (R + r * Math.cos(phi)) * Math.cos(theta);
      target[i * 3 + 1] = r * Math.sin(phi);
      target[i * 3 + 2] = (R + r * Math.cos(phi)) * Math.sin(theta);

      // dust: a loose sphere filling the hero
      const sr = 4.6 * Math.cbrt(rng());
      const su = rng() * Math.PI * 2;
      const sv = Math.acos(2 * rng() - 1);
      scatter[i * 3] = sr * Math.sin(sv) * Math.cos(su);
      scatter[i * 3 + 1] = sr * Math.sin(sv) * Math.sin(su);
      scatter[i * 3 + 2] = sr * Math.cos(sv);

      delay[i] = rng() * 0.45;
    }
    const pos = new Float32Array(scatter);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: CREAM,
      size: 0.06,
      map: dot,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(pGeo, pMat));

    /* ember core — appears with the form */
    const corePos = new Float32Array(CORE * 3);
    for (let i = 0; i < CORE; i++) {
      corePos[i * 3] = (rng() - 0.5) * 0.5;
      corePos[i * 3 + 1] = (rng() - 0.5) * 0.5;
      corePos[i * 3 + 2] = (rng() - 0.5) * 0.5;
    }
    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute("position", new THREE.BufferAttribute(corePos, 3));
    const cMat = new THREE.PointsMaterial({
      color: EMBER,
      size: 0.1,
      map: dot,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(cGeo, cMat));

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // keep the formed mark inside the on-screen ring on any aspect
      const halfTan = Math.tan((camera.fov * Math.PI) / 360);
      camera.position.set(0, 0, OBJ_R / (0.6 * halfTan * Math.min(1, w / h)));
      pMat.size = camera.position.z * 0.0085;
      cMat.size = camera.position.z * 0.014;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(host);

    const readProgress = () => {
      const sec = sectionRef.current;
      if (!sec) return 1;
      const rect = sec.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (range <= 0) return 1;
      return Math.min(1, Math.max(0, -rect.top / range));
    };

    const clock = new THREE.Clock();
    let lastP = -1;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const p = reduced ? 1 : readProgress();

      if (p !== lastP) {
        for (let i = 0; i < N; i++) {
          const e = smooth((p * 1.4 - delay[i]) / 0.6);
          pos[i * 3] = scatter[i * 3] + (target[i * 3] - scatter[i * 3]) * e;
          pos[i * 3 + 1] =
            scatter[i * 3 + 1] + (target[i * 3 + 1] - scatter[i * 3 + 1]) * e;
          pos[i * 3 + 2] =
            scatter[i * 3 + 2] + (target[i * 3 + 2] - scatter[i * 3 + 2]) * e;
        }
        pGeo.attributes.position.needsUpdate = true;

        const formed = smooth((p - 0.55) / 0.3);
        cMat.opacity = formed;
        ring.style.opacity = String(formed);
        lastP = p;
      }

      group.rotation.y = (reduced ? 0 : t * 0.12) + p * 2.6;
      group.rotation.x = 0.52 - p * 0.18;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      pGeo.dispose();
      cGeo.dispose();
      pMat.dispose();
      cMat.dispose();
      dot.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [sectionRef]);

  return (
    <div ref={hostRef} className="hero-canvas" aria-hidden="true">
      <div ref={ringRef} className="hero-ring">
        <i /><i /><i /><i />
        <span className="hero-ring-caption vA-label">
          Fig. 00 — The unreal, made real
        </span>
      </div>
    </div>
  );
}
