import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    console.log('Initializing Sri Yantra scene');
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
    camera.position.z = 5;
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
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create stars background
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

    // Create Sri Yantra
    const createTriangle = (points: number[][]) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(points.flat());
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    };

    const colors = [
      0x9b87f5, // Primary Purple
      0x7E69AB, // Secondary Purple
      0x6E59A5, // Tertiary Purple
      0x8B5CF6, // Vivid Purple
      0xFFD700  // Gold
    ];

    // Create triangles for Sri Yantra
    const triangleSets = [
      // Outer triangle
      [[0, 2, 0], [-2, -2, 0], [2, -2, 0]],
      // Inner triangles (simplified for example)
      [[0, 1.5, 0], [-1.5, -1.5, 0], [1.5, -1.5, 0]],
      [[0, 1, 0], [-1, -1, 0], [1, -1, 0]],
      [[0, 0.5, 0], [-0.5, -0.5, 0], [0.5, -0.5, 0]],
      // Center point
      [[0, 0, 0], [-0.1, -0.1, 0], [0.1, -0.1, 0]]
    ];

    triangleSets.forEach((points, i) => {
      const geometry = createTriangle(points);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i],
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        opacity: 1,
        emissive: colors[i],
        emissiveIntensity: 0.5,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      geometriesRef.current.push(geometry);
      materialsRef.current.push(material);
    });

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
      console.log('Cleaning up Sri Yantra scene');
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