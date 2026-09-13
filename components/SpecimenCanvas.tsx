"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Variant = "tree" | "graph";

const CREAM = 0xffedd7;
const EMBER = 0xdc5000;

/* round sprite so points render as soft dots, not squares */
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

/* ── Mumba: a conversation tree — root message at the TOP,
      every branch cascading downward, the way conversation flows ── */
function buildTree(rng: () => number) {
  const nodes: THREE.Vector3[] = [];
  const edges: { a: THREE.Vector3; b: THREE.Vector3 }[] = [];
  const root = new THREE.Vector3(0, 2.2, 0);
  nodes.push(root);

  /* rotate dir away from itself by angle, around a random azimuth —
     wide forks make a canopy instead of a streak */
  const fork = (dir: THREE.Vector3, angle: number) => {
    const perp = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5)
      .cross(dir)
      .normalize();
    return dir.clone().applyAxisAngle(perp, angle).normalize();
  };

  const grow = (pos: THREE.Vector3, dir: THREE.Vector3, depth: number) => {
    if (depth > 7 || nodes.length > 460) return;
    const len = 1.1 * Math.pow(0.84, depth);
    const end = pos.clone().addScaledVector(dir, len);
    nodes.push(end);
    edges.push({ a: pos, b: end });

    const kids =
      depth === 0 ? 1 : depth === 1 ? 4 : rng() < (depth < 4 ? 0.9 : 0.6) ? 2 : 1;
    for (let k = 0; k < kids; k++) {
      const spread = kids === 1 ? 0.25 : 0.5 + rng() * 0.55; // 28°–60° forks
      const nd = fork(dir, spread);
      nd.y = -(Math.abs(nd.y) * 0.7 + 0.4); // always descending — replies flow down
      grow(end, nd.normalize(), depth + 1);
    }
  };
  grow(root, new THREE.Vector3(0, -1, 0), 0);
  return { nodes, edges };
}

/* ── ASHVAA: a dependency lattice, one finding ─────────────── */
function buildGraph(rng: () => number) {
  const centers = [
    new THREE.Vector3(1.5, 0.9, 0.4),
    new THREE.Vector3(-1.5, 0.6, -0.7),
    new THREE.Vector3(0.2, -1.3, 1.2),
    new THREE.Vector3(-0.4, -0.4, -1.6),
  ];
  const nodes: THREE.Vector3[] = [];
  const clusterOf: number[] = [];
  centers.forEach((c, ci) => {
    for (let i = 0; i < 22; i++) {
      nodes.push(
        c
          .clone()
          .add(
            new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(1.7)
          )
      );
      clusterOf.push(ci);
    }
  });

  const edges: { a: THREE.Vector3; b: THREE.Vector3 }[] = [];
  // each node → its 2 nearest siblings in the same cluster
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: n.distanceTo(m) }))
      .filter(({ j }) => j !== i && clusterOf[j] === clusterOf[i])
      .sort((x, y) => x.d - y.d)
      .slice(0, 3);
    near.forEach(({ j }) => {
      if (i < j) edges.push({ a: nodes[i], b: nodes[j] });
    });
  });
  // a few cross-cluster imports
  for (let k = 0; k < 16; k++) {
    const i = Math.floor(rng() * nodes.length);
    const j = Math.floor(rng() * nodes.length);
    if (i !== j && clusterOf[i] !== clusterOf[j]) edges.push({ a: nodes[i], b: nodes[j] });
  }
  const emberIndex = Math.floor(nodes.length * 0.62);
  return { nodes, edges, emberIndex };
}

/* seeded rng so the specimen is the same object on every visit */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function SpecimenCanvas({ variant }: { variant: Variant }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rng = mulberry32(variant === "tree" ? 1729 : 4104);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const dot = makeDotTexture();
    const { nodes, edges, emberIndex } =
      variant === "tree"
        ? { ...buildTree(rng), emberIndex: -1 }
        : buildGraph(rng);

    // points
    const pts = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => n.toArray(pts, i * 3));
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    const pMat = new THREE.PointsMaterial({
      color: CREAM,
      size: variant === "tree" ? 0.075 : 0.09,
      map: dot,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(pGeo, pMat));

    // edges
    const ln = new Float32Array(edges.length * 6);
    edges.forEach((e, i) => {
      e.a.toArray(ln, i * 6);
      e.b.toArray(ln, i * 6 + 3);
    });
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(ln, 3));
    const lMat = new THREE.LineBasicMaterial({
      color: CREAM,
      transparent: true,
      opacity: 0.22,
    });
    const lines = new THREE.LineSegments(lGeo, lMat);
    group.add(lines);

    // the one ember node — the finding
    let emberMat: THREE.PointsMaterial | null = null;
    if (emberIndex >= 0) {
      const eGeo = new THREE.BufferGeometry();
      eGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(nodes[emberIndex].toArray()), 3)
      );
      emberMat = new THREE.PointsMaterial({
        color: EMBER,
        size: 0.22,
        map: dot,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
      });
      group.add(new THREE.Points(eGeo, emberMat));
    }

    // center the object and fit the camera so it sits inside the ring
    const box = new THREE.Box3().setFromPoints(nodes);
    const center = box.getCenter(new THREE.Vector3());
    group.children.forEach((c) => c.position.sub(center));
    let radius = 0;
    nodes.forEach((n) => {
      radius = Math.max(radius, n.distanceTo(center));
    });
    // distance such that even the NEAREST point (camera-side, while
    // rotating) projects within ~92% of the half-frame — large, in focus,
    // grazing the inside of the registration ring
    const halfFov = Math.tan((camera.fov * Math.PI) / 360);
    const fitDist = radius * (1 + 1 / (halfFov * 0.92));
    camera.position.set(0, 0, fitDist);
    pMat.size = radius * (variant === "tree" ? 0.032 : 0.042);
    const emberBase = radius * 0.085;
    if (emberMat) emberMat.size = emberBase;

    // growth reveal via drawRange (tree grows, graph resolves)
    let grown = reduced ? 1 : 0;
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    io.observe(host);

    // drag to rotate
    let targetRY = 0;
    let targetRX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      host.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetRY += (e.clientX - lastX) * 0.006;
      targetRX = Math.max(-0.3, Math.min(0.3, targetRX + (e.clientY - lastY) * 0.003));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => (dragging = false);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    // resize
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const applyGrowth = (g: number) => {
      const eased = 1 - Math.pow(1 - g, 3);
      pGeo.setDrawRange(0, Math.floor(eased * nodes.length));
      lGeo.setDrawRange(0, Math.floor(eased * edges.length) * 2);
    };
    applyGrowth(grown);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;

      if (grown < 1) {
        grown = Math.min(1, grown + dt / 2.4);
        applyGrowth(grown);
      }
      if (!reduced && !dragging) {
        targetRY += dt * 0.1;
        targetRX += (0 - targetRX) * 0.02; // settle back to level
      }

      // scroll-coupled: the specimen turns as the section travels the
      // viewport, and zooms in toward center-stage, out at the edges
      let scrollP = 0.5;
      if (!reduced) {
        const rect = host.getBoundingClientRect();
        const vh = window.innerHeight;
        scrollP = Math.min(
          1,
          Math.max(0, (vh - rect.top) / (vh + rect.height))
        );
      }
      const stage = Math.sin(scrollP * Math.PI); // 0 at edges, 1 center
      const zoom = 0.82 + stage * 0.24;
      group.scale.setScalar(zoom);

      group.rotation.y +=
        (targetRY + (scrollP - 0.5) * 1.6 - group.rotation.y) * 0.08;
      group.rotation.x += (targetRX - group.rotation.x) * 0.08;

      if (emberMat) {
        emberMat.size = emberBase * (1 + Math.sin(clock.elapsedTime * 2.2) * 0.25);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      pGeo.dispose();
      lGeo.dispose();
      pMat.dispose();
      lMat.dispose();
      emberMat?.dispose();
      dot.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [variant]);

  return <div ref={hostRef} className="specimen-canvas" aria-hidden="true" />;
}
