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
    console.log('Initializing traditional Sri Yantra scene');
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create background stars
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

    const createShape = (points: number[][]) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(points.flat());
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    };

    const colors = [
      0x9b87f5, // Primary Purple
      0x7E69AB, // Secondary Purple
      0x6E59A5, // Tertiary Purple
      0xFFD700, // Gold
      0x9333EA, // Deep Purple
      0xA855F7, // Bright Purple
      0xC084FC, // Light Purple
      0xE9D5FF  // Pale Purple
    ];

    // Create outer square border
    const borderSize = 3;
    const borderGeometry = new THREE.BufferGeometry();
    const borderVertices = new Float32Array([
      -borderSize, borderSize, 0,
      -borderSize, -borderSize, 0,
      borderSize, -borderSize, 0,
      borderSize, borderSize, 0,
      -borderSize, borderSize, 0,
    ]);
    borderGeometry.setAttribute('position', new THREE.BufferAttribute(borderVertices, 3));
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xFFD700 });
    const border = new THREE.Line(borderGeometry, borderMaterial);
    scene.add(border);

    // Create lotus petals
    const petalCount = 16;
    const petalRadius = 2.5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const nextAngle = ((i + 1) / petalCount) * Math.PI * 2;
      
      const petalTip = {
        x: Math.cos(angle) * petalRadius,
        y: Math.sin(angle) * petalRadius
      };
      
      const nextTip = {
        x: Math.cos(nextAngle) * petalRadius,
        y: Math.sin(nextAngle) * petalRadius
      };
      
      const controlPoint = {
        x: (petalTip.x + nextTip.x) * 0.5,
        y: (petalTip.y + nextTip.y) * 0.5
      };
      
      const petalGeometry = new THREE.BufferGeometry();
      const curve = new THREE.QuadraticBezierCurve(
        new THREE.Vector2(petalTip.x, petalTip.y),
        new THREE.Vector2(controlPoint.x * 1.3, controlPoint.y * 1.3),
        new THREE.Vector2(nextTip.x, nextTip.y)
      );
      
      const points = curve.getPoints(50);
      const petalVertices = new Float32Array(points.flatMap(p => [p.x, p.y, 0]));
      petalGeometry.setAttribute('position', new THREE.BufferAttribute(petalVertices, 3));
      
      const petalMaterial = new THREE.LineBasicMaterial({ color: 0xA855F7 });
      const petal = new THREE.Line(petalGeometry, petalMaterial);
      scene.add(petal);
      geometriesRef.current.push(petalGeometry);
      materialsRef.current.push(petalMaterial);
    }

    // Calculate proportions for authentic Sri Yantra
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseSize = 2;
    
    // Define the central Sri Yantra triangles
    const triangleSets = [
      // Four upward-pointing triangles
      [[0, baseSize, 0], [-baseSize * Math.sqrt(3)/2, -baseSize/2, 0], [baseSize * Math.sqrt(3)/2, -baseSize/2, 0]],
      [[0, baseSize * 0.7, 0], [-baseSize * 0.7 * Math.sqrt(3)/2, -baseSize * 0.7/2, 0], [baseSize * 0.7 * Math.sqrt(3)/2, -baseSize * 0.7/2, 0]],
      [[0, baseSize * 0.4, 0], [-baseSize * 0.4 * Math.sqrt(3)/2, -baseSize * 0.4/2, 0], [baseSize * 0.4 * Math.sqrt(3)/2, -baseSize * 0.4/2, 0]],
      [[0, baseSize * 0.2, 0], [-baseSize * 0.2 * Math.sqrt(3)/2, -baseSize * 0.2/2, 0], [baseSize * 0.2 * Math.sqrt(3)/2, -baseSize * 0.2/2, 0]],
      
      // Five downward-pointing triangles
      [[0, -baseSize * 0.85, 0], [baseSize * 0.85 * Math.sqrt(3)/2, baseSize * 0.85/2, 0], [-baseSize * 0.85 * Math.sqrt(3)/2, baseSize * 0.85/2, 0]],
      [[0, -baseSize * 0.55, 0], [baseSize * 0.55 * Math.sqrt(3)/2, baseSize * 0.55/2, 0], [-baseSize * 0.55 * Math.sqrt(3)/2, baseSize * 0.55/2, 0]],
      [[0, -baseSize * 0.3, 0], [baseSize * 0.3 * Math.sqrt(3)/2, baseSize * 0.3/2, 0], [-baseSize * 0.3 * Math.sqrt(3)/2, baseSize * 0.3/2, 0]],
      [[0, -baseSize * 0.15, 0], [baseSize * 0.15 * Math.sqrt(3)/2, baseSize * 0.15/2, 0], [-baseSize * 0.15 * Math.sqrt(3)/2, baseSize * 0.15/2, 0]],
      [[0, -baseSize * 0.05, 0], [baseSize * 0.05 * Math.sqrt(3)/2, baseSize * 0.05/2, 0], [-baseSize * 0.05 * Math.sqrt(3)/2, baseSize * 0.05/2, 0]],
      
      // Center bindu point
      [[0, 0.05, 0], [-0.05, -0.05, 0], [0.05, -0.05, 0]]
    ];

    triangleSets.forEach((points, i) => {
      const geometry = createShape(points);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        opacity: 1,
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.5,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      geometriesRef.current.push(geometry);
      materialsRef.current.push(material);
    });

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      scene.rotation.z += 0.001;
      stars.rotation.z -= 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

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