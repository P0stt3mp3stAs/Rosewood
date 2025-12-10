// src/components/3D/restorant.ts

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const initRestorant3D = (): { scene: THREE.Scene } => {
  const canvas = document.querySelector("canvas.restorant-3D") as HTMLCanvasElement;
  if (!canvas) {
    console.warn("Canvas .restorant-3D not found!");
    return { scene: new THREE.Scene() };
  }

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const size = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  };

  const camera = new THREE.PerspectiveCamera(
    80,
    size.width / size.height,
    0.1,
    200
  );
  // camera.position.set(0, 1, 6);
  scene.add(camera);

  const cameraPositions = [
    { pos: new THREE.Vector3(-8, 1.5, -14), look: new THREE.Vector3(500, 0, 0) }, // tester Position

    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), look: new THREE.Vector3(0, 0, 0) }, // TO4-Position 1
    { pos: new THREE.Vector3(-3.3, 3.5, -34), look: new THREE.Vector3(0, 0, 0) }, // TO4-Position 2
    { pos: new THREE.Vector3(-0.5, 3.5, -36), look: new THREE.Vector3(0, 0, 0) }, // TO4-Position 3  
    { pos: new THREE.Vector3(3.5, 3.5, -34), look: new THREE.Vector3(-10, 0, 0) }, // TO4-Position 4

    { pos: new THREE.Vector3(2, 1.5, -31), look: new THREE.Vector3(-10, 0, 0) }, // BOOTH-Position 1
    { pos: new THREE.Vector3(-1, 1.5, -31), look: new THREE.Vector3(-10, 0, 0) }, // BOOTH-Position 2
    { pos: new THREE.Vector3(-7.5, 1.5, -27), look: new THREE.Vector3(15, 0, 0) }, // BOOTH-Position 3
    { pos: new THREE.Vector3(-8, 1.5, -23), look: new THREE.Vector3(150, 0, 0) }, // BOOTH-Position 4
    { pos: new THREE.Vector3(-8, 1.5, -17), look: new THREE.Vector3(150, 0, 0) }, // BOOTH-Position 5
    { pos: new THREE.Vector3(-8, 1.5, -14), look: new THREE.Vector3(500, 0, 0) }, // BOOTH-Position 6

    { pos: new THREE.Vector3(-3, 1.5, 4), look: new THREE.Vector3(0, 0, 0) }, // STOOL-Position 1
    { pos: new THREE.Vector3(-3, 1.5, 4), look: new THREE.Vector3(0, 0, 0) }, // STOOL-Position 2
    { pos: new THREE.Vector3(-3, 1.5, 4), look: new THREE.Vector3(0, 0, 0) }, // STOOL-Position 3
    { pos: new THREE.Vector3(-3, 1.5, 4), look: new THREE.Vector3(0, 0, 0) }, // STOOL-Position 4
    { pos: new THREE.Vector3(-3, 1.5, 4), look: new THREE.Vector3(0, 0, 0) }, // STOOL-Position 5
    { pos: new THREE.Vector3(-3, 1.5, 4), look: new THREE.Vector3(0, 0, 0) }, // STOOL-Position 6
    { pos: new THREE.Vector3(-8, 1.5, -14), look: new THREE.Vector3(500, 0, 0) }, // STOOL-Position 7
  ];

  let currentIndex = 0;

  const goToPosition = (index: number) => {
  const target = cameraPositions[index];

  gsap.to(camera.position, {
    x: target.pos.x,
    y: target.pos.y,
    z: target.pos.z,
    duration: 1.5,
    ease: "power2.inOut",
  });

  const lookAtTarget = camera.getWorldDirection(new THREE.Vector3()).add(camera.position);

  gsap.to(lookAtTarget, {
    x: target.look.x,
    y: target.look.y,
    z: target.look.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(lookAtTarget);
    }
  });
};

  goToPosition(0);

document.getElementById("prevCam")?.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + cameraPositions.length) % cameraPositions.length;
  goToPosition(currentIndex);
});

document.getElementById("nextCam")?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % cameraPositions.length;
  goToPosition(currentIndex);
});


  window.addEventListener("resize", () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(size.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(5, 5, 5);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Load model
  const loader = new GLTFLoader();

  loader.load(
    "/restorant3D.gltf",
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);

      scene.add(model);

      console.log("GLTF model loaded!");
    },
    undefined,
    (error) => {
      console.error("Error loading GLTF:", error);
    }
  );

  // Animation loop
  gsap.ticker.add(() => {
    renderer.render(scene, camera);
  });

  return { scene };
};

export default initRestorant3D;
