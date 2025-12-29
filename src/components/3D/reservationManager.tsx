// src/components/3D/reservationManager.tsx
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export interface ReservedPosition {
  x: number;
  y: number;
  z: number;
  rot: { x: number; y: number; z: number };
}

export const reservedPositions: ReservedPosition[] = [
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

export class ReservationManager {
  private reservedMeshes: THREE.Object3D[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  async load(loader: GLTFLoader): Promise<void> {
    return new Promise((resolve) => {
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
          seat.userData = seat.userData || {};
          seat.userData.seatId = index;
          this.reservedMeshes.push(seat);
          this.scene.add(seat);
        });
        resolve();
      });
    });
  }

  updateVisibility(reservedSeatIds: number[]) {
    this.reservedMeshes.forEach((seat) => {
      const isReserved = reservedSeatIds.includes(seat.userData.seatId);
      seat.visible = isReserved;
    });
  }
}