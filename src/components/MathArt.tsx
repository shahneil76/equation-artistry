import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

const MathArt = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    console.log('Initializing 3D scene');
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Increased intensity
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2); // Increased intensity
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1000;
    const positions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create butterfly pattern
    const createButterflyGeometry = () => {
      const parametricFunc = (u: number, v: number, target: THREE.Vector3) => {
        const theta = u * Math.PI * 2;
        const r = v * 5;

        const multiplier = Math.sin(2 * theta);
        const x = r * Math.cos(theta) * multiplier;
        const y = r * Math.sin(theta) * multiplier;
        const z = Math.sin(theta * 4) * 0.5;

        target.set(x, y, z);
      };

      return new ParametricGeometry(parametricFunc, 100, 50);
    };

    // Create multiple butterfly instances with different colors
    const colors = [
      0xff69b4, // Hot Pink (brighter than Deep Pink)
      0x00ff7f, // Spring Green (brighter than regular green)
      0x1e90ff, // Dodger Blue (brighter than Royal Blue)
      0xffd700, // Gold (brighter than orange)
      0xff00ff  // Magenta (brighter than Dark Violet)
    ];

    for (let i = 0; i < colors.length; i++) {
      const geometry = createButterflyGeometry();
      const material = new THREE.MeshPhongMaterial({
        color: colors[i],
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        opacity: 1, // Increased opacity
        emissive: colors[i], // Added emissive color
        emissiveIntensity: 0.5, // Makes it glow
        shininess: 100 // Makes it more reflective
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.z = (i * Math.PI) / colors.length;
      mesh.scale.multiplyScalar(0.8 + i * 0.1);
      scene.add(mesh);
      geometriesRef.current.push(geometry);
      materialsRef.current.push(material);
    }

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      controls.update();

      scene.rotation.z += 0.001;
      stars.rotation.z -= 0.0005;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('Cleaning up 3D scene');
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      geometriesRef.current.forEach(geometry => geometry.dispose());
      materialsRef.current.forEach(material => material.dispose());
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default MathArt;