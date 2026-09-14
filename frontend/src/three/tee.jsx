import * as THREE from "three";

export function createTeeGeometry(detail = 1) {
  const s = new THREE.Shape();
  s.moveTo(-0.34, 1.12);
  s.lineTo(-1.08, 0.8);
  s.lineTo(-1.58, 0.1);
  s.lineTo(-1.27, -0.3);
  s.lineTo(-0.85, 0.12);
  s.lineTo(-0.85, -1.12);
  s.quadraticCurveTo(0, -1.22, 0.85, -1.12);
  s.lineTo(0.85, 0.12);
  s.lineTo(1.27, -0.3);
  s.lineTo(1.58, 0.1);
  s.lineTo(1.08, 0.8);
  s.lineTo(0.34, 1.12);
  s.quadraticCurveTo(0, 1.0, -0.34, 1.12);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.13,
    bevelSegments: Math.max(2, Math.round(6 * detail)),
    curveSegments: Math.max(8, Math.round(20 * detail)),
    steps: 5,
  });
  geo.center();

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const low = 1 - THREE.MathUtils.smoothstep(y, -1.15, 0.7);
    let f =
      0.05 * Math.sin(x * 6.2 + y * 1.6) +
      0.022 * Math.sin(x * 14.0 + 1.7) +
      0.014 * Math.sin(y * 9.0 + x * 3.1);
    f *= 0.3 + 0.7 * low;
    const bulge = 0.05 * Math.cos(x * 0.85) - 0.02;
    const sign = z >= 0 ? 1 : -1;
    pos.setZ(i, z + sign * (f + bulge));
  }
  geo.computeVertexNormals();
  return geo;
}

export function createFabricBump() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 116 + Math.random() * 24;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#5a5a5a";
  for (let y = 0; y < size; y += 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  return tex;
}

export const StudioLights = ({ tint = "#fff6ea" }) => (
  <>
    <ambientLight intensity={0.6} />
    <spotLight position={[4, 5, 6]} angle={0.5} penumbra={1} decay={0} intensity={1.7} color={tint} />
    <spotLight position={[-5, 2, -4]} angle={0.6} penumbra={1} decay={0} intensity={0.9} color="#e6ede4" />
    <directionalLight position={[0, -3, 4]} intensity={0.5} color="#f2ede2" />
  </>
);
