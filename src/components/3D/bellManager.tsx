// src/components/3D/bellManager.tsx
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { AudioManager } from "./audioManager";

export interface BellPosition {
  x: number;
  y: number;
  z: number;
  rot: { x: number; y: number; z: number };
}

export const tableBellPositions: BellPosition[] = [
  { x: -6.25, y: 1.9, z: -33.9, rot: { x: 0, y: 0, z: 0 } },
  { x: -3.2, y: 1.9, z: -32.3, rot: { x: 0, y: 0, z: 0 } },
  { x: -0.5, y: 1.9, z: -33.9, rot: { x: 0, y: 0, z: 0 } },
  { x: 2.67, y: 1.9, z: -32.4, rot: { x: 0, y: -30, z: 0 } },
  { x: 1.1, y: -0.1, z: -29, rot: { x: 0, y: -30, z: 0 } },
  { x: -1.7, y: -0.1, z: -29, rot: { x: 0, y: -20, z: 0 } },
  { x: -6.1, y: -0.1, z: -25.5, rot: { x: 0, y: 45, z: 0 } },
  { x: -5.8, y: -0.1, z: -22.36, rot: { x: 0, y: 75, z: 0 } },
  { x: -5.8, y: -0.1, z: -16.8, rot: { x: 0, y: 75, z: 0 } },
  { x: -5.8, y: -0.1, z: -13.7, rot: { x: 0, y: 90, z: 0 } },
  { x: 0.7, y: 0, z: -15.5, rot: { x: 0, y: 20, z: 0 } },
  { x: -1, y: 0, z: -16.2, rot: { x: 0, y: -20, z: 0 } },
  { x: -1, y: 0, z: -18, rot: { x: 0, y: -20, z: 0 } },
  { x: -1, y: 0, z: -20.2, rot: { x: 0, y: -20, z: 0 } },
  { x: -1, y: 0, z: -22, rot: { x: 0, y: -20, z: 0 } },
  { x: -0.6, y: 0, z: -23.5, rot: { x: 0, y: 20, z: 0 } },
  { x: -0.2, y: 0, z: -24.7, rot: { x: 0, y: -20, z: 0 } },
];

export class BellManager {
  private bellMeshes: THREE.Object3D[] = [];
  private audioManager: AudioManager;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, audioManager: AudioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
  }

  async load(loader: GLTFLoader): Promise<void> {
    return new Promise((resolve, reject) => {
      loader.load(
        "/bell.glb",
        (gltf) => {
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              child.material.side = THREE.DoubleSide;
              child.material.needsUpdate = true;

              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.roughness = 1.0;
                child.material.metalness = 0.5;
                child.material.envMapIntensity = 1.0;
              }
            }
          });

          tableBellPositions.forEach((p, index) => {
            const bell = gltf.scene.clone(true);
            bell.position.set(p.x, p.y, p.z);
            bell.rotation.set(
              THREE.MathUtils.degToRad(p.rot.x),
              THREE.MathUtils.degToRad(p.rot.y),
              THREE.MathUtils.degToRad(p.rot.z)
            );
            bell.visible = true;

            bell.userData = {
              bellId: index,
              seatId: index,
              isBell: true,
            };

            bell.traverse((child) => {
              if (!child.userData) child.userData = {};
              child.userData.bellId = index;
              child.userData.seatId = index;
              child.userData.isBellPart = true;
            });

            this.bellMeshes.push(bell);
            this.scene.add(bell);
          });

          resolve();
        },
        undefined,
        (error) => {
          console.error("Error loading bell.glb:", error);
          this.createFallbackBells();
          resolve();
        }
      );
    });
  }

  private createFallbackBells() {
    tableBellPositions.forEach((p, index) => {
      const fallbackBell = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffaa00,
          metalness: 0.5,
          roughness: 0.5,
        })
      );
      fallbackBell.position.set(p.x, p.y, p.z);
      fallbackBell.visible = true;
      fallbackBell.userData = {
        bellId: index,
        seatId: index,
        isFallback: true,
      };

      this.scene.add(fallbackBell);
      this.bellMeshes.push(fallbackBell);
    });
  }

  animateRing(bell: THREE.Object3D) {
    const originalRotationZ = bell.rotation.z;
    const timeline = gsap.timeline();

    timeline
      .to(bell.rotation, {
        z: originalRotationZ + Math.PI * 0.15,
        duration: 0.08,
        ease: "power2.out",
      })
      .to(bell.rotation, {
        z: originalRotationZ - Math.PI * 0.1,
        duration: 0.06,
        ease: "power2.in",
      })
      .to(bell.rotation, {
        z: originalRotationZ + Math.PI * 0.05,
        duration: 0.04,
        ease: "power2.out",
      })
      .to(bell.rotation, {
        z: originalRotationZ,
        duration: 0.2,
        ease: "elastic.out(1, 0.5)",
      });

    timeline.to(
      bell.position,
      {
        y: bell.position.y + 0.02,
        duration: 0.04,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      },
      0
    );
  }

  ring(bellId: number) {
    const bell = this.bellMeshes.find((b) => b.userData.bellId === bellId);
    if (bell && bell.visible) {
      this.audioManager.play();
      this.animateRing(bell);
    }
  }

  getBellMeshes() {
    return this.bellMeshes;
  }

  findBellFromObject(object: THREE.Object3D): THREE.Object3D | null {
    if (this.bellMeshes.includes(object)) return object;
    if (object.userData?.seatId !== undefined) return object;

    let current = object;
    while (current.parent) {
      current = current.parent;
      if (
        this.bellMeshes.includes(current) ||
        current.userData?.seatId !== undefined
      ) {
        return current;
      }
    }
    return null;
  }

  updateVisibility(reservedSeatIds: number[]) {
    this.bellMeshes.forEach((bell) => {
      const isReserved = reservedSeatIds.includes(bell.userData.seatId);
      bell.visible = !isReserved;
    });
  }
}