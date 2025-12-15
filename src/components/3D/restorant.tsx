import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

type InitOptions = {
  onEnter?: () => void;
  onExit?: () => void;
};

const initRestorant3D = (options: InitOptions = {}) => {
  const { onEnter, onExit } = options;

  /* ------------------------
   * BASIC SETUP
   * ------------------------ */
  const canvas = document.querySelector(
    "canvas.restorant-3D"
  ) as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const camera = new THREE.PerspectiveCamera(80, size.width / size.height, 0.1, 200);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  window.addEventListener("resize", () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
  });

  /* ------------------------
   * LIGHTS
   * ------------------------ */
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const dir = new THREE.DirectionalLight(0xffffff, 2);
  dir.position.set(5, 10, 5);
  scene.add(dir);

  /* ------------------------
   * CAMERA POSITIONS
   * ------------------------ */
  const cameraPositions = [
    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } },
    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } },
    { pos: new THREE.Vector3(-3.3, 3.5, -34), rot: { x: 0, y: 180, z: 0 } },
    { pos: new THREE.Vector3(-0.5, 3.5, -36), rot: { x: 0, y: 175, z: 0 } },
    { pos: new THREE.Vector3(3.5, 3.5, -34), rot: { x: 0, y: 150, z: 0 } },
    { pos: new THREE.Vector3(2, 1.5, -31), rot: { x: 0, y: 165, z: 0 } },
    { pos: new THREE.Vector3(-1, 1.5, -31), rot: { x: 0, y: 165, z: 0 } },
    { pos: new THREE.Vector3(-7.5, 1.5, -26.8), rot: { x: 0, y: 240, z: 0 } },
    { pos: new THREE.Vector3(-8, 1.5, -23), rot: { x: 0, y: 270, z: 0 } },
    { pos: new THREE.Vector3(-8, 1.5, -17), rot: { x: 0, y: 270, z: 0 } },
    { pos: new THREE.Vector3(-8, 1.5, -13), rot: { x: 0, y: 310, z: 0 } },
    { pos: new THREE.Vector3(1.2, 1.5, -15), rot: { x: 0, y: 35, z: 0 } },
    { pos: new THREE.Vector3(-1, 1.5, -15), rot: { x: 0, y: 10, z: 0 } },
    { pos: new THREE.Vector3(-1, 1.5, -17), rot: { x: 0, y: 10, z: 0 } },
    { pos: new THREE.Vector3(-1, 1.5, -19.2), rot: { x: 0, y: 10, z: 0 } },
    { pos: new THREE.Vector3(-1, 1.5, -21), rot: { x: 0, y: 0, z: 0 } },
    { pos: new THREE.Vector3(-1, 1.5, -25.5), rot: { x: 0, y: 170, z: 0 } },
    { pos: new THREE.Vector3(1, 1.5, -26.6), rot: { x: 0, y: 130, z: 0 } },
  ];

  let currentIndex = 0;
  let hasEntered = false;

  const goToPosition = (index: number) => {
    const target = cameraPositions[index];
    gsap.to(camera.position, { x: target.pos.x, y: target.pos.y, z: target.pos.z, duration: 1.5, ease: "power2.inOut" });
    gsap.to(camera.rotation, { x: THREE.MathUtils.degToRad(target.rot.x), y: THREE.MathUtils.degToRad(target.rot.y), z: THREE.MathUtils.degToRad(target.rot.z), duration: 1.5, ease: "power2.inOut" });
  };

  goToPosition(0);

  /* ------------------------
   * LOAD MODELS
   * ------------------------ */
  const loader = new GLTFLoader();
  loader.load("/restorant3D.gltf", (gltf) => scene.add(gltf.scene));

  const reservedPositions = [
    { x: -6.25, y: 1.94, z: -34.1, rot: { x: 0, y: 0, z: 0 } },
    { x: -3.2, y: 1.94, z: -32.3, rot: { x: 0, y: 0, z: 0 } },
    { x: -0.5, y: 1.94, z: -33.9, rot: { x: 0, y: 0, z: 0 } },
    { x: 2.67, y: 1.94, z: -32.4, rot: { x: 0, y: -30, z: 0 } },
    { x: 1.1, y: -0.07, z: -29, rot: { x: 0, y: -30, z: 0 } },
    { x: -1.7, y: -0.07, z: -29, rot: { x: 0, y: -20, z: 0 } },
    { x: -6.1, y: -0.07, z: -25.5, rot: { x: 0, y: 45, z: 0 } },
    { x: -5.8, y: -0.07, z: -22.36, rot: { x: 0, y: 75, z: 0 } },
    { x: -5.8, y: -0.07, z: -16.8, rot: { x: 0, y: 75, z: 0 } },
    { x: -5.8, y: -0.07, z: -13.7, rot: { x: 0, y: 90, z: 0 } },
    { x: 0.7, y: 0, z: -15.5, rot: { x: 0, y: 20, z: 0 } },
    { x: -1, y: 0, z: -16.2, rot: { x: 0, y: -20, z: 0 } },
    { x: -1, y: 0, z: -18, rot: { x: 0, y: -20, z: 0 } },
    { x: -1, y: 0, z: -20.2, rot: { x: 0, y: -20, z: 0 } },
    { x: -1, y: 0, z: -22, rot: { x: 0, y: -20, z: 0 } },
    { x: -0.6, y: 0, z: -23.5, rot: { x: 0, y: 20, z: 0 } },
    { x: -0.2, y: 0, z: -24.7, rot: { x: 0, y: -20, z: 0 } },
  ];

  const reservedMeshes: THREE.Object3D[] = [];

  loader.load("/reserved.glb", (gltf) => {
    reservedPositions.forEach((p, index) => {
      const seat = gltf.scene.clone(true);
      seat.position.set(p.x, p.y, p.z);
      seat.rotation.set(
        THREE.MathUtils.degToRad(p.rot.x),
        THREE.MathUtils.degToRad(p.rot.y),
        THREE.MathUtils.degToRad(p.rot.z)
      );
      seat.visible = false;
      seat.userData.seatId = index;
      reservedMeshes.push(seat);
      scene.add(seat);
    });

    // ✅ Register event AFTER seats are loaded
    window.addEventListener("update-reservations", (e: any) => {
      const ids: number[] = e.detail;
      reservedMeshes.forEach((m) => (m.visible = ids.includes(m.userData.seatId)));
    });

    // Expose single seat function globally
    (window as any).showReservedSeat = (seatId: number) => {
      reservedMeshes.forEach((m) => (m.visible = m.userData.seatId === seatId));
    };
  });

  /* ------------------------
   * NAVIGATION
   * ------------------------ */
  const moveNext = () => {
    if (!hasEntered) {
      hasEntered = true;
      onEnter?.();
      currentIndex = 1;
    } else if (currentIndex < cameraPositions.length - 1) {
      currentIndex++;
    }
    goToPosition(currentIndex);
  };

  const movePrev = () => {
    if (!hasEntered) return;
    if (currentIndex > 0) currentIndex--;
    if (currentIndex === 0) {
      hasEntered = false;
      onExit?.();
    }
    goToPosition(currentIndex);
  };

  let scrollCooldown = false;
  window.addEventListener("wheel", (e) => {
    if (scrollCooldown) return;
    scrollCooldown = true;
    e.deltaY > 0 ? moveNext() : movePrev();
    setTimeout(() => (scrollCooldown = false), 1500);
  });

  let startY = 0;
  window.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  });
  window.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    if (Math.abs(endY - startY) > 50) {
      endY < startY ? moveNext() : movePrev();
    }
  });

  /* ------------------------
   * RENDER LOOP
   * ------------------------ */
  gsap.ticker.add(() => renderer.render(scene, camera));
};

export default initRestorant3D;
