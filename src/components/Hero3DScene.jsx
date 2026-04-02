'use client';

import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const GamingSetup = () => {
  const screenRef = useRef();
  const fan1Ref = useRef();
  const fan2Ref = useRef();
  const keyboardGlowRef = useRef();
  const mouseRef = useRef();
  
  // Custom colors for Cyberpunk feel
  const colors = {
    cyan: new THREE.Color("#00f2ff"),
    purple: new THREE.Color("#7000ff"),
    magenta: new THREE.Color("#ff00f2"),
    neonGreen: new THREE.Color("#44d62c")
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // ─── CYBERPUNK SCREEN ANIMATION ───
    if (screenRef.current) {
      // Oscillate between Cyan, Purple, and Green
      const hue = (t * 0.1) % 1;
      const color1 = colors.cyan;
      const color2 = colors.purple;
      const mixFactor = (Math.sin(t * 0.5) + 1) / 2;
      
      screenRef.current.color.lerpColors(color1, color2, mixFactor);
      screenRef.current.emissive.copy(screenRef.current.color);
      screenRef.current.emissiveIntensity = 2.5 + Math.sin(t * 2) * 1;
    }

    // ─── FAN ROTATION & PULSE ───
    if (fan1Ref.current) {
        fan1Ref.current.rotation.z += 0.3;
        const s = 1 + Math.sin(t * 4) * 0.1;
        fan1Ref.current.scale.set(s, s, s);
    }
    if (fan2Ref.current) {
        fan2Ref.current.rotation.z += 0.3;
        const s = 1 + Math.sin(t * 4 + 0.5) * 0.1;
        fan2Ref.current.scale.set(s, s, s);
    }

    // ─── PERIPHERALS PULSE ───
    if (keyboardGlowRef.current) {
      const kHue = (t * 0.2) % 1;
      keyboardGlowRef.current.color.setHSL(kHue, 1, 0.5);
      keyboardGlowRef.current.emissive.copy(keyboardGlowRef.current.color);
    }
    
    if (mouseRef.current) {
      mouseRef.current.position.y = Math.sin(t * 5) * 0.015;
    }
  });

  return (
    <group position={[0, -0.8, 0]}>
      {/* ─── RIM LIGHTS FOR VISIBILITY ─── */}
      <pointLight position={[-4, 2, 2]} intensity={2.5} color="#00f2ff" />
      <pointLight position={[4, 2, 2]} intensity={2.5} color="#ff00f2" />
      <pointLight position={[0, 4, -2]} intensity={2} color="#7000ff" />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.1}>
        
        {/* ─── MONITOR ─── */}
        <group position={[0, 1.5, 0]}>
          {/* Bezel / Body */}
          <mesh>
            <boxGeometry args={[3.4, 1.9, 0.12]} />
            <meshStandardMaterial color="#f8f9fa" roughness={0.1} metalness={0.5} />
          </mesh>
          
          {/* SHARP EDGE RIM GLOW */}
          <mesh position={[0, 0, 0.065]}>
             <boxGeometry args={[3.42, 1.92, 0.01]} />
             <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={0.8} wireframe />
          </mesh>

          {/* Animated Screen */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[3.3, 1.8]} />
            <meshStandardMaterial 
              ref={screenRef}
              color="#00f2ff" 
              emissive="#00f2ff" 
              emissiveIntensity={2}
            />
          </mesh>

          {/* Stand */}
          <mesh position={[0, -1.2, -0.4]}>
            <cylinderGeometry args={[0.04, 0.1, 1.2]} />
            <meshStandardMaterial color="#eeeeee" metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.8, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.5, 1.1, 0.08]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
        </group>

        {/* ─── PC TOWER ─── */}
        <group position={[3.2, 0.8, -0.5]}>
          <mesh>
            <boxGeometry args={[1, 1.8, 1.6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.1} />
          </mesh>
          
          {/* NEON STRIPS ON EDGES */}
          <mesh position={[0.51, 0, 0]}>
             <boxGeometry args={[0.01, 1.82, 1.62]} />
             <meshStandardMaterial color="#ff00f2" emissive="#ff00f2" emissiveIntensity={3} wireframe />
          </mesh>

          {/* Internals via Window */}
          <mesh position={[-0.51, 0, 0]}>
            <boxGeometry args={[0.02, 1.7, 1.5]} />
            <meshStandardMaterial color="#fff" transparent opacity={0.2} metalness={1} roughness={0} />
          </mesh>
          
          {/* Glowing Fans */}
          <group position={[-0.2, 0.4, 0.5]} rotation={[0, Math.PI / 2, 0]} ref={fan1Ref}>
             <mesh>
                <ringGeometry args={[0.25, 0.35, 32]} />
                <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={10} side={THREE.DoubleSide} />
             </mesh>
          </group>
          <group position={[-0.2, -0.4, 0.5]} rotation={[0, Math.PI / 2, 0]} ref={fan2Ref}>
             <mesh>
                <ringGeometry args={[0.25, 0.35, 32]} />
                <meshStandardMaterial color="#ff00f2" emissive="#ff00f2" emissiveIntensity={10} side={THREE.DoubleSide} />
             </mesh>
          </group>

          {/* Internal GPU Glow */}
          <mesh position={[-0.1, 0, -0.1]}>
            <boxGeometry args={[0.6, 0.1, 1]} />
            <meshStandardMaterial color="#7000ff" emissive="#7000ff" emissiveIntensity={6} />
          </mesh>
        </group>

        {/* ─── PERIPHERALS ─── */}
        <group position={[0, 0.1, 1.4]}>
          {/* Keyboard */}
          <group rotation={[-Math.PI / 20, 0, 0]}>
            <mesh>
                <boxGeometry args={[2.8, 0.1, 0.9]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>
            <mesh position={[0, -0.06, 0]}>
                <planeGeometry args={[3, 1.1]} />
                <meshStandardMaterial ref={keyboardGlowRef} color="#44d62c" emissive="#44d62c" emissiveIntensity={12} transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Mouse */}
          <group position={[1.9, 0, -0.2]} ref={mouseRef}>
            <mesh>
                <capsuleGeometry args={[0.12, 0.25, 4, 12]} />
                <meshStandardMaterial color="#ffffff" shadowSide={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.08, 0.05]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial emissive="#00f2ff" emissiveIntensity={20} color="#fff" />
            </mesh>
          </group>
        </group>

        {/* Floor Reflection Surface */}
        <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.9} />
        </mesh>

      </Float>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 8.5]} fov={35} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
      
      <ambientLight intensity={0.2} />
      <spotLight position={[-10, 10, 10]} intensity={1} angle={0.2} penumbra={1} castShadow />
      
      {/* GLOBAL NEON GLOWS */}
      <rectAreaLight position={[-5, 5, -5]} width={10} height={10} intensity={0.8} color="#00f2ff" />
      <rectAreaLight position={[5, 5, -5]} width={10} height={10} intensity={0.8} color="#ff00f2" />

      <GamingSetup />
    </>
  );
};

const Hero3DScene = () => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Suspense fallback={null}>
        <Canvas shadows dpr={[1, 2]}>
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Hero3DScene;
