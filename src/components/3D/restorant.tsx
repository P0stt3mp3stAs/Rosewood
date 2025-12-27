// src/components/3D/restorant.tsx

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import gsap from "gsap";

type InitOptions = {
  onEnter?: () => void;
  onExit?: () => void;
};

interface CustomEventDetail {
  bellId?: number;
  seatId?: number;
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

interface UpdateReservationsEvent extends Event {
  detail: number[];
}

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
  
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  window.addEventListener("resize", () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 3);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

  const cameraPositions = [
    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } },// pos 0: initial
    { pos: new THREE.Vector3(-6.5, 3.5, -35.8), rot: { x: 0, y: 185, z: 0 } },// pos 1
    { pos: new THREE.Vector3(-3.3, 3.5, -34), rot: { x: 0, y: 180, z: 0 } },// pos 2
    { pos: new THREE.Vector3(-0.5, 3.5, -35.8), rot: { x: 0, y: 175, z: 0 } },// pos 3
    { pos: new THREE.Vector3(3.5, 3.5, -34), rot: { x: 0, y: 150, z: 0 } },// pos 4
    { pos: new THREE.Vector3(2, 1.5, -30.8), rot: { x: 0, y: 165, z: 0 } },// pos 5
    { pos: new THREE.Vector3(-1, 1.5, -30.8), rot: { x: 0, y: 165, z: 0 } },// pos 6
    { pos: new THREE.Vector3(-7.5, 1.5, -26.8), rot: { x: 0, y: 240, z: 0 } },// pos 7
    { pos: new THREE.Vector3(-8, 1.5, -23), rot: { x: 0, y: 270, z: 0 } },// pos 8
    { pos: new THREE.Vector3(-8, 1.5, -17), rot: { x: 0, y: 270, z: 0 } },// pos 9
    { pos: new THREE.Vector3(-8, 1.5, -13), rot: { x: 0, y: 310, z: 0 } },// pos 10
    { pos: new THREE.Vector3(1.2, 1.5, -15), rot: { x: 0, y: 35, z: 0 } },// pos 11
    { pos: new THREE.Vector3(-1, 1.5, -15), rot: { x: 0, y: 10, z: 0 } },// pos 12 
    { pos: new THREE.Vector3(-1, 1.5, -17), rot: { x: 0, y: 10, z: 0 } },// pos 13
    { pos: new THREE.Vector3(-1, 1.5, -19.2), rot: { x: 0, y: 10, z: 0 } },// pos 14
    { pos: new THREE.Vector3(-1, 1.5, -21), rot: { x: 0, y: 0, z: 0 } },// pos 15
    { pos: new THREE.Vector3(-1, 1.5, -25.5), rot: { x: 0, y: 170, z: 0 } },// pos 16
    { pos: new THREE.Vector3(1, 1.5, -26.6), rot: { x: 0, y: 130, z: 0 } },// pos 17
  ];

  let currentIndex = 0;
  let hasEntered = false;

  const goToPosition = (index: number) => {
    const target = cameraPositions[index];
    gsap.to(camera.position, { x: target.pos.x, y: target.pos.y, z: target.pos.z, duration: 1.5, ease: "power2.inOut" });
    gsap.to(camera.rotation, { x: THREE.MathUtils.degToRad(target.rot.x), y: THREE.MathUtils.degToRad(target.rot.y), z: THREE.MathUtils.degToRad(target.rot.z), duration: 1.5, ease: "power2.inOut" });
    
    // Dispatch event for mini map: camera position 1 = seat id:0, position 2 = seat id:1, etc.
    const seatId = index - 1;
    window.dispatchEvent(new CustomEvent('camera-position-changed', { detail: seatId }));
  };

  goToPosition(0);

  const loader = new GLTFLoader();
  
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);

  loader.load("/restorant3D.glb", (gltf) => {
    scene.add(gltf.scene);
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
      seat.userData = seat.userData || {};
      seat.userData.seatId = index;
      reservedMeshes.push(seat);
      scene.add(seat);
    });
  });

  const tableBellPositions = [
    { x: -6.25, y: 1.9, z: -33.9, rot: { x: 0, y: 0, z: 0 } },
    { x: -3.2, y: 1.9, z: -32.3, rot: { x: 0, y: 0, z: 0 } },
    { x: -0.5, y: 1.9, z: -33.9, rot: { x: 0, y: 0, z: 0 } }, //not clickable
    { x: 2.67, y: 1.9, z: -32.4, rot: { x: 0, y: -30, z: 0 } },
    { x: 1.1, y: -0.10, z: -29, rot: { x: 0, y: -30, z: 0 } }, //not clickable
    { x: -1.7, y: -0.10, z: -29, rot: { x: 0, y: -20, z: 0 } }, //not clickable
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

  let audioContext: AudioContext | null = null;
  let bellSoundBuffer: AudioBuffer | null = null;
  let isSoundLoaded = false;

  const initAudio = () => {
    if (audioContext) return;
    
    const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    
    audioContext = new AudioContextConstructor();
    
    fetch("/BellSound.mp3")
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        if (!audioContext) return;
        return audioContext.decodeAudioData(arrayBuffer);
      })
      .then(buffer => {
        if (buffer) {
          bellSoundBuffer = buffer;
          isSoundLoaded = true;
        }
      })
      .catch(error => {
        console.error("Error loading bell sound:", error);
      });
  };

  const playBellSound = () => {
    if (!audioContext || !bellSoundBuffer || !isSoundLoaded) {
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = bellSoundBuffer;
    source.connect(audioContext.destination);
    
    source.playbackRate.value = 1.0;
    
    source.start(0);
  };

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const getDateTimeFromUI = () => {
    const dateElement = document.getElementById('reservation-date') as HTMLInputElement;
    
    const fromHourElement = document.getElementById('time-from-hour') as HTMLSelectElement;
    const fromMinuteElement = document.getElementById('time-from-minute') as HTMLSelectElement;
    const toHourElement = document.getElementById('time-to-hour') as HTMLSelectElement;
    const toMinuteElement = document.getElementById('time-to-minute') as HTMLSelectElement;
    
    const date = dateElement?.value || '';
    const timeFrom = fromHourElement && fromMinuteElement 
      ? `${fromHourElement.value}:${fromMinuteElement.value}`
      : '';
    const timeTo = toHourElement && toMinuteElement
      ? `${toHourElement.value}:${toMinuteElement.value}`
      : '';
    
    return { date, timeFrom, timeTo };
  };

  const findBellFromObject = (object: THREE.Object3D): THREE.Object3D | null => {
    if (tableBellMeshes.includes(object)) {
      return object;
    }
    
    if (object.userData?.seatId !== undefined) {
      return object;
    }
    
    let current = object;
    while (current.parent) {
      current = current.parent;
      if (tableBellMeshes.includes(current) || current.userData?.seatId !== undefined) {
        return current;
      }
    }
    
    return null;
  };

  const handleClick = (event: MouseEvent) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      const bellObject = findBellFromObject(clickedObject);
      
      if (!bellObject) {
        return;
      }
      
      const bellId = bellObject.userData?.bellId;
      const seatId = bellObject.userData?.seatId;
      
      if (seatId === undefined) {
        console.error('Bell object does not have seatId in userData:', bellObject);
        alert('Error: This bell is not properly configured. Please try another table.');
        return;
      }
      
      playBellSound();
      
      animateBellRing(bellObject);
      
      const { date, timeFrom, timeTo } = getDateTimeFromUI();
      
      if (date && timeFrom && timeTo) {
        if (timeFrom === "00:00" && timeTo === "00:00") {
          alert('Please select valid time slots (not both 00:00)!');
          return;
        }
        
        const seatIdStr = seatId.toString();
        if (!seatIdStr && seatIdStr !== '0') {
          console.error('Cannot convert seatId to string:', seatId);
          alert('Error: Invalid seat ID. Please try another table.');
          return;
        }
        
        const queryParams = new URLSearchParams({
          seat_id: seatIdStr,
          date: date,
          from: timeFrom,
          to: timeTo
        });
        
        window.location.href = `/reserve?${queryParams.toString()}`;
        return;
      } else {
        console.warn('Date/time values are missing or incomplete');
        alert('Please select date and time first using the form on the page!');
      }
      
      const bellEvent = new CustomEvent<CustomEventDetail>('bell-clicked', {
        detail: { 
          bellId: bellId,
          seatId: seatId,
          position: {
            x: bellObject.position.x,
            y: bellObject.position.y,
            z: bellObject.position.z
          }
        }
      });
      window.dispatchEvent(bellEvent);
    }
  };

  const animateBellRing = (bell: THREE.Object3D) => {
    const originalRotationZ = bell.rotation.z;
    const timeline = gsap.timeline();
    
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
    
    timeline.to(bell.position, {
      y: bell.position.y + 0.02,
      duration: 0.04,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    }, 0);
  };

  const updateReservationVisibility = (reservedSeatIds: number[]) => {
    reservedMeshes.forEach((seat) => {
      const isReserved = reservedSeatIds.includes(seat.userData.seatId);
      seat.visible = isReserved;
    });
    
    tableBellMeshes.forEach((bell) => {
      const isReserved = reservedSeatIds.includes(bell.userData.seatId);
      bell.visible = !isReserved; 
    });
  };

  loader.load("/bell.glb", 
    (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
            
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
          isBell: true
        };
        
        bell.traverse((child) => {
          if (!child.userData) {
            child.userData = {};
          }
          child.userData.bellId = index;
          child.userData.seatId = index;
          child.userData.isBellPart = true;
        });
        
        tableBellMeshes.push(bell);
        scene.add(bell);
      });
      
      initAudio();
      
      window.addEventListener('click', handleClick);
      
      window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        let isHoveringBell = false;
        for (const intersect of intersects) {
          const bellObject = findBellFromObject(intersect.object);
          if (bellObject && bellObject.visible) {
            isHoveringBell = true;
            break;
          }
        }
        
        canvas.style.cursor = isHoveringBell ? 'pointer' : 'default';
      });

      window.addEventListener("update-reservations", (e: Event) => {
        const customEvent = e as UpdateReservationsEvent;
        const reservedSeatIds: number[] = customEvent.detail;
        updateReservationVisibility(reservedSeatIds);
      });

      (window as Window & { testBellSound?: () => void }).testBellSound = () => {
        playBellSound();
      };
      
      (window as Window & { ringBellById?: (bellId: number) => void }).ringBellById = (bellId: number) => {
        const bell = tableBellMeshes.find(b => b.userData.bellId === bellId);
        if (bell && bell.visible) {
          playBellSound();
          animateBellRing(bell);
        }
      };
      
      (window as Window & { updateReservations?: (seatIds: number[]) => void }).updateReservations = (seatIds: number[]) => {
        updateReservationVisibility(seatIds);
      };

      (window as Window & { testRedirect?: (seatId: number) => void }).testRedirect = (seatId: number) => {
        const queryParams = new URLSearchParams({
          seat_id: seatId.toString(),
          date: '2024-01-15',
          from: '18:00',
          to: '20:00'
        });
        window.location.href = `/reserve?${queryParams.toString()}`;
      };

      (window as Window & { debugBells?: () => void }).debugBells = () => {
        tableBellMeshes.forEach((bell) => {
          bell.traverse((child) => {
            return;
          });
        });
      };

      window.addEventListener('goto-camera-position', (e: Event) => {
        const customEvent = e as CustomEvent<number>;
        const targetPosition = customEvent.detail;
        
        if (targetPosition >= 0 && targetPosition < cameraPositions.length) {
          currentIndex = targetPosition;
          if (targetPosition > 0 && !hasEntered) {
            hasEntered = true;
            onEnter?.();
          }
          goToPosition(targetPosition);
        }
      });

    },
    undefined,
    (error) => {
      console.error("Error loading bell.glb:", error);
      
      tableBellPositions.forEach((p, index) => {
        const fallbackBell = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 16, 16),
          new THREE.MeshStandardMaterial({ 
            color: 0xffaa00,
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
        
        fallbackBell.userData = {
          bellId: index,
          seatId: index,
          isFallback: true
        };
        
        scene.add(fallbackBell);
        tableBellMeshes.push(fallbackBell);
      });
      
      initAudio();
      window.addEventListener('click', handleClick);
    }
  );

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