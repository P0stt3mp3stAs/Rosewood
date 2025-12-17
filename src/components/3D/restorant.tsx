// src/components/3D/restorant.tsx

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"; // For compressed models
import gsap from "gsap";

type InitOptions = {
  onEnter?: () => void;
  onExit?: () => void;
};

const initRestorant3D = (options: InitOptions = {}) => {
  const { onEnter, onExit } = options;

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
  
  // Updated for newer Three.js versions
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Changed from sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  window.addEventListener("resize", () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
  });

  // Better lighting setup
  scene.add(new THREE.AmbientLight(0xffffff, 1.5)); // Increased ambient light
  const dir = new THREE.DirectionalLight(0xffffff, 3); // Increased directional light
  dir.position.set(10, 20, 10); // Better position
  scene.add(dir);

  // Add a second light for better visibility
  const fillLight = new THREE.DirectionalLight(0xffffff, 1);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

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

  const loader = new GLTFLoader();
  
  // Optional: Add Draco loader for compressed models
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);

  loader.load("/restorant3D.gltf", (gltf) => {
    scene.add(gltf.scene);
    console.log("Restaurant model loaded");
  });

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

    window.addEventListener("update-reservations", (e: any) => {
      console.log("Received update-reservations event:", e.detail);
      const ids: number[] = e.detail;
      console.log("Setting visibility for seat IDs:", ids);
      reservedMeshes.forEach((m) => {
        m.visible = ids.includes(m.userData.seatId);
        console.log(`Seat ${m.userData.seatId}: ${m.visible ? 'visible' : 'hidden'}`);
      });
    });

    (window as any).showReservedSeat = (seatId: number) => {
      reservedMeshes.forEach((m) => (m.visible = m.userData.seatId === seatId));
    };
  });

  // =============== TABLE BELLS - VISIBLE WITH TEXTURES ===============
  // Define bell positions - Y values adjusted to be on tables
  const tableBellPositions = [
    { x: -6.25, y: 1.9, z: -33.9, rot: { x: 0, y: 0, z: 0 } },
    { x: -3.2, y: 1.9, z: -32.3, rot: { x: 0, y: 0, z: 0 } },
    { x: -0.5, y: 1.9, z: -33.9, rot: { x: 0, y: 0, z: 0 } },
    { x: 2.67, y: 1.9, z: -32.4, rot: { x: 0, y: -30, z: 0 } },
    { x: 1.1, y: -0.10, z: -29, rot: { x: 0, y: -30, z: 0 } },
    { x: -1.7, y: -0.10, z: -29, rot: { x: 0, y: -20, z: 0 } },
    { x: -6.1, y: -0.10, z: -25.5, rot: { x: 0, y: 45, z: 0 } },
    { x: -5.8, y: -0.10, z: -22.36, rot: { x: 0, y: 75, z: 0 } },
    { x: -5.8, y: -0.10, z: -16.8, rot: { x: 0, y: 75, z: 0 } },
    { x: -5.8, y: -0.10, z: -13.7, rot: { x: 0, y: 90, z: 0 } },
    { x: 0.7, y: 0, z: -15.5, rot: { x: 0, y: 20, z: 0 } },
    { x: -1, y: 0, z: -16.2, rot: { x: 0, y: -20, z: 0 } },
    { x: -1, y: 0, z: -18, rot: { x: 0, y: -20, z: 0 } },
    { x: -1, y: 0, z: -20.2, rot: { x: 0, y: -20, z: 0 } },
    { x: -1, y: 0, z: -22, rot: { x: 0, y: -20, z: 0 } },
    { x: -0.6, y: 0, z: -23.5, rot: { x: 0, y: 20, z: 0 } },
    { x: -0.2, y: 0, z: -24.7, rot: { x: 0, y: -20, z: 0 } },
  ];

  const tableBellMeshes: THREE.Object3D[] = [];

  // =============== SOUND SETUP ===============
  // Create audio context and sound
  let audioContext: AudioContext | null = null;
  let bellSoundBuffer: AudioBuffer | null = null;
  let isSoundLoaded = false;

  // Function to initialize audio
  const initAudio = () => {
    if (audioContext) return; // Already initialized
    
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Load bell sound
    fetch("/BellSound.mp3")
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext!.decodeAudioData(arrayBuffer))
      .then(buffer => {
        bellSoundBuffer = buffer;
        isSoundLoaded = true;
        console.log("Bell sound loaded successfully");
      })
      .catch(error => {
        console.error("Error loading bell sound:", error);
      });
  };

  // Function to play bell sound
  const playBellSound = () => {
    if (!audioContext || !bellSoundBuffer || !isSoundLoaded) {
      console.log("Sound not ready yet");
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = bellSoundBuffer;
    source.connect(audioContext.destination);
    
    // Add some variation to the sound
    const playbackRate = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    source.playbackRate.value = playbackRate;
    
    source.start(0);
    console.log("Playing bell sound");
  };

  // =============== CLICK HANDLING ===============
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Function to handle clicks
  const handleClick = (event: MouseEvent) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray (only visible bells)
    const intersects = raycaster.intersectObjects(tableBellMeshes.filter(bell => bell.visible));
    
    if (intersects.length > 0) {
      const clickedBell = intersects[0].object;
      const bellId = clickedBell.userData.bellId;
      const seatId = clickedBell.userData.seatId;
      
      console.log(`Clicked bell ${bellId} (seat ${seatId})`);
      
      // Play bell sound
      playBellSound();
      
      // Animate the bell
      animateBellRing(clickedBell);
      
      // Dispatch custom event
      const bellEvent = new CustomEvent('bell-clicked', {
        detail: { 
          bellId: bellId,
          seatId: seatId,
          position: {
            x: clickedBell.position.x,
            y: clickedBell.position.y,
            z: clickedBell.position.z
          }
        }
      });
      window.dispatchEvent(bellEvent);
    }
  };

  // Function to animate bell ringing
  const animateBellRing = (bell: THREE.Object3D) => {
    const originalRotationZ = bell.rotation.z;
    const timeline = gsap.timeline();
    
    // Ring animation
    timeline.to(bell.rotation, {
      z: originalRotationZ + Math.PI * 0.15,
      duration: 0.08,
      ease: "power2.out"
    })
    .to(bell.rotation, {
      z: originalRotationZ - Math.PI * 0.1,
      duration: 0.06,
      ease: "power2.in"
    })
    .to(bell.rotation, {
      z: originalRotationZ + Math.PI * 0.05,
      duration: 0.04,
      ease: "power2.out"
    })
    .to(bell.rotation, {
      z: originalRotationZ,
      duration: 0.2,
      ease: "elastic.out(1, 0.5)"
    });
    
    // Add subtle bounce
    timeline.to(bell.position, {
      y: bell.position.y + 0.02,
      duration: 0.04,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    }, 0);
  };

  // LOAD TABLE BELLS - VISIBLE BY DEFAULT WITH TEXTURES
  loader.load("/bell.glb", 
    (gltf) => {
      console.log("Table bell GLB loaded successfully!");
      
      // Check if model has textures
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log("Mesh found:", child.name);
          console.log("Material:", child.material);
          
          // Fix material settings for better texture rendering
          if (child.material) {
            // Ensure material properties are set correctly
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
            
            // If material is MeshStandardMaterial or similar
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.roughness = 1.0;
              child.material.metalness = 0.5;
              child.material.envMapIntensity = 1.0;
            }
          }
        }
      });
      
      tableBellPositions.forEach((p, index) => {
        const bell = gltf.scene.clone(true);
        
        // NO scaling - keep original Blender scale
        bell.position.set(p.x, p.y, p.z);
        bell.rotation.set(
          THREE.MathUtils.degToRad(p.rot.x),
          THREE.MathUtils.degToRad(p.rot.y),
          THREE.MathUtils.degToRad(p.rot.z)
        );
        
        // BELLS ARE VISIBLE BY DEFAULT!
        bell.visible = true;
        
        bell.userData.bellId = index;
        bell.userData.seatId = index;
        
        tableBellMeshes.push(bell);
        scene.add(bell);
        
        console.log(`Bell ${index} added and visible at (${p.x}, ${p.y}, ${p.z})`);
      });

      console.log(`Loaded ${tableBellMeshes.length} table bells - ALL VISIBLE AND CLICKABLE`);
      
      // Initialize audio when bells are loaded
      initAudio();
      
      // Add click listener
      window.addEventListener('click', handleClick);
      
      // Add hover effect for better UX
      window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(tableBellMeshes.filter(bell => bell.visible));
        
        // Change cursor when hovering over a bell
        if (intersects.length > 0) {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = 'default';
        }
      });

      // Still listen to reservation updates if you want to hide/show later
      window.addEventListener("update-reservations", (e: any) => {
        const reservedSeatIds: number[] = e.detail;
        tableBellMeshes.forEach((bell) => {
          // Optional: You can comment this out if you want bells always visible
          // bell.visible = reservedSeatIds.includes(bell.userData.seatId);
        });
      });

      // Expose functions globally for testing
      (window as any).testBellSound = () => {
        playBellSound();
      };
      
      (window as any).ringBellById = (bellId: number) => {
        const bell = tableBellMeshes.find(b => b.userData.bellId === bellId);
        if (bell) {
          playBellSound();
          animateBellRing(bell);
        }
      };
    },
    // Progress callback
    (progress) => {
      console.log(`Loading bell: ${Math.round(progress.loaded / progress.total * 100)}%`);
    },
    // Error callback
    (error) => {
      console.error("Error loading bell.glb:", error);
      
      // Add a simple colored sphere as fallback so we can see SOMETHING
      console.log("Adding fallback bell (colored sphere)");
      
      tableBellPositions.forEach((p, index) => {
        const fallbackBell = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 16, 16),
          new THREE.MeshStandardMaterial({ 
            color: 0xffaa00, // Orange color
            metalness: 0.5,
            roughness: 0.5
          })
        );
        fallbackBell.position.set(p.x, p.y, p.z);
        fallbackBell.rotation.set(
          THREE.MathUtils.degToRad(p.rot.x),
          THREE.MathUtils.degToRad(p.rot.y),
          THREE.MathUtils.degToRad(p.rot.z)
        );
        fallbackBell.visible = true;
        fallbackBell.userData.bellId = index;
        fallbackBell.userData.seatId = index;
        fallbackBell.userData.isFallback = true;
        
        scene.add(fallbackBell);
        tableBellMeshes.push(fallbackBell);
      });
      
      // Initialize audio even with fallback bells
      initAudio();
      // Add click listener for fallback bells too
      window.addEventListener('click', handleClick);
    }
  );
  // =============== END TABLE BELLS ===============

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
  gsap.ticker.add(() => renderer.render(scene, camera));
};

export default initRestorant3D;