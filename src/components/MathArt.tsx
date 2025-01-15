import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
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
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create mathematical art
    const createParametricGeometry = () => {
      const geometry = new THREE.ParametricBufferGeometry(
        (u: number, v: number, target: THREE.Vector3) => {
          const phi = u * Math.PI * 2;
          const theta = v * Math.PI;
          const r = 5;

          // Combine multiple mathematical functions for interesting shapes
          const x = r * Math.sin(theta) * Math.cos(phi) * Math.sin(u * 5);
          const y = r * Math.sin(theta) * Math.sin(phi) * Math.cos(v * 5);
          const z = r * Math.cos(theta) * Math.sin(u * v * 3);

          target.set(x, y, z);
        },
        50,
        50
      );
      return geometry;
    };

    // Create multiple instances with different parameters
    for (let i = 0; i < 3; i++) {
      const geometry = createParametricGeometry();
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i * 0.3, 0.7, 0.5),
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = i * Math.PI / 6;
      scene.add(mesh);
      geometriesRef.current.push(geometry);
      materialsRef.current.push(material);
    }

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();

      // Animate materials
      materialsRef.current.forEach((material, index) => {
        if (material instanceof THREE.MeshPhongMaterial) {
          material.color.setHSL(
            ((Date.now() * 0.001 + index * 0.3) % 1),
            0.7,
            0.5
          );
        }
      });

      // Rotate scene
      scene.rotation.y += 0.001;
      
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