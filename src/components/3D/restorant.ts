import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

type InitOptions = {
  onEnter?: () => void;
  onExit?: () => void;
};

const initRestorant3D = (options: InitOptions = {}) => {
  const { onEnter, onExit } = options;

  // container (full-screen section)
  const container = document.querySelector("section.fixed");

  // Prevent pull-to-refresh ONLY inside this full-screen section
  container?.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  // Scene setup
  const canvas = document.querySelector("canvas.restorant-3D") as HTMLCanvasElement;
  if (!canvas) return;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const size = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  };

  const camera = new THREE.PerspectiveCamera(80, size.width / size.height, 0.1, 200);
  scene.add(camera);

  // CAMERA POSITIONS
  const cameraPositions = [
    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } }, // TO4-Position0 (landing - index 0)
    
    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } }, // TO4-Position1 (ndex 1)
    { pos: new THREE.Vector3(-3.3, 3.5, -34), rot: { x: 0, y: 180, z: 0 } }, // TO4-Position2 (index 2)
    { pos: new THREE.Vector3(-0.5, 3.5, -36), rot: { x: 0, y: 175, z: 0 } }, // TO4-Position3
    { pos: new THREE.Vector3(3.5, 3.5, -34), rot: { x: 0, y: 150, z: 0 } }, // TO4-Position4

    { pos: new THREE.Vector3(2, 1.5, -31), rot: { x: 0, y: 165, z: 0 } }, // Booth-Position1
    { pos: new THREE.Vector3(-1, 1.5, -31), rot: { x: 0, y: 165, z: 0 } }, // Booth-Position2
    { pos: new THREE.Vector3(-7.5, 1.5, -26.8), rot: { x: 0, y: 240, z: 0 } }, // Booth-Position3
    { pos: new THREE.Vector3(-8, 1.5, -23), rot: { x: 0, y: 270, z: 0 } }, // Booth-Position4
    { pos: new THREE.Vector3(-8, 1.5, -17), rot: { x: 0, y: 270, z: 0 } }, // Booth-Position5
    { pos: new THREE.Vector3(-8, 1.5, -13), rot: { x: 0, y: 310, z: 0 } }, // Booth-Position6

    { pos: new THREE.Vector3(1.2, 1.5, -15), rot: { x: 0, y: 35, z: 0 } }, // Stool-Position1
    { pos: new THREE.Vector3(-1, 1.5, -15), rot: { x: 0, y: 10, z: 0 } }, // Stool-Position2
    { pos: new THREE.Vector3(-1, 1.5, -17), rot: { x: 0, y: 10, z: 0 } }, // Stool-Position3
    { pos: new THREE.Vector3(-1, 1.5, -19.2), rot: { x: 0, y: 10, z: 0 } }, // Stool-Position4
    { pos: new THREE.Vector3(-1, 1.5, -21), rot: { x: 0, y: 0, z: 0 } }, // Stool-Position5
    { pos: new THREE.Vector3(-1, 1.5, -25.5), rot: { x: 0, y: 170, z: 0 } }, // Stool-Position6
    { pos: new THREE.Vector3(1, 1.5, -26.6), rot: { x: 0, y: 130, z: 0 } }, // Stool-Position7
  ];

  let currentIndex = 0;
  let hasEntered = false; // indicates if user has "entered" (left the landing state)
  let scrollCooldown = false; // prevent super fast scrolling spam

  const goToPosition = (index: number) => {
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
  };

  // start at landing (index 0)
  goToPosition(0);

  // helpers to move with bounds (no looping)
  const moveNext = () => {
    if (!hasEntered) {
      // First scroll/swipe: enter the experience
      hasEntered = true;
      onEnter?.();
      // move to position 1 (first real position)
      currentIndex = Math.min(1, cameraPositions.length - 1);
      goToPosition(currentIndex);
      return;
    }
    // normal navigation: don't exceed last index
    if (currentIndex < cameraPositions.length - 1) {
      currentIndex++;
      goToPosition(currentIndex);
    }
  };

  const movePrev = () => {
    if (!hasEntered) {
      // on landing, scrolling up does nothing
      return;
    }
    if (currentIndex > 0) {
      currentIndex--;
      goToPosition(currentIndex);

      // if we returned to landing (index 0), go back to landing state
      if (currentIndex === 0) {
        hasEntered = false;
        onExit?.();
      }
    }
  };

  // DESKTOP: wheel
  window.addEventListener("wheel", (e) => {
    if (scrollCooldown) return; // prevent super fast scrolling spam
    scrollCooldown = true;

    if (e.deltaY > 0) {
      // scroll down → next position
      moveNext();
    } else if (e.deltaY < 0) {
      // scroll up → previous position
      movePrev();
    }

    // cooldown to avoid rapid camera switching
    setTimeout(() => {
      scrollCooldown = false;
    }, 1500); // preserved exactly as requested
  });

  // MOBILE SWIPE (one swipe = one move)
  let touchStartY = 0;
  let touchEndY = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      touchEndY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener("touchend", () => {
    if (scrollCooldown) return; // same cooldown as wheel
    scrollCooldown = true;

    const distance = touchEndY - touchStartY;

    // requires a real swipe, not small movement
    if (Math.abs(distance) > 50) {
      if (distance < 0) {
        // swipe up → next cam
        moveNext();
      } else {
        // swipe down → previous cam
        movePrev();
      }
    }

    // reset
    touchStartY = 0;
    touchEndY = 0;

    // cooldown same as scroll
    setTimeout(() => {
      scrollCooldown = false;
    }, 1500); // preserved exactly as requested
  });

  // BUTTON EVENTS (kept for fallback—won't loop because moveNext/movePrev have bounds)
  document.getElementById("prevCam")?.addEventListener("click", () => {
    movePrev();
  });

  document.getElementById("nextCam")?.addEventListener("click", () => {
    moveNext();
  });

  // RENDERER
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(size.pixelRatio);

  window.addEventListener("resize", () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height);
  });

  // LIGHTING
  scene.add(new THREE.DirectionalLight(0xffffff, 2));
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // LOAD MAIN RESTAURANT MODEL
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

  loader.load("/reserved.glb", (gltf) => {
    reservedPositions.forEach((p) => {
      const clone = gltf.scene.clone(true);
      clone.position.set(p.x, p.y, p.z);

      clone.rotation.set(
        THREE.MathUtils.degToRad(p.rot.x),
        THREE.MathUtils.degToRad(p.rot.y),
        THREE.MathUtils.degToRad(p.rot.z)
      );

      clone.scale.set(1, 1, 1);

      scene.add(clone);
    });
  });

  // LOOP
  gsap.ticker.add(() => renderer.render(scene, camera));

  return {};
};

export default initRestorant3D;
