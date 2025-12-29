// src/components/3D/interactionHandler.tsx
import * as THREE from "three";
import { BellManager } from "./bellManager";
import { AudioManager } from "./audioManager";

export class InteractionHandler {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private bellManager: BellManager;
  private audioManager: AudioManager;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    bellManager: BellManager,
    audioManager: AudioManager
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
    this.bellManager = bellManager;
    this.audioManager = audioManager;
  }

  init() {
    window.addEventListener("click", this.handleClick);
    window.addEventListener("mousemove", this.handleMouseMove);
  }

  private getDateTimeFromUI = () => {
    const dateElement = document.getElementById(
      "reservation-date"
    ) as HTMLInputElement;
    const fromHourElement = document.getElementById(
      "time-from-hour"
    ) as HTMLSelectElement;
    const fromMinuteElement = document.getElementById(
      "time-from-minute"
    ) as HTMLSelectElement;
    const toHourElement = document.getElementById(
      "time-to-hour"
    ) as HTMLSelectElement;
    const toMinuteElement = document.getElementById(
      "time-to-minute"
    ) as HTMLSelectElement;

    const date = dateElement?.value || "";
    const timeFrom =
      fromHourElement && fromMinuteElement
        ? `${fromHourElement.value}:${fromMinuteElement.value}`
        : "";
    const timeTo =
      toHourElement && toMinuteElement
        ? `${toHourElement.value}:${toMinuteElement.value}`
        : "";

    return { date, timeFrom, timeTo };
  };

  private handleClick = (event: MouseEvent) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const bellObject = this.bellManager.findBellFromObject(clickedObject);

      if (!bellObject) return;

      const seatId = bellObject.userData?.seatId;
      if (seatId === undefined) {
        console.error("Bell object does not have seatId:", bellObject);
        return;
      }

      this.audioManager.play();
      this.bellManager.animateRing(bellObject);

      const { date, timeFrom, timeTo } = this.getDateTimeFromUI();

      if (date && timeFrom && timeTo) {
        if (timeFrom === "00:00" && timeTo === "00:00") return;

        const queryParams = new URLSearchParams({
          seat_id: seatId.toString(),
          date: date,
          from: timeFrom,
          to: timeTo,
        });

        window.location.href = `/reserve?${queryParams.toString()}`;
        return;
      }

      window.dispatchEvent(
        new CustomEvent("bell-clicked", {
          detail: {
            bellId: bellObject.userData?.bellId,
            seatId: seatId,
            position: {
              x: bellObject.position.x,
              y: bellObject.position.y,
              z: bellObject.position.z,
            },
          },
        })
      );
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    let isHoveringBell = false;
    for (const intersect of intersects) {
      const bellObject = this.bellManager.findBellFromObject(intersect.object);
      if (bellObject && bellObject.visible) {
        isHoveringBell = true;
        break;
      }
    }

    this.canvas.style.cursor = isHoveringBell ? "pointer" : "default";
  };

  destroy() {
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("mousemove", this.handleMouseMove);
  }
}