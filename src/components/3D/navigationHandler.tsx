// src/components/3D/navigationHandler.tsx
import * as THREE from "three";
import { goToPosition, cameraPositions } from "./cameraPositions";

interface NavigationCallbacks {
  onEnter?: () => void;
  onExit?: () => void;
}

export class NavigationHandler {
  private currentIndex = 0;
  private hasEntered = false;
  private camera: THREE.PerspectiveCamera;
  private callbacks: NavigationCallbacks;
  private scrollCooldown = false;
  private startY = 0;

  constructor(camera: THREE.PerspectiveCamera, callbacks: NavigationCallbacks) {
    this.camera = camera;
    this.callbacks = callbacks;
  }

  init() {
    goToPosition(0, this.camera);

    window.addEventListener("wheel", this.handleWheel);
    window.addEventListener("touchstart", this.handleTouchStart);
    window.addEventListener("touchend", this.handleTouchEnd);
    window.addEventListener("goto-camera-position", this.handleGotoPosition);
  }

  private moveNext = () => {
    if (!this.hasEntered) {
      this.hasEntered = true;
      this.callbacks.onEnter?.();
      this.currentIndex = 1;
    } else if (this.currentIndex < cameraPositions.length - 1) {
      this.currentIndex++;
    }
    goToPosition(this.currentIndex, this.camera);
  };

  private movePrev = () => {
    if (!this.hasEntered) return;
    if (this.currentIndex > 0) this.currentIndex--;
    if (this.currentIndex === 0) {
      this.hasEntered = false;
      this.callbacks.onExit?.();
    }
    goToPosition(this.currentIndex, this.camera);
  };

  private handleWheel = (e: WheelEvent) => {
    if (this.scrollCooldown) return;
    this.scrollCooldown = true;
    e.deltaY > 0 ? this.moveNext() : this.movePrev();
    setTimeout(() => (this.scrollCooldown = false), 1500);
  };

  private handleTouchStart = (e: TouchEvent) => {
    this.startY = e.touches[0].clientY;
  };

  private handleTouchEnd = (e: TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    if (Math.abs(endY - this.startY) > 50) {
      endY < this.startY ? this.moveNext() : this.movePrev();
    }
  };

  private handleGotoPosition = (e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const targetPosition = customEvent.detail;

    if (targetPosition >= 0 && targetPosition < cameraPositions.length) {
      this.currentIndex = targetPosition;
      if (targetPosition > 0 && !this.hasEntered) {
        this.hasEntered = true;
        this.callbacks.onEnter?.();
      }
      goToPosition(targetPosition, this.camera);
    }
  };

  destroy() {
    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("touchstart", this.handleTouchStart);
    window.removeEventListener("touchend", this.handleTouchEnd);
    window.removeEventListener("goto-camera-position", this.handleGotoPosition);
  }
}