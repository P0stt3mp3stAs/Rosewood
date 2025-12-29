// src/components/3D/scene.tsx
import * as THREE from "three";

export const createScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  return scene;
};

export const createCamera = (width: number, height: number) => {
  const camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 200);
  return camera;
};

export const createRenderer = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  return renderer;
};

export const setupLights = (scene: THREE.Scene) => {
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  
  const dir = new THREE.DirectionalLight(0xffffff, 3);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);
};

export const handleResize = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};