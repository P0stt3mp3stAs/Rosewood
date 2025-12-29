// src/components/3D/cameraPositions.tsx
import * as THREE from "three";
import gsap from "gsap";

export interface CameraPosition {
  pos: THREE.Vector3;
  rot: { x: number; y: number; z: number };
}

export const cameraPositions: CameraPosition[] = [
  { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } }, // pos 0: initial
  { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } }, // pos 1
  { pos: new THREE.Vector3(-3.3, 3.5, -34), rot: { x: 0, y: 180, z: 0 } }, // pos 2
  { pos: new THREE.Vector3(-0.5, 3.5, -35.8), rot: { x: 0, y: 175, z: 0 } }, // pos 3
  { pos: new THREE.Vector3(3.5, 3.5, -34), rot: { x: 0, y: 150, z: 0 } }, // pos 4
  { pos: new THREE.Vector3(2, 1.5, -30.8), rot: { x: 0, y: 165, z: 0 } }, // pos 5
  { pos: new THREE.Vector3(-1, 1.5, -30.8), rot: { x: 0, y: 165, z: 0 } }, // pos 6
  { pos: new THREE.Vector3(-7.5, 1.5, -26.8), rot: { x: 0, y: 240, z: 0 } }, // pos 7
  { pos: new THREE.Vector3(-8, 1.5, -23), rot: { x: 0, y: 270, z: 0 } }, // pos 8
  { pos: new THREE.Vector3(-8, 1.5, -17), rot: { x: 0, y: 270, z: 0 } }, // pos 9
  { pos: new THREE.Vector3(-8, 1.5, -13), rot: { x: 0, y: 310, z: 0 } }, // pos 10
  { pos: new THREE.Vector3(1.2, 1.5, -15), rot: { x: 0, y: 35, z: 0 } }, // pos 11
  { pos: new THREE.Vector3(-1, 1.5, -15), rot: { x: 0, y: 10, z: 0 } }, // pos 12
  { pos: new THREE.Vector3(-1, 1.5, -17), rot: { x: 0, y: 10, z: 0 } }, // pos 13
  { pos: new THREE.Vector3(-1, 1.5, -19.2), rot: { x: 0, y: 10, z: 0 } }, // pos 14
  { pos: new THREE.Vector3(-1, 1.5, -21), rot: { x: 0, y: 0, z: 0 } }, // pos 15
  { pos: new THREE.Vector3(-1, 1.5, -25.5), rot: { x: 0, y: 170, z: 0 } }, // pos 16
  { pos: new THREE.Vector3(1, 1.5, -26.6), rot: { x: 0, y: 130, z: 0 } }, // pos 17
];

export const goToPosition = (
  index: number,
  camera: THREE.PerspectiveCamera
) => {
  const target = cameraPositions[index];
  
  gsap.to(camera.position, {
    x: target.pos.x,
    y: target.pos.y,
    z: target.pos.z,
    duration: 1.5,
    ease: "power2.inOut",
  });
  
  gsap.to(camera.rotation, {
    x: THREE.MathUtils.degToRad(target.rot.x),
    y: THREE.MathUtils.degToRad(target.rot.y),
    z: THREE.MathUtils.degToRad(target.rot.z),
    duration: 1.5,
    ease: "power2.inOut",
  });

  const seatId = index - 1;
  window.dispatchEvent(
    new CustomEvent("camera-position-changed", { detail: seatId })
  );
};