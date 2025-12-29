// src/components/3D/restaurant.tsx
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import gsap from "gsap";
import {
  createScene,
  createCamera,
  createRenderer,
  setupLights,
  handleResize,
} from "./scene";
import { AudioManager } from "./audioManager";
import { BellManager } from "./bellManager";
import { ReservationManager } from "./reservationManager";
import { InteractionHandler } from "./interactionHandler";
import { NavigationHandler } from "./navigationHandler";

type InitOptions = {
  onEnter?: () => void;
  onExit?: () => void;
};

interface UpdateReservationsEvent extends Event {
  detail: number[];
}

const initRestorant3D = (options: InitOptions = {}) => {
  const { onEnter, onExit } = options;

  const canvas = document.querySelector(
    "canvas.restorant-3D"
  ) as HTMLCanvasElement;
  if (!canvas) return;

  // Create scene
  const scene = createScene();
  const camera = createCamera(window.innerWidth, window.innerHeight);
  const renderer = createRenderer(
    canvas,
    window.innerWidth,
    window.innerHeight
  );
  setupLights(scene);

  // Handle window resize
  window.addEventListener("resize", () => handleResize(camera, renderer));

  // Initialize managers
  const audioManager = new AudioManager();
  audioManager.init();

  const bellManager = new BellManager(scene, audioManager);
  const reservationManager = new ReservationManager(scene);
  const interactionHandler = new InteractionHandler(
    canvas,
    camera,
    scene,
    bellManager,
    audioManager
  );
  const navigationHandler = new NavigationHandler(camera, {
    onEnter,
    onExit,
  });

  // Setup loaders
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
  );
  loader.setDRACOLoader(dracoLoader);

  // Load restaurant model
  loader.load("/restorant3D.glb", (gltf) => {
    scene.add(gltf.scene);
  });

  // Load bells and reservations
  Promise.all([
    bellManager.load(loader),
    reservationManager.load(loader),
  ]).then(() => {
    interactionHandler.init();
    navigationHandler.init();

    // Setup event listeners
    window.addEventListener("update-reservations", (e: Event) => {
      const customEvent = e as UpdateReservationsEvent;
      const reservedSeatIds: number[] = customEvent.detail;
      reservationManager.updateVisibility(reservedSeatIds);
      bellManager.updateVisibility(reservedSeatIds);
    });

    // Expose utility functions for debugging/testing
    (window as Window & { testBellSound?: () => void }).testBellSound = () => {
      audioManager.play();
    };

    (
      window as Window & { ringBellById?: (bellId: number) => void }
    ).ringBellById = (bellId: number) => {
      bellManager.ring(bellId);
    };

    (
      window as Window & { updateReservations?: (seatIds: number[]) => void }
    ).updateReservations = (seatIds: number[]) => {
      reservationManager.updateVisibility(seatIds);
      bellManager.updateVisibility(seatIds);
    };

    (
      window as Window & { testRedirect?: (seatId: number) => void }
    ).testRedirect = (seatId: number) => {
      const queryParams = new URLSearchParams({
        seat_id: seatId.toString(),
        date: "2024-01-15",
        from: "18:00",
        to: "20:00",
      });
      window.location.href = `/reserve?${queryParams.toString()}`;
    };
  });

  // Start render loop
  gsap.ticker.add(() => renderer.render(scene, camera));
};

export default initRestorant3D;